const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomName = urlParams.get('room');
socket.emit('joinRoom', roomName);
let scoreboard = {}
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let drawcolor = "black";
let drawwidth = "5";
let drawingActions = []
let chatHistory = []
let chatlog = document.getElementById("chatlog")
const canvas = document.getElementById('canvas');
const rect = canvas.getBoundingClientRect();
const context = canvas.getContext('2d');
let popup = document.getElementById("popup");
let choice1 = document.getElementById("choice1");
let choice2 = document.getElementById("choice2");
let choice3 = document.getElementById("choice3");
let currentChoice = ""
let words = {}
let allWords = ""
let input = document.getElementById("input").value;
let chat = document.getElementById("input")
let timer = document.getElementById("timer");
let blanks = document.getElementById("blanks");
let currentTime = timer.textContent;
let width = document.getElementById("width")
let content = document.getElementById("input")
let grey = true;
let blankInterval = ""
let sendText = document.getElementById("enterText")
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
let guessCorrect = false
let startcol = "white";
context.fillStyle = startcol;
context.fillRect(0, 0, canvas.width, canvas.height);

canvas.style.alignSelf = "center";
function recordChat(chats) {
    socket.emit('updateChat', chats)
    chatHistory.push(chats)
}
function updateScoreBoard(players) {
    let playersList = document.getElementById("mainplayers")
    playersList.textContent = ""
    console.log("Here")
    console.log("Players: ", players)
    players.forEach((player) => {
        console.log(player)
        let row = document.createElement("tr")
        let column1 = document.createElement("td")
        let column2 = document.createElement("td")
        column1.textContent = player
        column2.textContent = 0
        row.appendChild(column1)
        row.appendChild(column2)
        scoreboard[player] = 0
        console.log(scoreboard)
        playersList.append(row)
    })
}
function joinRoom() {
    if (roomName) {
        console.log("Room name", roomName)
     socket.emit('joinRoom', roomName);
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
setInterval(function () {
    currentTime--;
    timer.textContent = currentTime;
}, 1000)
function showDiv() {
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
    timer.textContent = currentChoice.length * 10;
    currentTime = timer.textContent;
    guessCorrect = false
    addBlanks(currentChoice)
    if(!guessCorrect) {
        blankInterval = setInterval(function () {
            let currentBlanks = blanks.textContent.split(" ")
            let randomNum = Math.floor(Math.random() * currentChoice.length)
            
            let character = currentChoice.charAt(randomNum)
            let newBlanks = ""
    
            for(let i = 0; i < currentChoice.length; i++) {
                if((i === randomNum) && (currentBlanks[i] === '_')) {
                    newBlanks =  newBlanks + character + " "
                }
                else if(currentBlanks[i] !== '_') {
                    newBlanks =  newBlanks + currentBlanks[i] + " "
                }
                else if(currentChoice[i] === ' '){
                    newBlanks = newBlanks + " "
                }
                else {
                    newBlanks = newBlanks + "_ "
                }
            }
            blanks.textContent = newBlanks
        }, 10000)
    }
});
choice2.addEventListener("click", () => {
    currentChoice = choice2.textContent
    words["choice2"] = choice2.textContent
    popup.style.display = "none"
    timer.textContent = currentChoice.length * 10;
    currentTime = timer.textContent;
    guessCorrect = false
    addBlanks(currentChoice)
    if(!guessCorrect) {
        blankInterval = setInterval(function () {
            let currentBlanks = blanks.textContent.split(" ")
            let randomNum = Math.floor(Math.random() * currentChoice.length)
            
            let character = currentChoice.charAt(randomNum)
            let newBlanks = ""
    
            for(let i = 0; i < currentChoice.length; i++) {
                if((i === randomNum) && (currentBlanks[i] === '_')) {
                    newBlanks =  newBlanks + character + " "
                }
                else if(currentBlanks[i] !== '_') {
                    newBlanks =  newBlanks + currentBlanks[i] + " "
                }
                else if(currentChoice[i] === ' '){
                    newBlanks = newBlanks + " "
                }
                else {
                    newBlanks = newBlanks + "_ "
                }
            }
            blanks.textContent = newBlanks
        }, 10000)
    }
});
choice3.addEventListener("click", () => {
    currentChoice = choice3.textContent
    words["choice3"] = choice3.textContent
    popup.style.display = "none"
    timer.textContent = currentChoice.length * 10;
    currentTime = timer.textContent;
    guessCorrect = false
    addBlanks(currentChoice)
    if(!guessCorrect) {
        blankInterval = setInterval(function () {
            let currentBlanks = blanks.textContent.split(" ")
            let randomNum = Math.floor(Math.random() * currentChoice.length)
            
            let character = currentChoice.charAt(randomNum)
            let newBlanks = ""
    
            for(let i = 0; i < currentChoice.length; i++) {
                if((i === randomNum) && (currentBlanks[i] === '_')) {
                    newBlanks =  newBlanks + character + " "
                }
                else if(currentBlanks[i] !== '_') {
                    newBlanks =  newBlanks + currentBlanks[i] + " "
                }
                else if(currentChoice[i] === ' '){
                    newBlanks = newBlanks + " "
                }
                else {
                    newBlanks = newBlanks + "_ "
                }
            }
            blanks.textContent = newBlanks
        }, 10000)
    }
});
canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        let currentX = e.offsetX;
        let currentY = e.offsetY;
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
        context.strokeStyle = drawcolor;
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(currentX, currentY);
        context.stroke();
        lastX = currentX;
        lastY = currentY;
      }
    });
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
    choice1.textContent = arrayOfWords[num1]
    choice2.textContent = arrayOfWords[num2]
    choice3.textContent = arrayOfWords[num3]
}
fetch("words.txt").then((res) => 
    res.text()
    ).then((text) => {
        allWords = text
        generateWords(text)
   }).catch((e) => 
    console.error(e));
