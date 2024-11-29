const socket = io();

const urlParams = new URLSearchParams(window.location.search);
console.log("url: ", urlParams)

const roomName = urlParams.get('room');
console.log("room: ", roomName)
socket.emit('joinRoom', roomName);
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let drawcolor = "black";
let drawwidth = "5";
const canvas = document.getElementById('canvas');
const rect = canvas.getBoundingClientRect();
const context = canvas.getContext('2d');
let width = document.getElementById("width")
width.addEventListener("click", () => {
    drawwidth = width.value
})
let red = document.getElementById("red")
red.addEventListener("click", () => {
    drawcolor = "red"
})
let orange = document.getElementById("orange")
orange.addEventListener("click", () => {
    drawcolor = "orange"
})
let yellow = document.getElementById("yellow")
yellow.addEventListener("click", () => {
    drawcolor = "yellow"
})
let green = document.getElementById("green")
green.addEventListener("click", () => {
    drawcolor = "green"
})
let blue = document.getElementById("blue")
blue.addEventListener("click", () => {
    drawcolor = "blue"
})
let indigo = document.getElementById("indigo")
indigo.addEventListener("click", () => {
    drawcolor = "indigo"
})
let violet = document.getElementById("violet")
violet.addEventListener("click", () => {
    drawcolor = "violet"
})
let black = document.getElementById("black")
black.addEventListener("click", () => {
    drawcolor = "black"
})
let white = document.getElementById("white")
white.addEventListener("click", () => {
    drawcolor = "white"
})
let gray = document.getElementById("grey")
gray.addEventListener("click", () => {
    drawcolor = "grey"
})
let brown = document.getElementById("brown")
brown.addEventListener("click", () => {
    drawcolor = "brown"
})

let startcol = "white";
context.fillStyle = startcol;
context.fillRect(0, 0, canvas.width, canvas.height);

canvas.style.alignSelf = "center";

function joinRoom() {
    //roomName = document.getElementById('roomName').value;
    //const socket = io(location.host);
    //roomName = sessionStorage.getItem('roomName');
    if (roomName) {
        console.log("Room name", roomName)
     socket.emit('joinRoom', roomName); // Join the room
    }
}

function draw(e) {
    if (isDrawing) {
        context.lineWidth = drawwidth;
        context.lineCap = 'round';
        context.strokeStyle = drawcolor;
        context.lineJoin = "round";
        context.lineTo(e.clientX, e.clientY);
        context.stroke();
        context.beginPath();
        context.moveTo(e.clientX, e.clientY);
    } 
    e.preventDefault();
}
function changeColor(element) {
    drawcolor = element.style.background;
}
function changeSize(value) {
    drawwidth = value;
}
function stop(event) {
    if (isDrawing === true) {
        context.stroke();
        context.closePath();
        isDrawing = false;
    }
    event.preventDefault();
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
    context.lineWidth = drawwidth;
    context.lineCap = 'round';
    context.strokeStyle = drawcolor;
    context.lineJoin = "round";
});
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
canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        let currentX = e.offsetX;//e.clientX - canvas.offsetLeft;
        let currentY = e.offsetY;//e.clientY - canvas.offsetTop;
        drawLine(lastX, lastY, currentX, currentY);
        socket.emit('drawing', {
          roomName: roomName,
          lastX: lastX,
          lastY: lastY,
          currentX: currentX,
          currentY: currentY,
          drawing: true,
          color: drawcolor
        });
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(currentX, currentY);
        context.stroke();
        lastX = currentX;
        lastY = currentY;
      }
    });

//canvas.addEventListener("mouseup", stop, false);
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    context.closePath();
})
canvas.addEventListener('mouseout', () => {
    isDrawing = false;
    context.closePath();
})


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

function drawLine(x1, y1, x2, y2, color) {
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    drawcolor = color;
}
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

socket.on('drawing', (data) => {
    if (data.roomName === roomName && data.drawing) {
        drawLine(data.lastX, data.lastY, data.currentX, data.currentY, data.color);
    }
});