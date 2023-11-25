// Settings
let cutscenes = true;
let toolbar = true;
let musicVolume = 0;
let effectsVolume = 50;

// Global variables
let currentPaper;
let guesses;

let mainMenuResizeObserver;

// Main menu assets
let unfurlFrames;
let numberFrames;
let clockFrames;
let mainBG;
let mainBGLoading;

// Game assets
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

let chronoPaper;
let scoringBG;
let newsboyWin0;
let newsboyWin1;
let newsboyWin2;

const headlines = [
  ["Newspaper Mix-Up Has Paradoxical Consequences", "New York Times Delivered to Old York Times"],
  ["New Delivery Service Travels Through Time", "Neither Snow Nor Rain Nor Time of Old"],
  ["Wonder Boy Helps Americans Around the Clock", "The Meteoric Rise of Chrono News Boy"],
];

async function home() {
  let assetPromises = [];
  if (!mainBG) {
    assetPromises.push(loadImage(`./img/bg_main.png`));
    assetPromises.push(loadImage(`./img/bg_main_loading.png`));
    for (let i = 0; i < 5; i++) {
      assetPromises.push(loadImage(`./img/animations/unfurl/frame_${i}.png`));
    }
    for (let i = 0; i < 4; i++) {
      assetPromises.push(loadImage(`./img/animations/number_dial/frame_${i}.png`));
    }
    for (let i = 0; i < 32; i++) {
      assetPromises.push(loadImage(`./img/animations/clock_hands/frame_${i}.png`));
    }
  }

  await Promise.all(assetPromises).then((assets) => {
    if (!mainBG) {
      mainBG = assets[0];
      mainBGLoading = assets[1];
      unfurlFrames = assets.slice(2, 7);
      numberFrames = assets.slice(7, 11);
      clockFrames = assets.slice(11, 43);
    }
  });

  document.getElementById("homeWrapper").innerHTML = `
    <div id="canvasWrapper">
      <canvas id="mainMenuCanvas" width="1920" height="1080" aria-label="Main menu background" role="img"></canvas>
      <div id="homeTitle"><p>ChronoGuesser</p></div>
      <div id="playScroll">
        <div id="playScrollContent">
          <button class="homeScrollButton" id="playButton">Play</button>
        </div>
        <img class="scrollEdge" id="playScrollLeft" src="../img/scroll_left.png" alt="Background scroll">
        <img class="scrollEdge" id="playScrollRight" src="../img/scroll_right.png" alt="Background scroll">
      </div>
      <div id="settingsScroll">
        <div id="settingsScrollContent">
          <button class="homeScrollButton" id="settingsButton">Settings</button>
        </div>
        <img class="scrollEdge" id="settingsScrollLeft" src="../img/scroll_left.png" alt="Background scroll">
        <img class="scrollEdge" id="settingsScrollRight" src="../img/scroll_right.png" alt="Background scroll">
      </div>
    </div>
  `;

  resizeText();
  mainMenuResizeObserver = new ResizeObserver(resizeText);
  mainMenuResizeObserver.observe(document.getElementById("canvasWrapper"));

  let ctx = document.getElementById("mainMenuCanvas").getContext("2d");
  ctx.drawImage(mainBG, 0, 0, 1920, 1080);
  ctx.drawImage(clockFrames[0], 0, 0, 1920, 1080);
  ctx.drawImage(unfurlFrames[0], 0, 0, 1920, 1080);

  document.getElementById("playButton").addEventListener("click", () => {
    scrollSound.currentTime = 0;
    scrollSound.play();
    play();
  });
  document.getElementById("settingsButton").addEventListener("click", () => {
    scrollSound.currentTime = 0;
    scrollSound.play();
    settings();
  });
}

