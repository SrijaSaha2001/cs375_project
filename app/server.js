const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));
let previousDrawings = []
let players = []
let roomsAndPlayers = {}
io.on('connection', (socket) => {

  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    if(!roomsAndPlayers[roomName]) {
      roomsAndPlayers[roomName] = [];
    }
    roomsAndPlayers[roomName].push(socket.id)
    io.to(roomName).emit('updatePlayers', roomsAndPlayers[roomName])
    const roomSockets = Array.from(io.sockets.adapter.rooms.get(roomName))
    console.log(roomSockets)
    players = roomSockets
    //socket.emit('currentPlayers', players);
    players.push(socket.id)
    //let players = document.getElementById("")
  });

  socket.emit('previousHistory', previousDrawings);
  socket.on('updateScoreBoard', (data) => {
    socket.broadcast.to(data.roomName).emit("updateScoreBoard", {
      roomName: data.roomName,
      scoreboard: data.scoreboard
    })
  })
  socket.on('drawing', (data) => {
    previousDrawings.push(data)
    socket.to(data.roomName).emit('drawing', data);
  });

  socket.on("updateChat", (data) => {
    socket.broadcast.to(data.roomName).emit("updateChat", {
      roomName: data.roomName,
      chat: data.chat
    })
  });

  socket.on('disconnect', () => {
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
