const path = require("path");
const axios = require("axios");
const fs = require("fs");

const MAX_NEWSPAPERS = 100;
const SIMULTANEOUS_CALLS = 3;

async function generateNewspapers() {
  while (true) {
    let promises = [];
    for (let i = 0; i < SIMULTANEOUS_CALLS; i++) {
      promises.push(axios.post("http://krakenmeister.com:7000/page"));
    }
    await Promise.all(promises)
      .then((pdfs) => {})
      .catch((err) => {});

    let files = await fs.promises.readdir(path.join(__dirname, "/newspapers"));
    files = files
      .map((fileName) => ({
        name: fileName,
        time: fs.statSync(path.join(__dirname, "/newspapers", fileName)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time)
      .map((file) => file.name);

    if (files.length > MAX_NEWSPAPERS) {
      promises = [];
      for (let i = 0; i < SIMULTANEOUS_CALLS; i++) {
        promises.push(fs.promises.unlink(path.join(__dirname, "/newspapers", files[i])));
      }
      await Promise.all(promises);
    }
  }
}

generateNewspapers();
