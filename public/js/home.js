let currentPaper;
let guesses;

let colonialBG;
let antebellumBG;
let victorianBG;
let suburbanBG;

let colonialFrames;
let antebellumFrames;
let victorianFrames;
let suburbanFrames;

let ridingFrames;
let throwingFrames;
let movingFrames;

function home() {
  document.getElementById("homeWrapper").innerHTML = `
    <div id="buttonWrapper">
      <button class="homeButton" id="playButton">Play</button>
      <button class="homeButton" id="aboutButton">About</button>
    </div>
  `;

  document.getElementById("playButton").addEventListener("click", () => {
    play();
  });
  document.getElementById("aboutButton").addEventListener("click", () => {
    about();
  });
}

function about() {
  document.getElementById("homeWrapper").innerHTML = `
    <div id="aboutWrapper">
      <p id="aboutText">
        Hello
      </p>
      <button class="homeButton" id="homeButton">Back</button>
    </div>
  `;

  document.getElementById("homeButton").addEventListener("click", () => {
    home();
  });
}

function play() {
  document.getElementById("homeWrapper").innerHTML = `
    <div id="playWrapper">
      <div id="optionsWrapper">
        <div class="optionWrapper">
          <label for="numPapers">Number of Papers:</label>
          <input type="number" id="numPapers" name="numPapers" min="1" max="10" value="5">
        </div>
        <div class="optionWrapper">
          <label for="timeLimit">Time Limit:</label>
          <select id="timeLimit" name="timeLimit">
            <option value="0">None</option>
            <option value="60">1 Minute</option>
            <option value="300">5 Minutes</option>
            <option value="600">10 Minutes</option>
            <option value="1200">20 Minutes</option>
          </select>
        </div>
      </div>
      <div id="playButtonsWrapper">
        <button class="formButton" id="playButton">Play</button>
        <button class="formButton" id="homeButton">Back</button>
      </div>
    </div>
  `;

  document.getElementById("playButton").addEventListener("click", () => {
    startGame(document.getElementById("numPapers").value, document.getElementById("timeLimit").value);
  });

  document.getElementById("homeButton").addEventListener("click", () => {
    home();
  });
}

