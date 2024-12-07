const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static('public'));
let timer = 15 // default countdown before game starts
let roomsAndPlayers = {} // maps room code to socket ids
let roomsAndUsernames = {} // maps room code to usernames
let roomsAndTimers = {}
let roomsAndRounds = {}
let roomsAndDrawers = {}
let roomsUsersIds = {} // maps rooms to usernames and latest socket ids
let roomsAndSettings = {} // maps rooms to settings (drawTime, numRounds)
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
      roomsAndTimers[roomCode] = 15;
      roomsUsersIds[roomCode] = {};
      roomsAndSettings[roomCode] = {}; // keeps track of settings
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
  socket.on('startGame', (roomCode, drawTime, numRounds) => {
    // Log room settings to determine draw time and number of rounds later
    roomsAndSettings[roomCode]['drawTime'] = drawTime;
    roomsAndSettings[roomCode]['numRounds'] = numRounds;
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
      let seconds = 15;
      let countdown = setInterval(function () {
        if(seconds < 0) {
          //console.log("Clearing interval")
          clearInterval(countdown); 
        }
        else {
          io.to(roomCode).emit("updateStarterTimer", {roomName: roomCode, startingTimer: seconds});
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
    socket.to(data.roomName).emit('drawing', data);
  });
  socket.on("updateChoice", (data) => {
    socket.to(data.roomName).emit("updateChoice", {roomName: data.roomName, choice: data.choice})
  })
  socket.on("updateChat", (data) => {
    socket.to(data.roomName).emit("updateChat", {roomName: data.roomName, chat: data.chat})
  });
  socket.on("chooseDrawer", (roomCode) => {
    let playersIter = io.sockets.adapter.rooms.get(roomCode).values(); // set iterator, current socket ids connected to room
    let currentPlayers = [...playersIter]; // converts to array of socket ids
    let pastDrawers = roomsAndDrawers[roomCode];
    let drawer = undefined
    for(let i = 0; i < currentPlayers.length; i++) {
      if(!pastDrawers.includes(currentPlayers[i])) {
        drawer = currentPlayers[i];
        //console.log("Drawer: ", drawer); // TESTING
        //roomsAndDrawers[roomCode].push(drawer)
      }
    }
    let drawerUsername = Object.keys(roomsUsersIds[roomCode]).find(key => roomsUsersIds[roomCode][key] === drawer); // get username from socket id
    // console.log(drawerUsername); // TESTING
    io.to(roomCode).emit("DrawerChosen", drawer, drawerUsername) // sends socket id and username to display on screens
  });
  socket.on("updateBlanks", (data) => {
    io.to(data.roomName).emit("updateBlanks", {blanks: data.blanks})
  })
  socket.on('disconnect', () => {
  });
  socket.on('getSocketId', (roomCode, username) => {
    let socket_id = roomsUsersIds[roomCode][username];
    //console.log("!!! SOCKET ID: ", socket_id);
    socket.emit('returnSocketId', socket_id);
  })
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
