const socket = io(location.host);
socket.on("connect", () => {
    console.log(socket.id); // ojIckSD2jqNzOqIrAGzL
  });
let chatBoard = document.getElementById("chatBoard");

console.log("Hello")
socket.on('message', (message) => {
    let new_message = document.createElement('p');
    new_message.textContent = message;
    chatBoard.append(new_message);
})


let canvas = document.getElementById("canvas");
//let reset = document.getElementsByClassName("reset");
let context = canvas.getContext("2d");
//let chatInput = document.getElementById("enterText");

//canvas.width = 500;
//canvas.height = 500;
let startcol = "white";
context.fillStyle = startcol;
context.fillRect(0, 0, canvas.width, canvas.height);
canvas.style.alignSelf = "center";

let drawcolor = "black";
let drawwidth = "5";
let drawing = false;

let players = 5;
let user = 3;
let role = "drawer"

window.addEventListener("load", function () {
    for (let usernum = 1; usernum < players; usernum++) {
    if (usernum === user){
        role = "drawer";
    }
    else {
        role = "guesser";
    }
    

    if (role === "drawer") {
    canvas.addEventListener("touchstart", start, false);
    canvas.addEventListener("touchmove", draw, false);
    canvas.addEventListener("mousedown", start, false);
    canvas.addEventListener("mousemove", draw, false);
    canvas.addEventListener("mouseup", stop, false);
    canvas.addEventListener("touchend", stop, false);
    canvas.addEventListener("mouseout", stop, false);
    }
    }
  })


//reset.addEventListener("click", clear);
//chatInput.addEventListener("click", send);

function start(event) {
    drawing = true;
    context.beginPath();
    // context.moveTo(event.clientX - canvas.offsetLeft,
    //                 event.clientY - canvas.offsetTop);
    context.moveTo(event.offsetX,
                event.offsetY);
    event.preventDefault();
}

function draw(event) {
    if(drawing === true) {
        // context.lineTo(event.clientX - canvas.offsetLeft, 
        //                 event.clientY - canvas.offsetTop);
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
let timer = getElementById("timer")
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
