const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static('public'));
let roomName = ""
let roomsAndPlayers = {}
io.on('connection', (socket) => {
  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    roomName = roomName
    if(!roomsAndPlayers[roomName]) {
      roomsAndPlayers[roomName] = [];
    }
    roomsAndPlayers[roomName].push(socket.id)
    io.to(roomName).emit('updatePlayers', roomsAndPlayers[roomName])
    let chat = socket.id + " has joined the room!"
    io.to(roomName).emit("updateChat", {roomName: roomName, chat: chat})
  });
  socket.on('drawing', (data) => {
    socket.to(data.roomName).emit('drawing', data);
  });
  socket.on("updateChat", (data) => {
    socket.to(data.roomName).emit("updateChat", {roomName: data.roomName, chat: data.chat})
  });
  socket.on('disconnect', () => {
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