async function settings() {
  transitionSettingsButton(1);

  if (document.getElementById("homeTitle")) {
    document.getElementById("homeTitle").remove();
  } else {
    transitionPlayButton(0);
    let ctx = document.getElementById("mainMenuCanvas").getContext("2d");
    for (let i = 4; i >= 0; i--) {
      ctx.drawImage(mainBG, 0, 0, 1920, 1080);
      ctx.drawImage(clockFrames[0], 0, 0, 1920, 1080);
      ctx.drawImage(unfurlFrames[i], 0, 0, 1920, 1080);
      if (i == 0) {
        document.getElementById("playWrapper").style.visibility = "hidden";
      } else if (i == 1) {
        document.getElementById("playWrapper").style.transform = `translateY(60%)`;
        document.getElementById("playWrapper").style.clipPath = `inset(0 0 90% 0)`;
        document.getElementById("playWrapper").style.visibility = "visible";
      } else {
        document.getElementById("playWrapper").style.transform = `translateY(${10 * (4 - i)}%)`;
        document.getElementById("playWrapper").style.clipPath = `inset(0 0 ${20 * (4 - i)}% 0)`;
        document.getElementById("playWrapper").style.visibility = "visible";
      }
      await delay(75);
    }
    document.getElementById("playWrapper").remove();
  }

  let settingsWrapper = document.createElement("div");
  settingsWrapper.id = "settingsWrapper";
  settingsWrapper.innerHTML = `
    <div id="optionsWrapper">
      <div class="optionWrapperRow">
        <label for="cutscenes">Cutscenes:</label>
        <input type="checkbox" id="cutscenes" name="cutscenes" checked />
      </div>
      <div class="optionWrapperRow">
        <label for="toolbar">PDF Toolbar:</label>
        <input type="checkbox" id="toolbar" name="toolbar" checked />
      </div>
      <div class="optionWrapper">
        <label for="musicVolume">Music Volume:</label>
        <input type="range" id="musicVolume" name="musicVolume" min="0" max="100" value="0" />
      </div>
      <div class="optionWrapper">
        <label for="effectsVolume">Effects Volume:</label>
        <input type="range" id="effectsVolume" name="effectsVolume" min="0" max="100" value="50" />
      </div>
    </div>
  `;
  document.getElementById("canvasWrapper").appendChild(settingsWrapper);
  document.getElementById("cutscenes").checked = cutscenes;
  document.getElementById("toolbar").checked = toolbar;
  document.getElementById("musicVolume").value = musicVolume;
  document.getElementById("effectsVolume").value = effectsVolume;
  document.getElementById("cutscenes").addEventListener("change", (event) => {
    if (event.currentTarget.checked) {
      cutscenes = true;
    } else {
      cutscenes = false;
    }
  });
  document.getElementById("toolbar").addEventListener("change", (event) => {
    if (event.currentTarget.checked) {
      toolbar = true;
    } else {
      toolbar = false;
    }
  });
  document.getElementById("musicVolume").addEventListener("change", (event) => {
    musicVolume = event.currentTarget.value;
    menuMusic.volume = musicVolume / 100;
  });
  document.getElementById("effectsVolume").addEventListener("change", (event) => {
    effectsVolume = event.currentTarget.value;
    scrollSound.volume = effectsVolume / 100;
    clockSound.volume = effectsVolume / 100;
    gearSound.volume = effectsVolume / 1000;
  });
  resizeText();

  let ctx = document.getElementById("mainMenuCanvas").getContext("2d");
  for (let i = 0; i < 5; i++) {
    ctx.drawImage(mainBG, 0, 0, 1920, 1080);
    ctx.drawImage(clockFrames[0], 0, 0, 1920, 1080);
    ctx.drawImage(unfurlFrames[i], 0, 0, 1920, 1080);
    if (i == 0) {
      document.getElementById("settingsWrapper").style.visibility = "hidden";
    } else if (i == 1) {
      document.getElementById("settingsWrapper").style.transform = `translateY(60%)`;
      document.getElementById("settingsWrapper").style.clipPath = `inset(0 0 90% 0)`;
      document.getElementById("settingsWrapper").style.visibility = "visible";
    } else {
      document.getElementById("settingsWrapper").style.transform = `translateY(${10 * (4 - i)}%)`;
      document.getElementById("settingsWrapper").style.clipPath = `inset(0 0 ${20 * (4 - i)}% 0)`;
      document.getElementById("settingsWrapper").style.visibility = "visible";
    }
    await delay(75);
  }
  settingsWrapper.style.clipPath = "";
}

