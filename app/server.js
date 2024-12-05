const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static('public'));
let timer = 0
let roomsAndPlayers = {}
let roomsAndTimers = {}
let roomsAndRounds = {}
let roomsAndDrawers = {}
let interval = undefined
io.on('connection', (socket) => {
  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    if(!roomsAndPlayers[roomName]) {
      roomsAndPlayers[roomName] = [];
      roomsAndDrawers[roomName] = [];
      roomsAndTimers[roomName] = 15;
      socket.to(roomName).emit('updateStarterTimer', {roomName: roomName, startingTimer: timer})
    }
    socket.on('updateTimer', (data) => {
      io.to(data.roomName).emit('updateTimer',{roomName: roomName, timer: timer})
    })
    roomsAndPlayers[roomName].push(socket.id)
    io.to(roomName).emit('updatePlayers', roomsAndPlayers[roomName])
    let chat = socket.id + " has joined the room!"
    io.to(roomName).emit("updateChat", {roomName: roomName, chat: chat})
  });
  if(interval) {
    clearInterval(interval)
  }
  interval = setInterval(function () {
    for (const [roomName, timer] of Object.entries(roomsAndTimers)) {
      roomsAndTimers[roomName] = timer - 1;
      if(roomsAndTimers[roomName] >= 0) {
        io.to(roomName).emit("updateStarterTimer", {startingTimer: roomsAndTimers[roomName]})
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
  socket.on("chooseDrawer", (data) => {
    let currentPlayers = roomsAndPlayers[data.roomName];
    let pastDrawers = roomsAndDrawers[data.roomName];
    let drawer = undefined
    for(let i = 0; i < currentPlayers.length; i++) {
      if(!pastDrawers.includes(currentPlayers[i])) {
        drawer = currentPlayers[i];
        roomsAndDrawers[data.roomName].push(drawer)
      }
    }
    io.to(data.roomName).emit("DrawerChosen", {socket_id: drawer})
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