function start(event) {
    isDrawing = true;
    
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
sendText.addEventListener("click", () => {
    let chat =  socket.id + ": " + document.getElementById("input").value;
    socket.emit("updateChat", {roomName: roomName, chat: chat})
    send(chat)
})
function send(chat) {
    let log = document.getElementById("logs");       
    if((chat.split(':')[1]) && (chat.split(':')[1].trim().toLowerCase() === currentChoice.trim().toLowerCase())) {
        guessCorrect = true
        clearInterval(blankInterval)
        blanks.textContent = chat.split(':')[1].trim().toLowerCase()
        scoreboard[socket.id] = scoreboard[socket.id] + 50
        socket.emit("updateScoreBoard", {roomName: roomName, scoreboard: scoreboard})
        generateWords(allWords)
        console.log(scoreboard)
        socket.emit('', )
        popup.style.display = "flex"
        timer.textContent = 60;
        currentTime = timer.textContent;
        chat = chat.split(':')[0] + " got it right!"
    }
    inputVal = chat;
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

socket.on("updateChat", (data) => {
    if((data.roomName === roomName) && (data.chat)) {
        send(data.chat)
    }
})
socket.on('updatePlayers', (players) => {
    updateScoreBoard(players)
})
socket.on("updateScoreBoard", (data) => {
    if(data.roomName === roomName) {
        let playersList = document.getElementById("mainplayers")
    playersList.textContent = ""

    let currentscoreboard = data.scoreboard
    for (let [player, score] of Object.entries(currentscoreboard)) {
        console.log(player)
        console.log("Score: ", score)
        let row = document.createElement("tr")
        let column1 = document.createElement("td")
        let column2 = document.createElement("td")
        column1.textContent = player
        column2.textContent = score
        row.appendChild(column1)
        row.appendChild(column2)
        scoreboard[player] = score
        console.log(scoreboard)
        playersList.append(row)
    }
}
})
socket.on('previousHistory', (actions) => {
    actions.forEach((action) => {
        console.log(action)
        context.beginPath();
        context.moveTo(action.currentX, action.currentY);
        context.lineTo(action.lastX, action.lastY);
        context.stroke();
    })
})
socket.on('drawing', (data) => {
    if (data.roomName === roomName && data.drawing) {
        drawLine(data.lastX, data.lastY, data.currentX, data.currentY, data.color);
    }
});