async function startGame(numPapers, timeLimit) {
  document.getElementById("homeWrapper").innerHTML = `
    <div id="loadingScreen">
      THIS IS A LOADING SCREEN!
    </div>
    <div id="pdfWrapper" style="display:none">
      <button id="guessButton">Deliver</button>
    </div>
  `;

  let assetPromises = [];
  assetPromises.push(axios.post("/play", { numPapers: numPapers, timeLimit: timeLimit }));
  if (!colonialBG) {
    assetPromises.push(loadImage(`./img/bg_house_colonial.png`));
    assetPromises.push(loadImage(`./img/bg_house_antebellum.png`));
    assetPromises.push(loadImage(`./img/bg_house_victorian.png`));
    assetPromises.push(loadImage(`./img/bg_house_suburban.png`));
    for (let i = 0; i < 38; i++) {
      assetPromises.push(loadImage(`./img/animations/delivery_colonial/frame_${i}.png`));
    }
    for (let i = 0; i < 38; i++) {
      assetPromises.push(loadImage(`./img/animations/delivery_antebellum/frame_${i}.png`));
    }
    for (let i = 0; i < 38; i++) {
      assetPromises.push(loadImage(`./img/animations/delivery_victorian/frame_${i}.png`));
    }
    for (let i = 0; i < 38; i++) {
      assetPromises.push(loadImage(`./img/animations/delivery_suburban/frame_${i}.png`));
    }
    for (let i = 0; i < 16; i++) {
      assetPromises.push(loadImage(`./img/animations/riding/frame_${i}.png`));
    }
    for (let i = 0; i < 32; i++) {
      assetPromises.push(loadImage(`./img/animations/throwing/frame_${i}.png`));
    }
    for (let i = 0; i < 14; i++) {
      assetPromises.push(loadImage(`./img/animations/moving/frame_${i}.png`));
    }
  }

  let documents;
  await Promise.all(assetPromises).then((assets) => {
    documents = assets[0].data;
    if (!colonialBG) {
      colonialBG = assets[1];
      antebellumBG = assets[2];
      victorianBG = assets[3];
      suburbanBG = assets[4];
      colonialFrames = assets.slice(5, 43);
      antebellumFrames = assets.slice(43, 81);
      victorianFrames = assets.slice(81, 119);
      suburbanFrames = assets.slice(119, 157);
      ridingFrames = assets.slice(157, 173);
      throwingFrames = assets.slice(173, 205);
      movingFrames = assets.slice(205, 219);
    }
  });

  if (documents.length != numPapers) {
    console.log("Didn't receive enough papers!");
    return;
  }

  let blobUrls = [];
  for (let i = 0; i < numPapers; i++) {
    blobUrls.push(processPdf(documents[i].pdf));
  }

  for (let i = 0; i < blobUrls.length; i++) {
    loadPdf(blobUrls[i], i);
  }

  currentPaper = 0;
  guesses = [];
  document.getElementById("loadingScreen").remove();
  document.getElementById("pdfWrapper").style.display = "block";
  document.getElementById(`newspaper${currentPaper}`).style.visibility = "visible";
  document.getElementById("guessButton").focus();

  document.getElementById("guessButton").addEventListener("click", async () => {
    let guessWrapper = document.createElement("div");
    guessWrapper.id = "guessWrapper";
    guessWrapper.innerHTML = `
        <div id="guessBox">
          <div id="guessContent">
            <div id="guessInputs">
              <div class="guessInput">
                <label for="guessDay">Day:</label>
                <input type="number" class="guessInputValue" id="guessDay" name="guessDay" min="1" max="31" value="1">
              </div>
              <div class="guessInput">
                <label for="guessMonth">Month:</label>
                <input type="number" class="guessInputValue" id="guessMonth" name="guessMonth" min="1" max="12" value="1">
              </div>
              <div class="guessInput">
                <label for="guessYear">Year:</label>
                <input type="number" class="guessInputValue" id="guessYear" name="guessYear" min="1790" max="1963" value="1790">
              </div>
            </div>
            <div id="guessButtons">
              <canvas id="boyAnimation" width="1920" height="1080"></canvas>
              <button id="cancelGuessButton">Cancel</button>
              <button id="submitGuessButton">Deliver</button>
            </div>
          </div>
          <img id="scrollLeft" src="../img/scroll_left.png">
          <img id="scrollRight" src="../img/scroll_right.png">
        </div>
      `;

    document.getElementById("pdfWrapper").appendChild(guessWrapper);
    document.getElementById("guessDay").focus();

    let ctx = document.getElementById("boyAnimation").getContext("2d");
    let animationFrame = 0;
    let startThrowFlag = -1;

    let ridingAnimation = setInterval(() => {
      if (startThrowFlag > 0 && animationFrame == 0) {
        clearInterval(ridingAnimation);
        let throwingAnimation = setInterval(async () => {
          ctx.clearRect(0, 0, 1920, 1080);
          ctx.drawImage(throwingFrames[animationFrame], 0, 0, 1920, 1080);
          animationFrame = (animationFrame + 1) % 32;
          if (animationFrame == 0) {
            clearInterval(throwingAnimation);
            document.getElementById("guessWrapper").remove();
            document.getElementById(`newspaper${currentPaper}`).style.visibility = "hidden";
            currentPaper++;

            let guessYear = parseInt(guesses[guesses.length - 1].year);
            if (guessYear < 1830) {
              await playDeliveryAnimation(0);
            } else if (guessYear < 1870) {
              await playDeliveryAnimation(1);
            } else if (guessYear < 1940) {
              await playDeliveryAnimation(2);
            } else {
              await playDeliveryAnimation(3);
            }

            if (currentPaper == numPapers) {
              // End game
              let score = 0;
              let scores = [];
              for (let i = 0; i < numPapers; i++) {
                let actualDate = dateToDecimal(parseInt(documents[i].date.year), parseInt(documents[i].date.month), parseInt(documents[i].date.day));
                let guessedDate = dateToDecimal(parseInt(guesses[i].year), parseInt(guesses[i].month), parseInt(guesses[i].day));
                let thisScore = calculateScore(guessedDate, actualDate);
                score += thisScore;
                scores.push(thisScore);
              }
              document.getElementById("homeWrapper").innerHTML = `
                  <div id="scoreWrapper">
                    <div id="scoreTitle">You scored ${score} out of ${1000 * numPapers}</div>
                    <div id="papersWrapper"></div>
                    <div id="continueButtons">
                      <button id="homeButton">Home</button>
                      <button id="replayButton">Play Again</button>
                    </div>
                  </div>
                `;

              for (let i = 0; i < numPapers; i++) {
                document.getElementById("papersWrapper").innerHTML += `
                    <div class="paperWrapper">
                      <div class="paperTitle"></div>
                      <div class="paperDate"></div>
                      <div class="guessDate"></div>
                      <div class="paperScore"></div>
                    </div>
                  `;
              }

              document.getElementById("homeButton").addEventListener("click", () => {
                home();
              });

              document.getElementById("replayButton").addEventListener("click", () => {
                startGame(numPapers, timeLimit);
              });
            } else {
              document.getElementById(`newspaper${currentPaper}`).style.visibility = "visible";
              document.getElementById("guessButton").focus();
            }
          }
        }, 35);
      } else {
        if (startThrowFlag != -1 && animationFrame == 0) {
          if (startThrowFlag == 0) {
            document.getElementById("boyAnimation").style.animation = "rideRight 2s linear";
          }
          startThrowFlag++;
        }
        if (startThrowFlag > 0) {
          ctx.clearRect(0, 0, 1920, 1080);
          ctx.drawImage(movingFrames[animationFrame], 0, 0, 1920, 1080);
          animationFrame = (animationFrame + 1) % 14;
        } else {
          ctx.clearRect(0, 0, 1920, 1080);
          ctx.drawImage(ridingFrames[animationFrame], 0, 0, 1920, 1080);
          animationFrame = (animationFrame + 1) % 16;
        }
      }
    }, 35);

    document.getElementById("guessContent").style.animation = "revealBody 0.7s ease-out";
    document.getElementById("scrollLeft").style.animation = "unfurlLeft 0.7s ease-out";
    document.getElementById("scrollRight").style.animation = "unfurlRight 0.7s ease-out";
    await delay(700);
    document.getElementById("guessContent").style.animation = "";
    document.getElementById("scrollLeft").style.animation = "";
    document.getElementById("scrollRight").style.animation = "";

    document.getElementById("cancelGuessButton").addEventListener("click", async () => {
      document.getElementById("guessContent").style.animation = "revealBody 0.4s ease-in reverse forwards";
      document.getElementById("scrollLeft").style.animation = "unfurlLeft 0.4s ease-in reverse forwards";
      document.getElementById("scrollRight").style.animation = "unfurlRight 0.4s ease-in reverse forwards";
      await delay(400);
      document.getElementById("guessWrapper").remove();
      document.getElementById("guessButton").focus();
    });

    document.getElementById("submitGuessButton").addEventListener("click", async () => {
      guesses.push({
        year: document.getElementById("guessYear").value,
        month: document.getElementById("guessMonth").value,
        day: document.getElementById("guessDay").value,
      });

      document.getElementById("cancelGuessButton").style.visibility = "hidden";
      document.getElementById("submitGuessButton").style.visibility = "hidden";
      startThrowFlag = 0;
    });
  });
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.src = url;
  });
}

