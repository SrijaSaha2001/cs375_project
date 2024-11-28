const socket = io(location.host);
let roomName = sessionStorage.getItem('roomName');
console.log("Why: ", roomName)
if(roomName) {
    socket.emit('joinRoom', roomName);
    console.log(socket.id, 'You are in room:', roomName);
}
socket.on("connect", () => {
    console.log(socket.id); // ojIckSD2jqNzOqIrAGzL
  });
//socket.on('showPopup', (text) => {
    //const popup = document.getElementById('newpopup');
    //popup.textContent = text;
    //popup.style.display = 'flex';

    // Hide the popup after 3 seconds
    //setTimeout(() => {
     //   popup.style.display = 'none';
    //}, 3000);
//});
//let chatBoard = document.getElementById("chatBoard");

//console.log("Hello")
/*socket.on('message', (message) => {
    let new_message = document.createElement('p');
    new_message.textContent = message;
    chatBoard.append(new_message);
})*/


let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

let startcol = "white";
context.fillStyle = startcol;
context.fillRect(0, 0, canvas.width, canvas.height);
canvas.style.alignSelf = "center";

let drawcolor = "black";
let drawwidth = "5";
let drawing = false;
let lastPosition = { x: 0, y: 0 };
canvas.addEventListener("touchstart", start, false);
canvas.addEventListener("touchmove", draw, false);
canvas.addEventListener("mousedown", start, false);
canvas.addEventListener("mousemove", draw, false);
canvas.addEventListener("mouseup", stop, false);
canvas.addEventListener("touchend", stop, false);
canvas.addEventListener("mouseout", stop, false);
socket.on('drawing', (data) => {
    const { x1, y1, x2, y2, color } = data;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
});
socket.on('roomCount', (count) => {
    alert('Number of sockets in room: ' + count);
});
canvas.addEventListener("mouseup", stop, false);
canvas.addEventListener("touchend", stop, false);
canvas.addEventListener("mouseout", stop, false);
//reset.addEventListener("click", clear);

let popup = document.getElementById("popup");
let choice1 = document.getElementById("choice1");
let choice2 = document.getElementById("choice2");
let choice3 = document.getElementById("choice3");
let currentChoice = ""
words = {}
let timer = document.getElementById("timer");
let blanks = document.getElementById("blanks");
let currentTime = timer.textContent;
setInterval(function () {
    currentTime--;
    timer.textContent = currentTime;
}, 1000)
function showDiv() {
    //console.log("Loaded")
    popup.style.display = "flex"
}
window.onload = function(){
    setTimeout(showDiv, 3000);
}
function addBlanks(word) {
    let string = ""
    for(let i = 0; i < word.length; i++) {
        if(word[i] === ' ') {
            string = string + " "
        }
        else {
            string = string + "_ "
        }
    }
    blanks.textContent = string;
    blanks.style.display = "flex";
}
choice1.addEventListener("click", () => {
    currentChoice = choice1.textContent;
    console.log("Here1:", choice1.textContent)
    console.log("Here2:", currentChoice)
    words["choice1"] = choice1.textContent
    popup.style.display = "none"
    timer.textContent = 60;
    currentTime = timer.textContent;
    addBlanks(currentChoice)
});
console.log("Current choice: ", currentChoice)
choice2.addEventListener("click", () => {
    currentChoice = choice2.textContent
    words["choice2"] = choice2.textContent
    popup.style.display = "none"
    timer.textContent = 60;
    currentTime = timer.textContent;
    addBlanks(currentChoice)
});
choice3.addEventListener("click", () => {
    currentChoice = choice3.textContent
    words["choice3"] = choice3.textContent
    popup.style.display = "none"
    timer.textContent = 60;
    currentTime = timer.textContent;
    addBlanks(currentChoice)
});
socket.emit('sendData', roomName, words);
socket.on('putValues', (data) => {
    updateValues(data)
})

function putValues(data) {
    choice1.textContent = data["choice1"]
    choice2.textContent = data["choice2"]
    choice3.textContent = data["choice3"]
}
function generateWords(text) {
    var arrayOfWords = text.split(",")
    var num1 = Math.floor(Math.random() * arrayOfWords.length);
    var num2 = Math.floor(Math.random() * arrayOfWords.length);
    var num3 = Math.floor(Math.random() * arrayOfWords.length);
    //console.log("Word 1: ", arrayOfWords[num1])
    choice1.textContent = arrayOfWords[num1]
    //console.log("Word 2: ", arrayOfWords[num2])
    choice2.textContent = arrayOfWords[num2]
    //console.log("Word 3: ", arrayOfWords[num3])
    choice3.textContent = arrayOfWords[num3]

}
console.log("Current choice: ", currentChoice)
let allWords = ""
fetch("words.txt").then((res) => 
    res.text()
    ).then((text) => {
        allWords = text
        generateWords(text)
   }).catch((e) => 
    console.error(e));
function start(event) {
    drawing = true;
    context.beginPath();
    context.moveTo(event.offsetX,
                event.offsetY);
    event.preventDefault();
}

function draw(event) {
    if(drawing === true) {
        context.lineTo(event.offsetX, 
            event.offsetY);
        context.strokeStyle = drawcolor;
        context.lineWidth = drawwidth;
        context.lineJoin = "round";
        context.stroke();
    }
    event.preventDefault();
}

function stop(event) {
    if (drawing === true) {
        context.stroke();
        context.closePath();
        drawing = false;
    }
    event.preventDefault();
}

function changeColor(element) {
    drawcolor = element.style.background;
}
function changeSize(value) {
    drawwidth = value;
}

/*function clear(event) {
    context.fillStyle = startcol;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(0, 0, canvas.width, canvas.height);
}

let count = 60;
/*let timer = document.getElementById("timer")
  setInterval(function () {
    count--;
    timer.textContent = count;

    if(count < 0) {
        clearInterval(timer);
    }
  }, 1000);*/

  let grey = true;

  function send(event) {
        let log = document.getElementById("logs");
        let input = document.getElementById("input");
        console.log("why1: ", input.value.toLowerCase())
        console.log("why2: ", currentChoice.toLowerCase())
        if(input.value.trim().toLowerCase() === currentChoice.trim().toLowerCase()) {
            console.log("why1: ", input.textContent.toLowerCase)
            console.log("why2: ", currentChoice.toLowerCase)
            blanks.textContent = input.value.trim().toLowerCase()
            generateWords(allWords)
            popup.style.display = "flex"
            timer.textContent = 60;
            currentTime = timer.textContent;
        }
        inputVal = input.value;
        let div = document.createElement("div");
        div.textContent = inputVal;
        if (grey) {
            div.classList.add("greyline");
          } else {
            div.classList.add("whiteline");
          }
        grey = !grey;
        log.append(div);
        input.value = "";
  }
