const socket = io();

// Gets username and room code from URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let username = urlParams.get('username'); // get username from URL
let roomCode = urlParams.get('room'); // get room code from URL
//console.log("Username: ", username, " - Room: ", roomCode); // TESTING
let socketID = undefined; // temporary

// Updates username's associated socket id after redirection
//socket.emit('redirected', roomCode, username);
socket.emit('joinRoom', roomCode, username);
socket.emit('getSocketId', roomCode, username);
socket.on('returnSocketId', (socket_id) => {
    socketID = socket_id;
    // console.log("SOCKET ID: ", socketID);
})

//declared variables
let scoreboard = {}
let drawing = false;
let lastX = 0;
let lastY = 0;
let drawcolor = "black";
let drawwidth = "5";
let drawingActions = []
let chatHistory = []
let chatlog = document.getElementById("chatlog")
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let popup = document.getElementById("popup");
let choice1 = document.getElementById("choice1");
let choice2 = document.getElementById("choice2");
let choice3 = document.getElementById("choice3");
let currentChoice = ""
let words = {}
let allWords = ""
let input = document.getElementById("input").value;
let chat = document.getElementById("input");
let timer = document.getElementById("timer");
let blanks = document.getElementById("blanks");
let currentTime = timer.textContent;
let width = document.getElementById("width");
let content = document.getElementById("input");
let grey = true;
let blankInterval = ""
let sendText = document.getElementById("enterText")
let restore = [];
let index = -1;
let starterTime = 15;
let undoButton = document.getElementById("undo");
let clearButton = document.getElementById("clear");

let currentDrawer = undefined; // socket id of current drawer

//getting the current width
width.addEventListener("click", () => {
    drawwidth = width.value
})

//getting the current color being used
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

//variable to guess if a correct guess has been made
let guessCorrect = false

//setting canvas details
let startcol = "white";
context.fillStyle = startcol;
context.fillRect(0, 0, canvas.width, canvas.height);
canvas.style.alignSelf = "center";

//function to update the players section with current player ids in the room
function updateScoreBoard(players) {
    let playersList = document.getElementById("mainplayers")
    playersList.textContent = ""
    //console.log("Here")
    //console.log("Players: ", players)
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
        //console.log(scoreboard)
        playersList.append(row)
    })
}
function changeColor(element) {
    drawcolor = element.style.background;
}
function changeSize(value) {
    drawwidth = value;
}

// Being countdown of 15 seconds before starting game and choosing roles
socket.emit('beginCountdown', roomCode, socketID);

//interval to get the timer to tick down
/*
setInterval(function () {
    currentTime--;
    timer.textContent = currentTime;
}, 1000) */

//function to display the words that can be selected from
function showDiv() {
    popup.style.display = "flex"
}
    

//shows the words to be chosen after 3 seconds of loading the screen
window.onload = function(){
    setTimeout(showDiv, 3000);
}


//function to create a string with blanks to use as a clue
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

//event listener for the first choice
choice1.addEventListener("click", () => {
    //sets the current choice 
    let choosingPopup = document.getElementById("starterPopup")
    choosingPopup.style.display = "none";
    
    // clear popup for guessers that say "[username] is choosing!" upon selecting word
    socket.emit('clearPopup', roomCode, currentDrawer);

    currentChoice = choice1.textContent;
    socket.emit('updateChoice', {roomCode: roomCode, choice: currentChoice})
    words["choice1"] = choice1.textContent
    //removes the popup
    popup.style.display = "none"

    //adjusts the timer based on the length of the word
    /*timer.textContent = currentChoice.length * 10;
    currentTime = timer.textContent; */

    // Get draw time and begin countdown upon choosing word
    socket.emit('startDrawTime', roomCode);

    guessCorrect = false
    //adds the blanks
    addBlanks(currentChoice)
    if(!guessCorrect) {
        //randomly fills in the blanks with one letter per 10 seconds
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
            socket.emit("updateBlanks", {roomCode: roomCode, blanks: newBlanks})
        }, 10000)
    }
});

//event listener for the second choice
choice2.addEventListener("click", () => {
    //sets the current choice
    let choosingPopup = document.getElementById("starterPopup")
    choosingPopup.style.display = "none";

    // clear popup for guessers that say "[username] is choosing!" upon selecting word
    socket.emit('clearPopup', roomCode, currentDrawer);

    currentChoice = choice2.textContent
    socket.emit('updateChoice', {roomCode: roomCode, choice: currentChoice})
    words["choice2"] = choice2.textContent
    //removes the popup
    popup.style.display = "none"

    //adjusts the timer based on the length of the word
    /*timer.textContent = currentChoice.length * 10;
    currentTime = timer.textContent; */

    // Get draw time and begin countdown upon choosing word
    socket.emit('startDrawTime', roomCode);

    guessCorrect = false
    //adds the blanks
    addBlanks(currentChoice)
    if(!guessCorrect) {
        //randomly fills in the blanks with one letter per 10 seconds
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
            socket.emit("updateBlanks", {roomCode: roomCode, blanks: newBlanks})
        }, 10000)
    }
});