async function playDeliveryAnimation(animationEnum) {
  document.getElementById("homeWrapper").style.display = "none";

  let animationWrapper = document.createElement("div");
  animationWrapper.id = "animationWrapper";
  animationWrapper.innerHTML = `
    <canvas id="animationCanvas" width="1920" height="1080"></canvas>
  `;

  document.getElementsByTagName("body")[0].appendChild(animationWrapper);
  let ctx = document.getElementById("animationCanvas").getContext("2d");

  let frames;
  let bg;
  switch (animationEnum) {
    case 0:
      frames = colonialFrames;
      bg = colonialBG;
      break;
    case 1:
      frames = antebellumFrames;
      bg = antebellumBG;
      break;
    case 2:
      frames = victorianFrames;
      bg = victorianBG;
      break;
    case 3:
      frames = suburbanFrames;
      bg = suburbanBG;
      break;
  }

  ctx.drawImage(bg, 0, 0, 1920, 1080);
  ctx.drawImage(frames[0], 0, 0, 1920, 1080);
  await delay(1000);

  for (let i = 0; i < frames.length; i++) {
    ctx.drawImage(bg, 0, 0, 1920, 1080);
    ctx.drawImage(frames[i], 0, 0, 1920, 1080);
    await delay(35);
  }

  await delay(500);

  document.getElementById("animationWrapper").remove();
  document.getElementById("homeWrapper").style.display = "flex";
}