async function transitionSettingsButton(direction) {
  document.getElementById("settingsScrollContent").style.animation = "revealBody 0.2s ease-in reverse forwards";
  document.getElementById("settingsScrollLeft").style.animation = "unfurlHomeLeft 0.2s ease-in reverse forwards";
  document.getElementById("settingsScrollRight").style.animation = "unfurlHomeRight 0.2s ease-in reverse forwards";
  await delay(200);
  document.getElementById("settingsScrollContent").style.animation = "";
  document.getElementById("settingsScrollLeft").style.animation = "";
  document.getElementById("settingsScrollRight").style.animation = "";

  let oldButton = document.getElementById("settingsButton");
  let newButton = oldButton.cloneNode(true);
  oldButton.parentNode.replaceChild(newButton, oldButton);
  if (direction == 1) {
    newButton.textContent = "Back";
    newButton.addEventListener("click", async () => {
      scrollSound.currentTime = 0;
      scrollSound.play();
      transitionSettingsButton(0);
      let ctx = document.getElementById("mainMenuCanvas").getContext("2d");
      for (let i = 4; i >= 0; i--) {
        ctx.drawImage(mainBG, 0, 0, 1920, 1080);
        ctx.drawImage(clockFrames[0], 0, 0, 1920, 1080);
        ctx.drawImage(unfurlFrames[i], 0, 0, 1920, 1080);
        if (i == 0) {
          document.getElementById("settingsWrapper").style.visibility = "hidden";
        } else if (i == 1) {
          document.getElementById("settingsWrapper").style.transform = `translateY(60%)`;
          document.getElementById("settingsWrapper").style.clipPath = `inset(0 0 90% 0)`;
          document.getElementById("settingsWrapper").style.visibility = "visible";
        } else {
          document.getElementById("settingsWrapper").style.transform = `translateY(${10 * (4 - i)}%)`;
          document.getElementById("settingsWrapper").style.clipPath = `inset(0 0 ${20 * (4 - i)}% 0)`;
          document.getElementById("settingsWrapper").style.visibility = "visible";
        }
        await delay(75);
      }
      home();
    });
  } else {
    newButton.textContent = "Settings";
    newButton.addEventListener("click", () => {
      scrollSound.currentTime = 0;
      scrollSound.play();
      settings();
    });
  }

  document.getElementById("settingsScrollContent").style.animation = "revealBody 0.2s ease-out";
  document.getElementById("settingsScrollLeft").style.animation = "unfurlHomeLeft 0.2s ease-out";
  document.getElementById("settingsScrollRight").style.animation = "unfurlHomeRight 0.2s ease-out";
  await delay(200);
  document.getElementById("settingsScrollContent").style.animation = "";
  document.getElementById("settingsScrollLeft").style.animation = "";
  document.getElementById("settingsScrollRight").style.animation = "";
}

async function transitionPlayButton(direction) {
  document.getElementById("playScrollContent").style.animation = "revealBody 0.2s ease-in reverse forwards";
  document.getElementById("playScrollLeft").style.animation = "unfurlHomeLeft 0.2s ease-in reverse forwards";
  document.getElementById("playScrollRight").style.animation = "unfurlHomeRight 0.2s ease-in reverse forwards";
  await delay(200);
  document.getElementById("playScrollContent").style.animation = "";
  document.getElementById("playScrollLeft").style.animation = "";
  document.getElementById("playScrollRight").style.animation = "";

  let oldButton = document.getElementById("playButton");
  let newButton = oldButton.cloneNode(true);
  oldButton.parentNode.replaceChild(newButton, oldButton);
  if (direction == 1) {
    newButton.textContent = "Back";
    newButton.addEventListener("click", async () => {
      scrollSound.currentTime = 0;
      scrollSound.play();
      transitionPlayButton(0);
      let ctx = document.getElementById("mainMenuCanvas").getContext("2d");
      for (let i = 4; i >= 0; i--) {
        ctx.drawImage(mainBG, 0, 0, 1920, 1080);
        ctx.drawImage(clockFrames[0], 0, 0, 1920, 1080);
        ctx.drawImage(unfurlFrames[i], 0, 0, 1920, 1080);
        if (i == 0) {
          document.getElementById("playWrapper").style.visibility = "hidden";
        } else if (i == 1) {
          document.getElementById("playWrapper").style.transform = `translateY(60%)`;
          document.getElementById("playWrapper").style.clipPath = `inset(0 0 90% 0)`;
          document.getElementById("playWrapper").style.visibility = "visible";
        } else {
          document.getElementById("playWrapper").style.transform = `translateY(${10 * (4 - i)}%)`;
          document.getElementById("playWrapper").style.clipPath = `inset(0 0 ${20 * (4 - i)}% 0)`;
          document.getElementById("playWrapper").style.visibility = "visible";
        }
        await delay(75);
      }
      home();
    });
  } else {
    newButton.textContent = "Play";
    newButton.addEventListener("click", () => {
      scrollSound.currentTime = 0;
      scrollSound.play();
      play();
    });
  }

  document.getElementById("playScrollContent").style.animation = "revealBody 0.2s ease-out";
  document.getElementById("playScrollLeft").style.animation = "unfurlHomeLeft 0.2s ease-out";
  document.getElementById("playScrollRight").style.animation = "unfurlHomeRight 0.2s ease-out";
  await delay(200);
  document.getElementById("playScrollContent").style.animation = "";
  document.getElementById("playScrollLeft").style.animation = "";
  document.getElementById("playScrollRight").style.animation = "";
}