//event listener for the third choice
choice3.addEventListener("click", () => {
    //sets the current choice
    let choosingPopup = document.getElementById("starterPopup")
    choosingPopup.style.display = "none";

    // clear popup for guessers that say "[username] is choosing!" upon selecting word
    socket.emit('clearPopup', roomCode, currentDrawer);

    currentChoice = choice3.textContent
    socket.emit('updateChoice', {roomCode: roomCode, choice: currentChoice})
    words["choice3"] = choice3.textContent
    //removes the popup
    popup.style.display = "none"

    //adjusts the timer based on the length of the word
    /* timer.textContent = currentChoice.length * 10;
    socket.emit("updateTimer", {roomCode: roomCode, timer: timer.textContent})
    currentTime = timer.textContent; */

    // Get draw time and begin countdown upon choosing word
    socket.emit('startDrawTime', roomCode);

    guessCorrect = false
    //adds the blanks
    addBlanks(currentChoice)
    if(!guessCorrect) {
        //randomly fills in the blanks with one letter per 10 seconds
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
            socket.emit("updateBlanks", {roomCode: roomCode, blanks: newBlanks})
        }, 10000)
    }
});
//to assign roles and loop through players
/*function assignrole(players) {
    for(let i = 0; i < players.length; i++) {
        setTimeout(() => {
            if (socket.id === players[i]) {
            let role = "drawer";
            }
            else {
            role = "guesser";
            }
        }, (timer.textContent*1000));
    }
}*/

function start(event) {
    drawing = true;
    lastX = event.offsetX;
    lastY = event.offsetY;
    context.lineWidth = drawwidth;
    context.strokeStyle = drawcolor;
    event.preventDefault()
}

function draw(x1, y1, x2, y2, color, width) {
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

function stop(event) {
    if (drawing === true) {
        context.stroke();
        context.closePath();
        drawing = false;
    }
    event.preventDefault();
    if(event.type != 'mouseout') {
        restore.push(context.getImageData(0, 0, canvas.width, canvas.height));
        index += 1;
    }
}

function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = startcol;
    context.fillRect(0, 0, canvas.width, canvas.height);
    restore = [];
    index = -1;
}

function undo() {
    if (index <= 0) {
        console.log('cleared');
        clear();
    }
    else {
        console.log("else")
        index-= 1;
        restore.pop();
        context.putImageData(restore[index], 0, 0);
    }
    ///socket.emit("undo", roomCode);
}


undoButton.addEventListener("click", () => {
    undo();
    socket.emit("undo", roomCode);
});

clearButton.addEventListener("click", () => {
    clear();
    socket.emit("clear", roomCode); 
})

canvas.addEventListener("touchstart", start, false);
canvas.addEventListener("touchmove", (event) => {
    if (drawing) {
        draw(lastX, lastY, event.offsetX, event.offsetY, drawcolor, drawwidth);
        socket.emit('drawing', {
          roomCode: roomCode,
          lastX: lastX,
          lastY: lastY,
          currentX: event.offsetX,
          currentY: event.offsetY,
          drawing: true,
          color: drawcolor,
          width: drawwidth
        });
        lastX = event.offsetX;
        lastY = event.offsetY;
      }
      event.preventDefault();
    }, true);
canvas.addEventListener("touchend", stop, false);
canvas.addEventListener('mousedown', start, false);
canvas.addEventListener('mousemove', (event) => {
    if (drawing) {
        draw(lastX, lastY, event.offsetX, event.offsetY, drawcolor, drawwidth);
        socket.emit('drawing', {
          roomCode: roomCode,
          lastX: lastX,
          lastY: lastY,
          currentX: event.offsetX,
          currentY: event.offsetY,
          drawing: true,
          color: drawcolor,
          width: drawwidth
        });
        lastX = event.offsetX;
        lastY = event.offsetY;
      }
    }, true);
canvas.addEventListener('mouseup', stop, false)
canvas.addEventListener('mouseout', stop, false)

//function to generate words from random list of words
function generateWords(text) {
    var arrayOfWords = text.split(",")
    var num1 = Math.floor(Math.random() * arrayOfWords.length);
    var num2 = Math.floor(Math.random() * arrayOfWords.length);
    var num3 = Math.floor(Math.random() * arrayOfWords.length);
    choice1.textContent = arrayOfWords[num1]
    choice2.textContent = arrayOfWords[num2]
    choice3.textContent = arrayOfWords[num3]
}

//reads all words in a txt file and chooses 3 randoms words for options
fetch("words.txt").then((res) => 
    res.text()
    ).then((text) => {
        allWords = text
        generateWords(text)
   }).catch((e) => 
    console.error(e));

