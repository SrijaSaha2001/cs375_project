const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static('public'));
let roomsAndPlayers = {} // maps room code to socket ids
let roomsAndUsernames = {} // maps room code to usernames
let roomsAndTimers = {}
let roomsAndRounds = {}
let roomsAndDrawers = {}
let roomsUsersIds = {} // maps rooms to usernames and latest socket ids
let roomsAndSettings = {} // maps rooms to settings (drawTime, numRounds, numPlayers)
let roomsAndGuesses = {} // maps room to num of correct guesses per round
let roomsAndCorrectGuessers = {} // maps room to usernames of players who guess correctly
let roomsAndIntervals = {} // maps room to current draw time interval to clear when all players guess
let roomsAndTurns = {} // maps room to current number of drawing turns per round
let interval = undefined
let roomsAndCreators = {} // maps rooms with room creator's socket id

io.on('connection', (socket) => {
  // CREATE NEW ROOM
  socket.on('createRoom', (roomCode, username) => {
    socket.join(roomCode);
    if(!roomsAndPlayers[roomCode]) {
      console.log("Room Creator: ", socket.id); // TESTING
      roomsAndCreators[roomCode] = username; // keep track of creator
      roomsAndPlayers[roomCode] = [];
      roomsAndDrawers[roomCode] = [];
      roomsAndUsernames[roomCode] = [];
      roomsAndTimers[roomCode] = 10;
      roomsUsersIds[roomCode] = {};
      roomsAndSettings[roomCode] = {}; // keeps track of settings
      roomsAndRounds[roomCode] = 0; // keeps track of what round it is
      roomsAndGuesses[roomCode] = 0;
      roomsAndCorrectGuessers = [];
      roomsAndTurns[roomCode] = 0;
    }
    roomsAndPlayers[roomCode].push(socket.id);
  });
  socket.on('updateRoomCode', (roomCode, username) => {
    // Updates room code on settings + lobby pages to copy + share with friends
    socket.emit('updateCode', roomCode);
  });
  // VALIDATION FOR JOINING WITH ROOM CODE
  socket.on('roomExists', (roomName, username) => {
    // Validate room code exists
    let currentRooms = Object.keys(roomsAndPlayers);
    if(currentRooms.includes(roomName)) {
      socket.emit("roomExists", roomName, username);
    }
    else {
      socket.emit("roomInvalid", roomName);
    }
  });

  // JOIN ROOM WITH CODE
  socket.on('joinRoom', (roomName, username) => {
    socket.join(roomName);

    // Checks if username has been seen before -- prevents duplicate entries upon redirection  
    //let names = Object.keys(usernamesAndIds);
    let names = Object.keys(roomsUsersIds[roomName]);
    //console.log("Names: ", names);
    if(!names.includes(username)) {
      //console.log("Pushing user [", username, "] to room [", roomName, "]");
      roomsAndUsernames[roomName].push(username); // maps room code to username
    }
    //usernamesAndIds[username] = socket.id; // add/update username with current socket id
    roomsUsersIds[roomName][username] = socket.id
    //console.log("Usernames + IDs: ", usernamesAndIds[roomName]);
    //console.log("Rooms and usernames: ", roomsUsersIds[roomName]);

    // Get sockets in room
    // let temp = io.sockets.adapter.rooms.get(roomName);
    //console.log("Current connections: ", temp); // TESTING

    io.to(roomName).emit('updatePlayers', roomsAndUsernames[roomName]);

    /* //!! This was the old code for joining rooms when the user was redirected to main page instead of lobby
    if(!roomsAndPlayers[roomName]) {
      //console.log("TEST 1:", socket.id); // TESTING
      //console.log("ROOM: ", roomName);
      roomsAndPlayers[roomName] = [];
      roomsAndDrawers[roomName] = [];
      roomsAndTimers[roomName] = 15;
      io.to(roomName).emit("updateStarterTimer", {roomName: roomName, startingTimer: timer})
    }
    socket.on('updateTimer', (data) => {
      io.to(data.roomName).emit('updateTimer',{roomName: roomName, timer: timer})
    })
    roomsAndPlayers[roomName].push(socket.id)
    //console.log("TEST 2:", socket.id); // TESTING
    //console.log(roomsAndPlayers[roomName]); // TESTING
    io.to(roomName).emit('updatePlayers', roomsAndPlayers[roomName])
    let chat = socket.id + " has joined the room!"
    io.to(roomName).emit("updateChat", {roomName: roomName, chat: chat})
    */
  });
  // Start game when room creator presses "start game" button in settings page
  socket.on('startGame', (roomCode, drawTime, numRounds, numPlayers) => {
    // Log room settings to determine draw time and number of rounds later
    roomsAndSettings[roomCode]['drawTime'] = drawTime;
    roomsAndSettings[roomCode]['numRounds'] = numRounds;
    roomsAndSettings[roomCode]['numPlayers'] = numPlayers;
    // console.log("SETTINGS: ", roomsAndSettings[roomCode]); // TESTING
    io.to(roomCode).emit('start', roomCode); // redirects everyone to the main page
    //io.to(roomCode).emit("updateStarterTimer", {roomName: roomCode, startingTimer: 15})
  });
  socket.on('beginCountdown', (roomCode, username) => {
    // Ensures countdown is triggered once by the room creator to avoid problems
    let creatorUsername = roomsAndCreators[roomCode];
    let creatorId = roomsUsersIds[roomCode][creatorUsername];
    //console.log("Creator ID: ", creatorId, " --- Passed ID: ", socket.id); // TESTING
    // Only proceed with countdown upon matching creator's socket id
    if(creatorId == socket.id) {
      let seconds = 10;
      let countdown = setInterval(function () {
        if(seconds < 0) {
          //console.log("Clearing interval")
          clearInterval(countdown); 
        }
        else {
          io.to(roomCode).emit("updateStarterTimer", {roomCode: roomCode, startingTimer: seconds});
          seconds--;
        }
      }, 1000);
    }
  })
  /*if(interval) {
    clearInterval(interval)
  }
  interval = setInterval(function () {
    for (const [roomName, timer] of Object.entries(roomsAndTimers)) {
      //console.log("TIMER 1: ", timer); // TESTING
      roomsAndTimers[roomName] = timer - 1;
      //console.log("TIMER 2: ", timer); // TESTING
      if(roomsAndTimers[roomName] >= 0) {
        //console.log("UPDATING START TIMER"); // TESTING
        io.to(roomName).emit("updateStarterTimer", {roomName: roomName, startingTimer: roomsAndTimers[roomName]})
      }
    }
  }, 1000) */
  socket.on('drawing', (data) => {
    socket.to(data.roomCode).emit('drawing', data);
  });
  socket.on("updateChoice", (data) => {
    socket.to(data.roomCode).emit("updateChoice", {roomCode: data.roomCode, choice: data.choice})
  })
  socket.on("updateChat", (data) => {
    socket.to(data.roomCode).emit("updateChat", {roomCode: data.roomCode, chat: data.chat})
  });
  socket.on("chooseDrawer", (roomCode) => {
    let creatorUsername = roomsAndCreators[roomCode];
    let creatorId = roomsUsersIds[roomCode][creatorUsername];
    if(creatorId == socket.id) { // makes sure this is only decided once
      roomsAndGuesses[roomCode] = 0; // reset count for correct guesses upon new turn
      let playersIter = io.sockets.adapter.rooms.get(roomCode).values(); // set iterator, current socket ids connected to room
      let currentPlayers = [...playersIter]; // converts to array of socket ids
      let i = roomsAndTurns[roomCode]; // turn count used as index to determine next drawer
      console.log('index: ', i);
      let drawer = currentPlayers[i]; // choose drawer in order 
      let drawerUsername = Object.keys(roomsUsersIds[roomCode]).find(key => roomsUsersIds[roomCode][key] === drawer); // get username from socket id
      console.log("drawer: ", drawerUsername);
      // console.log(drawerUsername); // TESTING
      io.to(roomCode).emit("DrawerChosen", drawer, drawerUsername) // sends socket id and username to display on screens
      roomsAndTurns[roomCode]++;
    }
    
    /*let pastDrawers = roomsAndDrawers[roomCode];
    let drawer = undefined
    for(let i = 0; i < currentPlayers.length; i++) {
      if(!pastDrawers.includes(currentPlayers[i])) {
        drawer = currentPlayers[i];
        //console.log("Drawer: ", drawer); // TESTING
        //roomsAndDrawers[roomCode].push(drawer)
      }
    } */
    
  });
  socket.on("updateBlanks", (data) => {
    io.to(data.roomCode).emit("updateBlanks", {blanks: data.blanks})
  })
  socket.on('disconnect', () => {
  });
  socket.on('getSocketId', (roomCode, username) => {
    let socket_id = roomsUsersIds[roomCode][username];
    //console.log("!!! SOCKET ID: ", socket_id);
    socket.emit('returnSocketId', socket_id);
  })
  socket.on('startDrawTime', (roomCode) => {
    console.log("starting draw time");
    let drawTime = roomsAndSettings[roomCode]['drawTime'];
    console.log("time: ", drawTime);
    roomsAndIntervals[roomCode] = setInterval(function () { // begin countdown
      if(drawTime < 1) {
        clearInterval(roomsAndIntervals[roomCode]);
        console.log("cleared interval")
        io.to(roomCode).emit('endTurn', roomCode); // end turn
      }
      else {
        io.to(roomCode).emit('updateDrawTime', drawTime); // update draw time for users
        drawTime--;
      }
    }, 1000);
  });
  socket.on('clearPopup', (roomCode, drawerId) => {
    io.to(roomCode).emit('clearPopup', drawerId);
  });
  socket.on('newRound', (roomCode) => {
    let creatorUsername = roomsAndCreators[roomCode];
    let creatorId = roomsUsersIds[roomCode][creatorUsername];
    if(creatorId == socket.id) { // makes sure new round starts only one time
      console.log("NEW ROUND")
      let round = roomsAndRounds[roomCode]; // current number of rounds
      let numRounds = roomsAndSettings[roomCode]['numRounds'];
      if(round == numRounds) {
        io.to(roomCode).emit('endGame', roomCode); // end game after all rounds finish
      }
      else {
        roomsAndRounds[roomCode]++;
        round++;
        roomsAndTurns[roomCode] = 0; // clear turn count for new rounds
        io.to(roomCode).emit('newRound', round, numRounds); // send current round and total number of rounds
      }
    }
  });
  socket.on('correctGuess', (roomCode, username) => { // username is player who sent the chat
    //let currentUsername = Object.keys(roomsUsersIds[roomCode]).find(key => roomsUsersIds[roomCode][key] === socket_id);
    //console.log("current username: ", currentUsername, " -- user from chat: ", username);
      io.to(roomCode).emit('updateScore', username, 50);
      console.log("CORRECT GUESS")
      roomsAndGuesses[roomCode]++;
      let count = roomsAndGuesses[roomCode]; // current number of correct guesses
      let numPlayers = roomsAndSettings[roomCode]['numPlayers']
      console.log('guesses: ', count, 'num players: ', numPlayers);
      if(count === (numPlayers - 1)) { // all guessers have guesses correctly
        clearInterval(roomsAndIntervals[roomCode]); // clear drawing time interval
        console.log('interval cleared for correct guess')
        io.to(roomCode).emit('updateDrawTime', 0); // reset draw time
        //io.to(roomCode).emit('endTurn', roomCode);
        if(roomsAndTurns[roomCode] == numPlayers) { // start new round
          let round = roomsAndRounds[roomCode];
          io.to(roomCode).emit('endRound', round)
        }
        else { // assign next drawer/start new turn
          io.to(roomCode).emit('newTurn', roomCode);
        }
      }
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