async function play() {
  transitionPlayButton(1);

  if (document.getElementById("homeTitle")) {
    document.getElementById("homeTitle").remove();
  } else {
    transitionSettingsButton(0);
    let ctx = document.getElementById("mainMenuCanvas").getContext("2d");
    for (let i = 4; i >= 0; i--) {
      ctx.drawImage(mainBG, 0, 0, 1920, 1080);
      ctx.drawImage(clockFrames[0], 0, 0, 1920, 1080);
      ctx.drawImage(unfurlFrames[i], 0, 0, 1920, 1080);
      if (i == 0) {
        document.getElementById("settingsWrapper").style.visibility = "hidden";
      } else if (i == 1) {
        document.getElementById("settingsWrapper").style.transform = `translateY(60%)`;
        document.getElementById("settingsWrapper").style.clipPath = `inset(0 0 90% 0)`;
        document.getElementById("settingsWrapper").style.visibility = "visible";
      } else {
        document.getElementById("settingsWrapper").style.transform = `translateY(${10 * (4 - i)}%)`;
        document.getElementById("settingsWrapper").style.clipPath = `inset(0 0 ${20 * (4 - i)}% 0)`;
        document.getElementById("settingsWrapper").style.visibility = "visible";
      }
      await delay(75);
    }
    document.getElementById("settingsWrapper").remove();
  }

  let playWrapper = document.createElement("div");
  playWrapper.id = "playWrapper";
  playWrapper.innerHTML = `
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
    <button class="formButton" id="startGameButton">Play</button>
  `;
  document.getElementById("canvasWrapper").appendChild(playWrapper);
  resizeText();

  let ctx = document.getElementById("mainMenuCanvas").getContext("2d");
  for (let i = 0; i < 5; i++) {
    ctx.drawImage(mainBG, 0, 0, 1920, 1080);
    ctx.drawImage(clockFrames[0], 0, 0, 1920, 1080);
    ctx.drawImage(unfurlFrames[i], 0, 0, 1920, 1080);
    if (i == 0) {
      document.getElementById("playWrapper").style.visibility = "hidden";
    } else if (i == 1) {
      document.getElementById("playWrapper").style.transform = `translateY(60%)`;
      document.getElementById("playWrapper").style.clipPath = `inset(0 0 90% 0)`;
      document.getElementById("playWrapper").style.visibility = "visible";
    } else {
      document.getElementById("playWrapper").style.transform = `translateY(${10 * (4 - i)}%)`;
      document.getElementById("playWrapper").style.clipPath = `inset(0 0 ${20 * (4 - i)}% 0)`;
      document.getElementById("playWrapper").style.visibility = "visible";
    }
    await delay(75);
  }
  playWrapper.style.clipPath = "";

  document.getElementById("startGameButton").addEventListener("click", async () => {
    mainMenuResizeObserver.disconnect();
    let ctx = document.getElementById("mainMenuCanvas").getContext("2d");
    for (let i = 4; i >= 0; i--) {
      ctx.drawImage(mainBG, 0, 0, 1920, 1080);
      ctx.drawImage(clockFrames[0], 0, 0, 1920, 1080);
      ctx.drawImage(unfurlFrames[i], 0, 0, 1920, 1080);
      if (i == 0) {
        document.getElementById("playWrapper").style.visibility = "hidden";
      } else if (i == 1) {
        document.getElementById("playWrapper").style.transform = `translateY(60%)`;
        document.getElementById("playWrapper").style.clipPath = `inset(0 0 90% 0)`;
        document.getElementById("playWrapper").style.visibility = "visible";
      } else {
        document.getElementById("playWrapper").style.transform = `translateY(${10 * (4 - i)}%)`;
        document.getElementById("playWrapper").style.clipPath = `inset(0 0 ${20 * (4 - i)}% 0)`;
        document.getElementById("playWrapper").style.visibility = "visible";
      }
      await delay(75);
    }
    startGame(parseInt(document.getElementById("numPapers").value), parseInt(document.getElementById("timeLimit").value));
  });
}

