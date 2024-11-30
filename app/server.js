const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (for frontend)
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
  console.log('a user connected');

  // Join a room
  socket.on('joinRoom', (roomName) => {
    console.log(`User joined room: ${roomName}`);
    socket.join(roomName);
  });

  // Handle drawing events from the clients
  socket.on('drawing', (data) => {
    // Broadcast drawing data to all clients in the same room
    socket.to(data.roomName).emit('drawing', data);
  });

  socket.on("updateChat", (data) => {
    socket.broadcast.to(data.roomName).emit("updateChat", {
      roomName: data.roomName,
      chat: data.chat
    })
  })

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Run the server on port 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
