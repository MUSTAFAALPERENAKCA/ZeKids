let hiddenDiv = document.querySelector(".btns-hidden");

let hiddenBtns = hiddenDiv.querySelectorAll("button");

let foundDiv = document.querySelector(".hidden-obj");

let foundDivs = foundDiv.querySelectorAll("div");

let messageBtn = document.querySelector(".message-btn");

let endMessage = document.querySelector(".end-slide");

let timer = document.querySelector("#time");

let winLose = document.querySelector("#win-lose");

let foundAll = document.querySelector("#if-found-all");

let clicked = [11, 12];

// Zoom uyarısı kaldırıldı - ZeKids platformu için gerek yok

for (let objBtn of hiddenBtns) {
  
  countdown(10);

  objBtn.addEventListener(
    "click",
    () => {
      //make it a switch statement
      if (objBtn.textContent === "Eggs") {
        clicked.push(1);
        console.log(clicked.length);
        document.querySelector("#eggs-found.cross-eggs").style.color = "black";
        timedMessage(objBtn.textContent);

        if (clicked.length === 12) {
          console.log(clicked.length);
          winLose.innerText = "Nice Job!";
          console.log(winLose);
          foundAll.innerText = "You found all of the 10 hidden objects.";
          console.log(foundAll);
          endMessage.style.display = "block";
        }
        return;
      }
    },
    { once: true }
  );

  objBtn.addEventListener(
    "click",
    () => {
      if (objBtn.textContent === "Hedgehog") {
        clicked.push(2);
        console.log(clicked.length);
        document.querySelector("#hedgehog-found.cross-hedgehog").style.color =
          "black";
        timedMessage(objBtn.textContent);

        if (clicked.length === 12) {
          console.log(clicked.length);
          winLose.innerText = "Nice Job!";
          console.log(winLose);
          foundAll.innerText = "You found all of the 10 hidden objects.";
          console.log(foundAll);
          endMessage.style.display = "block";
        }
        return;
      }
    },
    { once: true }
  );
  objBtn.addEventListener(
    "click",
    () => {
      if (objBtn.textContent === "Cricket") {
        clicked.push(3);
        console.log(clicked.length);
        document.querySelector("#cricket-found.cross-cricket").style.color =
          "black";
        timedMessage(objBtn.textContent);

        if (clicked.length === 12) {
          console.log(clicked.length);
          winLose.innerText = "Nice Job!";
          console.log(winLose);
          foundAll.innerText = "You found all of the 10 hidden objects.";
          console.log(foundAll);
          endMessage.style.display = "block";
        }
        return;
      }
    },
    { once: true }
  );

  objBtn.addEventListener(
    "click",
    () => {
      if (objBtn.textContent === "Flower") {
        clicked.push(4);
        console.log(clicked.length);
        document.querySelector("#flower-found.cross-flower").style.color =
          "black";
        timedMessage(objBtn.textContent);

        if (clicked.length === 12) {
          console.log(clicked.length);
          winLose.innerText = "Nice Job!";
          console.log(winLose);
          foundAll.innerText = "You found all of the 10 hidden objects.";
          console.log(foundAll);
          endMessage.style.display = "block";
        }
        return;
      }
    },
    { once: true }
  );

  objBtn.addEventListener(
    "click",
    () => {
      if (objBtn.textContent === "Dragonfly") {
        clicked.push(5);
        console.log(clicked.length);
        document.querySelector("#dragonfly-found.cross-dragonfly").style.color =
          "black";
        timedMessage(objBtn.textContent);

        if (clicked.length === 12) {
          console.log(clicked.length);
          winLose.innerText = "Nice Job!";
          console.log(winLose);
          foundAll.innerText = "You found all of the 10 hidden objects.";
          console.log(foundAll);
          endMessage.style.display = "block";
        }
        return;
      }
    },
    { once: true }
  );

  objBtn.addEventListener(
    "click",
    () => {
      if (objBtn.textContent === "Fish") {
        clicked.push(6);
        console.log(clicked.length);
        document.querySelector("#fish-found.cross-fish").style.color = "black";
        timedMessage(objBtn.textContent);

        if (clicked.length === 12) {
          console.log(clicked.length);
          winLose.innerText = "Nice Job!";
          console.log(winLose);
          foundAll.innerText = "You found all of the 10 hidden objects.";
          console.log(foundAll);
          endMessage.style.display = "block";
        }
        return;
      }
    },
    { once: true }
  );

  objBtn.addEventListener(
    "click",
    () => {
      if (objBtn.textContent === "Spider") {
        clicked.push(7);
        console.log(clicked.length);
        document.querySelector("#spider-found.cross-spider").style.color =
          "black";
        timedMessage(objBtn.textContent);

        if (clicked.length === 12) {
          console.log(clicked.length);
          winLose.innerText = "Nice Job!";
          console.log(winLose);
          foundAll.innerText = "You found all of the 10 hidden objects.";
          console.log(foundAll);
          endMessage.style.display = "block";
        }
        return;
      }
    },
    { once: true }
  );

  objBtn.addEventListener(
    "click",
    () => {
      if (objBtn.textContent === "Worm") {
        clicked.push(8);
        console.log(clicked.length);
        document.querySelector("#worm-found.cross-worm").style.color = "black";
        timedMessage(objBtn.textContent);

        if (clicked.length === 12) {
          console.log(clicked.length);
          winLose.innerText = "Nice Job!";
          console.log(winLose);
          foundAll.innerText = "You found all of the 10 hidden objects.";
          console.log(foundAll);
          endMessage.style.display = "block";
        }
        return;
      }
    },
    { once: true }
  );

  objBtn.addEventListener(
    "click",
    () => {
      if (objBtn.textContent === "Bird") {
        clicked.push(9);
        console.log(clicked.length);
        document.querySelector("#bird-found.cross-bird").style.color = "black";
        timedMessage(objBtn.textContent);

        if (clicked.length === 12) {
          console.log(clicked.length);
          winLose.innerText = "Nice Job!";
          console.log(winLose);
          foundAll.innerText = "You found all of the 10 hidden objects.";
          console.log(foundAll);
          endMessage.style.display = "block";
        }
        return;
      }
    },
    { once: true }
  );

  objBtn.addEventListener(
    "click",
    () => {
      if (objBtn.textContent === "Grasshopper") {
        clicked.push(10);
        console.log(clicked.length);
        document.querySelector(
          "#grasshopper-found.cross-grasshopper"
        ).style.color = "black";
        timedMessage(objBtn.textContent);

        if (clicked.length === 12) {
          console.log(clicked.length);
          winLose.innerText = "Nice Job!";
          console.log(winLose);
          foundAll.innerText = "You found all of the 10 hidden objects.";
          console.log(foundAll);
          endMessage.style.display = "block";
        }
        return;
      }
    },
    { once: true }
  );
}

function timedMessage(textContent) {
  messageBtn.style.display = "block";
  let foundMsg = (messageBtn.textContent = `
     You 
    Found 
     The 
    Hidden 
  ${textContent}!`);
  console.log(foundMsg);
  setTimeout(() => {
    messageBtn.style.display = "none";
    return;
  }, 5000);
}

function countdown(minutes) {
  var seconds = 60;
  var mins = minutes;
  function tick() {
    var time = document.querySelector("#time");
    var current_minutes = mins - 1;
    seconds--;
    time.innerHTML =
      current_minutes.toString() +
      ":" +
      (seconds < 10 ? "0" : "") +
      String(seconds);
    if (seconds > 0) {
      setTimeout(tick, 1000);
    } else {
      if (mins > 1) {
        countdown(mins - 1);
      }
    }
    if (timer.textContent === "0:00") {
      winLose.textContent = "Time's Up!";
      foundAll.innerText = "You couldn't find all of the hidden objects.";
      endMessage.style.display = "block";
    }
  }
  tick();
}
