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
let chatBoard = document.getElementById("chatBoard");

//console.log("Hello")
socket.on('message', (message) => {
    let new_message = document.createElement('p');
    new_message.textContent = message;
    chatBoard.append(new_message);
})


let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

let startcol = "white";
context.fillStyle = startcol;
context.fillRect(0, 0, canvas.width, canvas.height);
canvas.style.alignSelf = "center";

let drawcolor = "black";
let drawwidth = "5";
let drawing = false;

canvas.addEventListener("touchstart", start, false);
canvas.addEventListener("touchmove", draw, false);
canvas.addEventListener("mousedown", start, false);
canvas.addEventListener("mousemove", draw, false);
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
function showDiv() {
    //console.log("Loaded")
    popup.style.display = "flex"
}
window.onload = function(){
    setTimeout(showDiv, 3000);
}
choice1.addEventListener("click", () => {
    currentChoice = choice1.textContent
    words["choice1"] = choice1.textContent
    popup.style.display = "none"
});
choice2.addEventListener("click", () => {
    currentChoice = choice2.textContent
    words["choice2"] = choice2.textContent
    popup.style.display = "none"
});
choice3.addEventListener("click", () => {
    currentChoice = choice3.textContent
    words["choice3"] = choice3.textContent
    popup.style.display = "none"
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
console.log("Current choice: ", currentChoice)
fetch("words.txt").then((res) => 
    res.text()
    ).then((text) => {
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
        input.value = " ";
  }