function calculateScore(guessedDate, actualDate) {
  let dateDifference = Math.abs(guessedDate - actualDate);
  let score = 0;
  if (dateDifference <= 1) {
    score = 100 - 10 * dateDifference;
  } else if (dateDifference <= 25) {
    score = 92 - 2 * dateDifference;
  } else if (dateDifference <= 50) {
    score = 67 - dateDifference;
  } else if (dateDifference <= 152) {
    score = 25 + 1 / 3 - dateDifference / 6;
  } else {
    score = 0;
  }
  score = Math.round(score * 10);
  return score;
}

const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

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

function dateToDecimal(year, month, day) {
  let yearDays = 365;
  let monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (isLeapYear(year)) {
    monthDays[1] = 29;
    yearDays = 366;
  }

  let decimal = year;
  let daysInYear = 0;
  for (let i = 0; i < month - 1; i++) {
    daysInYear += monthDays[i];
  }
  daysInYear += day - 1;
  decimal += daysInYear / yearDays;

  return decimal;
}

function loadPdf(blobUrl, index) {
  let newspaperPdf = document.createElement("embed");
  newspaperPdf.type = "application/pdf";
  newspaperPdf.src = `${blobUrl}#view=FitH&navpanes=0&scrollbar=0`;
  newspaperPdf.className = "newspaperPdf";
  newspaperPdf.id = `newspaper${index}`;
  newspaperPdf.style.visibility = "hidden";

  document.getElementById("pdfWrapper").appendChild(newspaperPdf);
}

function processPdf(base64String) {
  let binary = atob(base64String.replace(/\s/g, ""));
  let len = binary.length;
  let buffer = new ArrayBuffer(len);
  let view = new Uint8Array(buffer);
  for (var i = 0; i < len; i++) {
    view[i] = binary.charCodeAt(i);
  }

  let blob = new Blob([view], { type: "application/pdf" });

  let blobUrl = URL.createObjectURL(blob);

  return blobUrl;
}

home();

// let delivering = false;
// window.addEventListener("keydown", (event) => {
//   if (event.key == "Enter") {
//     if (document.getElementById("cancelGuessButton")) {
//       if (document.activeElement !== document.getElementById("cancelGuessButton")) {
//         delivering = true;
//       }
//     }
//   }
// });

// window.addEventListener("keyup", (event) => {
//   if (event.key == "Enter") {
//     if (document.getElementById("submitGuessButton") && delivering) {
//       document.getElementById("submitGuessButton").click();
//     }
//     delivering = false;
//   }
// });
