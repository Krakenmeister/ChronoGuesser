const hostname = "localhost";
const port = 7000;

const http = require("http");
const https = require("https");
const express = require("express");
const parser = require("body-parser");
const app = (module.exports = require("express")());
const path = require("path");
const axios = require("axios");
const fs = require("fs");
var download = require("download-file");
const exec = require("child_process").exec;
const json = require("big-json");
const Readable = require("stream").Readable;

const { v1: uuidv1, v4: uuidv4 } = require("uuid");

const server = require("http").Server(app);

const router = express.Router();
app.use(
  parser.urlencoded({
    extended: false,
    limit: "500mb",
  })
);
app.use(parser.json({ limit: "500mb" }));
app.use("/", express.static(path.join(__dirname, "/public")));
app.use("/assets", express.static(path.join(__dirname, "/public/assets")));
app.use("/assets/pspdfkit-lib", express.static(path.join(__dirname, "/public/assets/pspdfkit-lib")));
app.use("/", router);

function randomNum(min, max) {
  return min + Math.floor((max - min + 1) * Math.random());
}

function isLeapYear(year) {
  let isLeapYear = false;
  if (year % 4 == 0) {
    isLeapYear = true;
    if (year % 100 == 0) {
      isLeapYear = false;
      if (year % 400 == 0) {
        isLeapYear = true;
      }
    }
  }
  return isLeapYear;
}

async function fetchPage(newspaperUrl, pageIndex = -1) {
  let item = await axios.get(`${newspaperUrl}?fo=json&st=pdf`).catch((err) => {
    console.log(`ERROR: LoC API Request ${err}`);
  });

  let info = {
    date: item.data.item.date_issued,
    locId: item.data.item.library_of_congress_control_number,
  };
  let numPages = item.data.resources[0].files.length;
  let page = pageIndex;
  if (page == -1) {
    page = Math.floor(Math.random() * numPages);
    console.log(page);
  }
  for (let fileType = 0; fileType < item.data.resources[0].files[page].length; fileType++) {
    if (item.data.resources[0].files[page][fileType].mimetype == "image/jp2") {
      info.jp2 = item.data.resources[0].files[page][fileType].url;
    }
  }

  return info;
}

async function downloadFile(url, path) {
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "stream",
  });

  const writer = fs.createWriteStream(path);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function getRedacted(page) {
  let pdfId = `${page.locId}-${page.date}`;
  console.log("step 0");

  await downloadFile(page.jp2, path.join(__dirname, "processing", `${pdfId}-loc.jp2`));

  console.log("step 1");

  await new Promise((resolve, reject) => {
    exec(`python3 ocr.py ${pdfId}`, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      } else if (stdout) {
        console.log(stdout);
      }
      resolve(stdout ? stdout : stderr);
    });
  });

  console.log("step 2");

  let redactPromise = new Promise((resolve, reject) => {
    exec(`python3 redact.py ${pdfId}`, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      } else if (stdout) {
        console.log(stdout);
      }
      resolve(stdout ? stdout : stderr);
    });
  });

  await redactPromise;

  console.log("step 3");
  return pdfId;
}

async function fetchNewspaper(language = "english", region = "na") {
  // Pick a random year
  let year = randomNum(1790, 1963);
  // Pick a random month
  let month = randomNum(1, 12);
  let monthIssues = await axios
    .get(
      `https://www.loc.gov/collections/chronicling-america` +
        `?fo=json` +
        `&at=results` +
        `&dl=issue` +
        `&fa=original-format:newspaper|online-format:pdf|language:${language}` +
        `&dates=${year}-${month}` +
        `&c=500` +
        `&sp=1`
    )
    .catch((err) => {
      console.log(`ERROR: LoC API Request ${err}`);
    });

  if (monthIssues.data.results.length == 0) {
    console.log(`ERROR: No newspapers found for year: ${year}, month: ${month}`);
    return 0;
  }

  if (monthIssues.data.results.length < 500) {
    // Less than one page of results, we don't need to pick a day
    let issue = randomNum(0, monthIssues.data.results.length - 1);
    console.log(monthIssues.data.results[issue].id);
    return monthIssues.data.results[issue].id;
  }

  const RETRYCOUNT = 10;
  for (let i = 0; i < RETRYCOUNT; i++) {
    // Pick a random day
    let day;
    if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
      day = randomNum(1, 31);
    } else if (month != 2) {
      day = randomNum(1, 30);
    } else {
      if (isLeapYear(year)) {
        day = randomNum(1, 29);
      } else {
        day = randomNum(1, 28);
      }
    }

    let dayIssues = await axios.get(
      `https://www.loc.gov/collections/chronicling-america` +
        `?fo=json` +
        `&at=results` +
        `&sb=date` +
        `&dl=issue` +
        `&fa=original-format:newspaper|online-format:pdf|language:${language}` +
        `&dates=${year}-${month}-${day}` +
        `&c=500` +
        `&sp=1`
    );

    if (dayIssues.data.results.length > 0 && dayIssues.data.results.length < 500) {
      let issue = randomNum(0, dayIssues.data.results.length - 1);
      console.log(dayIssues.data.results[issue].id);
      return dayIssues.data.results[issue].id;
    }
  }

  console.log(`ERROR: No newspapers found for year: ${year}, month: ${month} when selecting day`);
  return 0;
}

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/html/game.html"));
});

router.post("/play", async (req, res) => {
  let numPapers = parseInt(req.body.numPapers);
  let timeLimit = parseInt(req.body.timeLimit);

  res.setHeader("Content-Type", "application/json");

  let pdfData = [];
  fs.readdir(path.join(__dirname, "/newspapers"), (err, files) => {
    if (err) {
      console.log(err);
    } else {
      // Collect unique random filenames
      let filenames = [];
      for (let i = 0; i < numPapers; i++) {
        if (files.length == 0) {
          console.log("Error: Ran out of files to send!");
        } else {
          let randIndex = Math.floor(Math.random() * files.length);
          filenames.push(files[randIndex]);
          files.splice(randIndex, 1);
        }
      }

      // Read the data from pdfs
      for (let i = 0; i < filenames.length; i++) {
        fs.readFile(path.join(__dirname, "/newspapers", filenames[i]), (err, data) => {
          // Send the pdf data to client
          if (err) {
            console.log(err);
          } else {
            let fileParts = filenames[i].replace(".pdf", "").split("-");
            pdfData.push({
              pdf: new Buffer.from(data).toString("base64"),
              locId: fileParts[0],
              date: {
                year: fileParts[1],
                month: fileParts[2],
                day: fileParts[3],
              },
            });
          }

          if (pdfData.length >= numPapers) {
            const stringifyStream = json.createStringifyStream({
              body: pdfData,
            });

            stringifyStream.pipe(res);
          }
        });
      }
    }
  });
});

router.post("/page", async (req, res) => {
  let newspaper = await fetchNewspaper();
  let info = await fetchPage(newspaper);

  let reqId = await getRedacted(info);
  fs.readFile(`./newspapers/${reqId}.pdf`, (err, data) => {
    if (err) {
      res.status(500).send(err);
    }
    res.contentType("application/pdf").send(`data:application/pdf;base64,${new Buffer.from(data).toString("base64")}`);
  });
});

module.exports = {
  router: router,
};

server.listen(port);