async function playMainLoading() {
  fadeAudio(menuMusic);
  clockSound.currentTime = 0;
  clockSound.play();
  gearSound.currentTime = 0;
  gearSound.play();
  if (!document.getElementById("mainMenuCanvas")) {
    return;
  }

  let ctx = document.getElementById("mainMenuCanvas").getContext("2d");
  let clockFrame = 0;
  let numberFrame = 0;
  let loadingAnimation = setInterval(() => {
    ctx.drawImage(mainBGLoading, 0, 0, 1920, 1080);
    ctx.drawImage(clockFrames[clockFrame], 0, 0, 1920, 1080);
    ctx.drawImage(numberFrames[numberFrame], 0, 0, 1920, 1080);
    clockFrame = (clockFrame + 1) % 32;
    numberFrame = (numberFrame + 1) % 4;
  }, 35);
}

async function startGame(numPapers, timeLimit) {
  if (document.getElementById("playWrapper")) {
    document.getElementById("playWrapper").remove();
  }

  let pdfWrapper = document.createElement("div");
  pdfWrapper.id = "pdfWrapper";
  pdfWrapper.style.display = "none";
  pdfWrapper.innerHTML = `
    <div id="pdfControlWrapper">
      <button class="pdfControlButton" id="guessButton">Deliver</button>
      <button class="pdfControlButton" id="guessSettingsButton">Settings</button>
    </div>
  `;
  document.getElementById("homeWrapper").appendChild(pdfWrapper);

  playMainLoading();

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
    assetPromises.push(loadImage(`./img/chronopaper.png`));
    assetPromises.push(loadImage(`./img/bg_scoring.png`));
    assetPromises.push(loadImage(`./img/newsboy_win_0.png`));
    assetPromises.push(loadImage(`./img/newsboy_win_1.png`));
    assetPromises.push(loadImage(`./img/newsboy_win_2.png`));
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
      chronoPaper = assets[219];
      scoringBG = assets[220];
      newsboyWin0 = assets[221];
      newsboyWin1 = assets[222];
      newsboyWin2 = assets[223];
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

  for (let child of document.getElementById("homeWrapper").children) {
    if (child.id != pdfWrapper) {
      child.remove();
    }
  }

  clockSound.currentTime = 0;
  clockSound.pause();
  gearSound.currentTime = 0;
  gearSound.pause();

  currentPaper = 0;
  guesses = [];
  document.getElementById("pdfWrapper").style.display = "block";
  document.getElementById(`newspaper${currentPaper}`).style.visibility = "visible";
  document.getElementById("guessButton").focus();

  document.getElementById("guessSettingsButton").addEventListener("click", async () => {
    scrollSound.currentTime = 0;
    scrollSound.play();
    let oldToolbar = toolbar;
    let guesSettingsWrapper = document.createElement("div");
    guesSettingsWrapper.id = "guessSettingsWrapper";
    guesSettingsWrapper.innerHTML = `
      <div id="settingsBox">
        <div id="settingsContent">
          <div id="optionsWrapper">
            <div class="optionWrapperRow">
              <label for="cutscenes">Cutscenes:</label>
              <input type="checkbox" id="cutscenes" name="cutscenes" checked />
            </div>
            <div class="optionWrapperRow">
              <label for="toolbar">PDF Toolbar:</label>
              <input type="checkbox" id="toolbar" name="toolbar" checked />
            </div>
            <div class="optionWrapper">
              <label for="musicVolume">Music Volume:</label>
              <input type="range" id="musicVolume" name="musicVolume" min="0" max="100" value="0" />
            </div>
            <div class="optionWrapper">
              <label for="effectsVolume">Effects Volume:</label>
              <input type="range" id="effectsVolume" name="effectsVolume" min="0" max="100" value="50" />
            </div>
          </div>
          <button id="doneSettingsButton">Save</button>
        </div>
        <img class="scrollEdge" id="scrollLeft" src="../img/scroll_left.png" alt="Background scroll">
        <img class="scrollEdge" id="scrollRight" src="../img/scroll_right.png" alt="Background scroll">
      </div>
    `;

    document.getElementById("pdfWrapper").appendChild(guesSettingsWrapper);
    document.getElementById("cutscenes").checked = cutscenes;
    document.getElementById("toolbar").checked = toolbar;
    document.getElementById("musicVolume").value = musicVolume;
    document.getElementById("effectsVolume").value = effectsVolume;
    document.getElementById("cutscenes").addEventListener("change", (event) => {
      if (event.currentTarget.checked) {
        cutscenes = true;
      } else {
        cutscenes = false;
      }
    });
    document.getElementById("toolbar").addEventListener("change", (event) => {
      if (event.currentTarget.checked) {
        toolbar = true;
      } else {
        toolbar = false;
      }
    });
    document.getElementById("musicVolume").addEventListener("change", (event) => {
      musicVolume = event.currentTarget.value;
    });
    document.getElementById("effectsVolume").addEventListener("change", (event) => {
      effectsVolume = event.currentTarget.value;
      scrollSound.volume = effectsVolume / 100;
      clockSound.volume = effectsVolume / 100;
      gearSound.volume = effectsVolume / 1000;
    });

    document.getElementById("settingsContent").style.animation = "revealBody 0.7s ease-out";
    document.getElementById("scrollLeft").style.animation = "unfurlSettingsLeft 0.7s ease-out";
    document.getElementById("scrollRight").style.animation = "unfurlSettingsRight 0.7s ease-out";
    await delay(700);
    document.getElementById("settingsContent").style.animation = "";
    document.getElementById("scrollLeft").style.animation = "";
    document.getElementById("scrollRight").style.animation = "";
    document.getElementById("doneSettingsButton").focus();

    document.getElementById("doneSettingsButton").addEventListener("click", async () => {
      scrollSound.currentTime = 0;
      scrollSound.play();
      document.getElementById("settingsContent").style.animation = "revealBody 0.4s ease-in reverse forwards";
      document.getElementById("scrollLeft").style.animation = "unfurlSettingsLeft 0.4s ease-in reverse forwards";
      document.getElementById("scrollRight").style.animation = "unfurlSettingsRight 0.4s ease-in reverse forwards";
      await delay(400);
      document.getElementById("guessSettingsWrapper").remove();
      document.getElementById("guessButton").focus();
      if (oldToolbar != toolbar) {
        let newspaperPdfs = document.getElementsByClassName("newspaperPdf");
        for (let newspaperPdf of newspaperPdfs) {
          let newPdf = newspaperPdf.cloneNode(true);
          if (toolbar) {
            newPdf.src = newPdf.src.substring(0, newPdf.src.length - 10);
          } else {
            newPdf.src += "&toolbar=0";
          }
          newspaperPdf.parentNode.replaceChild(newPdf, newspaperPdf);
        }
      }
    });
  });

  document.getElementById("guessButton").addEventListener("click", async () => {
    scrollSound.currentTime = 0;
    scrollSound.play();
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
              <canvas id="boyAnimation" width="1920" height="1080" role="img" aria-label="Newspaper boy animation"></canvas>
              <button id="cancelGuessButton">Cancel</button>
              <button id="submitGuessButton">Deliver</button>
            </div>
          </div>
          <img class="scrollEdge" id="scrollLeft" src="../img/scroll_left.png" alt="Background scroll">
          <img class="scrollEdge" id="scrollRight" src="../img/scroll_right.png" alt="Background scroll">
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
          if (animationFrame == 0 || !cutscenes) {
            clearInterval(throwingAnimation);
            document.getElementById("guessWrapper").remove();
            document.getElementById(`newspaper${currentPaper}`).style.visibility = "hidden";
            currentPaper++;

            let guessYear = parseInt(guesses[guesses.length - 1].year);
            if (cutscenes) {
              if (guessYear < 1830) {
                await playDeliveryAnimation(0);
              } else if (guessYear < 1870) {
                await playDeliveryAnimation(1);
              } else if (guessYear < 1940) {
                await playDeliveryAnimation(2);
              } else {
                await playDeliveryAnimation(3);
              }
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

              if (cutscenes) {
                await playPaperAnimation();
              }

              let scorePercent = (score / 1000) * numPapers;
              let performance;
              if (scorePercent < 0.5) {
                performance = 0;
              } else if (scorePercent < 0.75) {
                performance = 1;
              } else {
                performance = 2;
              }

              let headline = headlines[performance][Math.floor(Math.random() * headlines[performance].length)];

              document.getElementById("homeWrapper").innerHTML = `
                  <div id="scoreWrapper">
                    <div id="scoreTitle">
                      <p style="margin: 0;">Chrono News</p>
                    </div>
                    <img src="../img/scoring_line_hor.png" class="scoringLineHor" alt="Page line divider">
                    <div id="scoreHeadline"><p style="margin: 0;">${headline}</p></div>
                    <img src="../img/scoring_line_hor.png" class="scoringLineHor" alt="Page line divider">
                    <div id="scoreArticles">
                      <div class="scoreColumn" id="scoreColumn0"></div>
                      <div class="scoreColumn" id="scoreColumn1"></div>
                      <div class="scoreColumn" id="scoreColumn2"></div>
                      <img src="../img/scoring_line_vert.png" class="scoringLineVert" id="line12" alt="Page line divider">
                      <img src="../img/scoring_line_vert.png" class="scoringLineVert" id="line23" alt="Page line divider">
                    </div>
                    <img src="../img/scoring_line_hor.png" class="scoringLineHor" alt="Page line divider">
                    <div id="scoreEditorial">
                      <div id="scoreEditorialTitle">
                        <p style="margin: 0;">Editorial</p>
                      </div>
                      <div id="scoreEditorialText">
                        <p style="margin: 0;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This newspaper and the accompanying game was brought to you by the United States Library of Congress, as part of the Friends' Choice Civics Video Game Challenge. The game was designed and programmed by John Meo, with art created by Yeng Madayag, and music/sound design by Jaxson Keidser. We hope you enjoyed playing and continue having fun with American newspapers!</p>
                      </div>
                    </div>
                    <div id="continueButtons">
                      <button class="scoreButton" id="homeButton">Home</button>
                      <button class="scoreButton" id="replayButton">Play Again</button>
                    </div>
                  </div>
                `;

              let articleTexts = [[], [], []];

              for (let i = 0; i < numPapers; i++) {
                let articleElement = document.createElement("div");

                let thisPerformance;
                if (scores[i] < 500) {
                  thisPerformance = 0;
                } else if (scores[i] < 750) {
                  thisPerformance = 1;
                } else {
                  thisPerformance = 2;
                }

                let deliveredFuture;
                if (
                  dateToDecimal(parseInt(documents[i].date.year), parseInt(documents[i].date.month), parseInt(documents[i].date.day)) -
                    dateToDecimal(parseInt(guesses[i].year), parseInt(guesses[i].month), parseInt(guesses[i].day)) >
                  0
                ) {
                  deliveredFuture = false;
                } else {
                  deliveredFuture = true;
                }

                if (i < 2) {
                  document.getElementById(`scoreColumn${i % 3}`).appendChild(articleElement);
                } else {
                  document.getElementById(`scoreColumn${(i + 1) % 3}`).appendChild(articleElement);
                }
              }

              // for (let i = 0; i < numPapers; i++) {
              //   document.getElementById("papersWrapper").innerHTML += `
              //       <div class="paperWrapper">
              //         <div class="paperTitle"></div>
              //         <div class="paperDate"></div>
              //         <div class="guessDate"></div>
              //         <div class="paperScore"></div>
              //       </div>
              //     `;
              // }

              document.getElementById("homeButton").addEventListener("click", () => {
                scrollSound.currentTime = 0;
                scrollSound.play();
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
      scrollSound.currentTime = 0;
      scrollSound.play();
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
      if (!cutscenes) {
        startThrowFlag = 10;
      }
    });
  });
}

function resizeText() {
  let scalar = document.getElementById("canvasWrapper").getBoundingClientRect().width * 0.26;
  if (document.getElementById("homeTitle")) {
    document.getElementById("homeTitle").style.fontSize = `${scalar / 3}px`;
  }
  if (document.getElementById("playWrapper")) {
    document.getElementById("playWrapper").style.fontSize = `${scalar / 5}px`;
    document.getElementById("numPapers").style.fontSize = `${scalar / 6}px`;
    document.getElementById("timeLimit").style.fontSize = `${scalar / 6}px`;
    document.getElementById("startGameButton").style.fontSize = `${scalar / 4}px`;
  }
  if (document.getElementById("settingsWrapper")) {
    document.getElementById("settingsWrapper").style.fontSize = `${scalar / 5}px`;
    document.getElementById("cutscenes").style.transform = `scale(${scalar / 150})`;
    document.getElementById("cutscenes").style.margin = `${scalar / 15}px`;
    document.getElementById("toolbar").style.transform = `scale(${scalar / 150})`;
    document.getElementById("toolbar").style.margin = `${scalar / 15}px`;
    document.getElementById("musicVolume").style.transform = `scale(${scalar / 150})`;
    document.getElementById("effectsVolume").style.transform = `scale(${scalar / 150})`;
  }
  document.getElementById("playButton").style.fontSize = `${scalar / 3.8}px`;
  document.getElementById("settingsButton").style.fontSize = `${scalar / 3.8}px`;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.src = url;
  });
}

