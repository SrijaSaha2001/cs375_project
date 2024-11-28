
let express = require("express");
let http = require("http");
let app = express();
app.use(express.static("public"));
let server = http.createServer(app);
let io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});
const roomSituation = {}
const sockets = io.in("jkjk").fetchSockets();

//console.log(sockets[0])
//console.log(sockets[1])


let port = 3000;
let hostname = "localhost";

app.use(express.static("public"));
//app.use(express.json())

/*app.post("/game_page", (req, res) => {
    if(req.body.room !== undefined)
    {
      res.statusCode = 200
      socket.join(req.body.room);
      res.send();
    }
    else {
    res.status(400).send();
    }
});*/
server.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});
io.on('connection', (socket) => {

    console.log('A user connected');
    /*function onConnection(socket) {
        socket.on('drawing', (data) => socket.broadcast.emit('drawing', data))
    }*/
    //console.log("Here1")
    //console.log(io.rooms)
    socket.on('joinRoom', (roomName) => {
        socket.join(roomName);
        if(!roomSituation[roomName]) {
            roomSituation[roomName] = []
        }
        roomSituation[roomName].push(socket.id)
        //console.log(`Socket ${socket.id} joined room ${roomName}`);
        io.to(roomName).emit('message', `User ${socket.id} has joined room ${roomName}`);
        //console.log("Here2")
        //console.log("Tracking: ", roomSituation)
        //console.log(roomName)
        //console.log(socket.rooms)
    });

    socket.on('drawing', (data) => {
        socket.to(data.room).emit('drawing', data);
    });

    socket.on('popupText', (roomName, text) => {
        // Emit to all clients in the room
        io.to(roomName).emit('showPopup', text);
    });

    socket.on('checkRoom', (room) => {
        const roomCount = io.sockets.adapter.rooms.get(room)?.size || 0;
        console.log(`Room ${room} has ${roomCount} sockets.`);
        socket.emit('roomCount', roomCount); // Send back the number of sockets in the room
    });


    socket.on('sendData', (roomName, data) => {
        io.to(roomName).emit('showPopUp', data);
        //console.log(`Emitting data to room ${roomName}:`, data);
      });
    
      socket.on('sendFunction', (roomName, funcName) => {
        io.to(roomName).emit('executeFunction', funcName);
        console.log(`Emitting function ${funcName} to room ${roomName}`);
      });

    socket.on('messageToRoom', (data) => {
        const { room, message } = data;
    });
    
io.to('jkjk').emit('showPopup', 'This is a popup message!');
});

