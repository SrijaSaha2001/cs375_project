const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static('public'));
let timer = 0
let roomsAndPlayers = {} // maps room code to socket ids
let roomsAndUsernames = {} // maps room code to usernames
let roomsAndTimers = {}
let roomsAndRounds = {}
let roomsAndDrawers = {}
let usernamesAndIds = {} // maps usernames to socket ids
let interval = undefined

io.on('connection', (socket) => {
  // CREATE NEW ROOM
  socket.on('createRoom', (roomCode, username) => {
    socket.join(roomCode);
    if(!roomsAndPlayers[roomCode]) {
      console.log("Room Creator: ", socket.id); // TESTING
      roomsAndPlayers[roomCode] = [];
      roomsAndDrawers[roomCode] = [];
      roomsAndUsernames[roomCode] = [];
      roomsAndTimers[roomCode] = 15;
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
    let names = Object.keys(usernamesAndIds);
    if(!names.includes(username)) {
      console.log("Pushing user [", username, "] to room [", roomName, "]");
      roomsAndUsernames[roomName].push(username); // maps room code to username
    }
    usernamesAndIds[username] = socket.id; // add/update username with current socket id
    
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
  socket.on('startGame', (roomCode) => {
    io.to(roomCode).emit('start', roomCode); // redirects everyone to the main page
    io.to(roomCode).emit("updateStarterTimer", {roomName: roomCode, startingTimer: 15})
    socket.on('updateTimer', (data) => {
      io.to(roomCode).emit('updateTimer',{roomName: roomCode, timer: timer})
    })
  });
  if(interval) {
    clearInterval(interval)
  }
  interval = setInterval(function () {
    for (const [roomName, timer] of Object.entries(roomsAndTimers)) {
      roomsAndTimers[roomName] = timer - 1;
      if(roomsAndTimers[roomName] >= 0) {
        io.to(roomName).emit("updateStarterTimer", {roomName: roomName, startingTimer: roomsAndTimers[roomName]})
      }
    }
  }, 1000)
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
    let drawerUsername = Object.keys(usernamesAndIds).find(key => usernamesAndIds[key] === drawer); // get username from socket id
    // console.log(drawerUsername); // TESTING
    io.to(roomCode).emit("DrawerChosen", drawer, drawerUsername) // sends socket id and username to display on screens
  });
  socket.on("updateBlanks", (data) => {
    io.to(data.roomName).emit("updateBlanks", {blanks: data.blanks})
  })
  socket.on('disconnect', () => {
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