async function playPaperAnimation() {
  let chronoPaper = await loadImage(`./img/chronopaper.png`);

  document.getElementById("homeWrapper").style.display = "none";

  let animationWrapper = document.createElement("div");
  animationWrapper.id = "animationWrapper";
  animationWrapper.innerHTML = `
    <canvas id="animationCanvas" width="1920" height="1080" aria-label="Paper loading animation" role="img"></canvas>
  `;

  document.getElementsByTagName("body")[0].appendChild(animationWrapper);
  let ctx = document.getElementById("animationCanvas").getContext("2d");

  const canvasWidth = 1920;
  const canvasHeight = 1080;

  let imageWidth = chronoPaper.width;
  let imageHeight = chronoPaper.height;

  for (let i = 0; i < 80; i++) {
    imageWidth = chronoPaper.width * 0.04 * i;
    imageHeight = chronoPaper.height * 0.04 * i;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate(0.2 * Math.pow(i, 1.2));
    ctx.drawImage(chronoPaper, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
    ctx.rotate(-0.2 * Math.pow(i, 1.2));
    ctx.translate(-canvasWidth / 2, -canvasHeight / 2);

    await delay(35);
  }

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.drawImage(chronoPaper, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
  ctx.translate(-canvasWidth / 2, -canvasHeight / 2);

  await delay(1000);

  document.getElementById("animationWrapper").remove();
  document.getElementById("homeWrapper").style.display = "flex";
}

async function playDeliveryAnimation(animationEnum) {
  document.getElementById("homeWrapper").style.display = "none";

  let animationWrapper = document.createElement("div");
  animationWrapper.id = "animationWrapper";
  animationWrapper.innerHTML = `
    <canvas id="animationCanvas" width="1920" height="1080" aria-label="Delivery animation" role="img"></canvas>
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

  if (!toolbar) {
    newspaperPdf.src += "&toolbar=0";
  }

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

let scrollSound = new Audio("./audio/effect_scroll.mp3");

let clockSound = new Audio("./audio/effect_clock.wav");
clockSound.addEventListener("ended", () => {
  clockSound.currentTime = 0;
  clockSound.play();
});

let gearSound = new Audio("./audio/effect_gear.mp3");
gearSound.addEventListener("ended", () => {
  gearSound.currentTime = 0;
  gearSound.play();
});

let menuMusic = new Audio("./audio/music_menu.wav");
menuMusic.addEventListener("ended", () => {
  menuMusic.currentTime = 0;
  menuMusic.play();
});

async function fadeAudio(audioElement) {
  let initialVolume = audioElement.volume;
  for (let i = 100; i >= 0; i--) {
    audioElement.volume = initialVolume * (i / 100);
    await delay(10);
  }
}

function confirmAudio() {
  let confirmWrapper = document.createElement("div");
  confirmWrapper.id = "confirmWrapper";
  confirmWrapper.innerHTML = `
    <div id="audioConfirm">
      <p>Would you like to allow ChronoGuesser to play audio?</p>
      <div id="confirmButtons">
        <button class="confirmButton" id="confirmYes">Yes</button>
        <button class="confirmButton" id="confirmNo">No</button>
      </div>
    </div>
  `;

  document.getElementsByTagName("body")[0].appendChild(confirmWrapper);
  document.getElementById("confirmYes").focus();

  document.getElementById("confirmYes").addEventListener("click", () => {
    musicVolume = 50;
    effectsVolume = 50;
    menuMusic.volume = 0.5;
    scrollSound.volume = 0.5;
    clockSound.volume = 0.5;
    gearSound.volume = 0.05;
    menuMusic.play();
    document.getElementById("confirmWrapper").remove();
  });
  document.getElementById("confirmNo").addEventListener("click", () => {
    musicVolume = 0;
    effectsVolume = 0;
    menuMusic.volume = 0;
    scrollSound.volume = 0;
    clockSound.volume = 0;
    gearSound.volume = 0;
    menuMusic.play();
    document.getElementById("confirmWrapper").remove();
  });
}

home();

confirmAudio();