//event listener for sending chats in the chatboard    
sendText.addEventListener("click", () => {
    console.log(socketID, currentDrawer);
    if(socketID !== currentDrawer) { // limit chat functionality to guessers only
        let chat =  username + ": " + document.getElementById("input").value;
        console.log(chat);
        send(chat)
        socket.emit("updateChat", {roomCode: roomCode, chat: chat})
    }
})



//function to send chat as well as check if the message sent is the right answer
function send(chat) {
    let log = document.getElementById("logs");      
    if((chat.split(':')[1]) && (chat.split(':')[1].trim().toLowerCase() === currentChoice.trim().toLowerCase())) {
        guessCorrect = true
        clearInterval(blankInterval)
        blanks.textContent = chat.split(':')[1].trim().toLowerCase()
        //generateWords(allWords)
        //popup.style.display = "flex"
        //timer.textContent = 60;
        //currentTime = timer.textContent;
        let name = chat.split(':')[0]
        chat = chat.split(':')[0] + " got it right!"
        if(username === name) {
            scoreboard[username] = scoreboard[username] + 50
            console.log("scoreboard: ", scoreboard);
            socket.emit('correctGuess', roomCode, username);
        }
    }
    let inputVal = chat;
    let div = document.createElement("div");
    div.textContent = inputVal;
    if (grey) {
        div.classList.add("greyline");
    } else {
        div.classList.add("whiteline");
    }
    grey = !grey;
    log.append(div);
    chat.value = " ";
}

socket.on("updateChat", (data) => {
    console.log(data.roomCode);
    send(data.chat);
})
socket.on("updateChoice", (data) => {
    addBlanks(data.choice)
    currentChoice = data.choice
    let choosingPopup = document.getElementById("starterPopup")
    choosingPopup.style.display = "none";
})
socket.on("updateBlanks", (data) => {
    blanks.textContent = data.blanks;
})
socket.on('updatePlayers', (players) => {
    updateScoreBoard(players)
})
socket.on('updateScore', (name, score) => {
    let playersList = document.getElementById("mainplayers") // get scoreboard
    console.log("list: ", playersList)
    let players = playersList.childNodes;
    for(row of players) {
        values = row.childNodes;
        if(values[0].textContent === name) {
            currentScore = parseInt(values[1].textContent);
            values[1].textContent = currentScore + score;
        }
    }
})

socket.on('drawing', (data) => {
    draw(data.lastX, data.lastY, data.currentX, data.currentY, data.color, data.width);
});

socket.on("updateStarterTimer", (data) => {
    if(data.startingTimer !== 0) {
        starterTime = data.startingTimer
        let timer = document.getElementById("starterPopup")
        timer.textContent = "Game starting in: " + starterTime;
        //socket.emit("updateStarterTimer", {roomCode: roomCode, startingTimer: starterTime})
        //starterTime--;
    }
    else {
        let timer = document.getElementById("starterPopup");
        timer.style.display = "none"
        socket.emit('newRound', roomCode); 
        //socket.emit("chooseDrawer", roomCode)
    }
})

socket.on('newTurn', (roomCode) => {
    console.log('new turn')
    socket.emit("chooseDrawer", roomCode)
})

socket.on('endTurn', (roomCode) => {
    socket.emit('newTurn', roomCode);
})

socket.on("newRound", (currentRound, numRounds) => {
    console.log("new round")
    let roundText = document.getElementById("roundTracker");
    roundText.textContent = "Round " + currentRound + "/" + numRounds; // update rounds 
    socket.emit("chooseDrawer", roomCode)
})

socket.on("endRound", (round) => {
    console.log("end round")
    let popup = document.getElementById("starterPopup");
    popup.textContent = "Round " + round + " has ended!";
    popup.style.display = "flex"
    socket.emit("newRound", roomCode); // begin new round
    popup.style.display = "none";
})

socket.on('endGame', (roomCode) => {
    console.log("end game")
    let url = 'http://localhost:3000/results_page.html?username=' + username + '&room=' + roomCode;
    window.location.href = url;
})

socket.on("DrawerChosen", (socket_id, username) => { // socket_id is drawer
    currentDrawer = socket_id;
    generateWords(allWords);
    if(socket_id === socket.id) {
        //console.log("EQUALS")
        popup.style.display = "flex"
    }
    else {
        //console.log("NOT EQUALS")
        popup.style.display = "none"
        let timer = document.getElementById("starterPopup")
        timer.textContent = username + " is choosing!"
        timer.style.display = "flex"
    }
})

// Clears popup for guessers once drawer chooses a word
socket.on('clearPopup', (drawerId) => {
    if(socketID !== drawerId) { // user is a guesser, clear popup
        let choosingPopup = document.getElementById("starterPopup")
        choosingPopup.style.display = "none";
    }
})

socket.on('updateDrawTime', (drawTime) => {
    timer.textContent = drawTime;
});

socket.on("undo", (roomCode) => {
    undo();
});

socket.on("clear", (roomCode) => {
    clear();
})
