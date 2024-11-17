let express = require("express");
let http = require("http");
let socketIo = require("socket.io");

let app = express();
app.use(express.static("public"));
let server = http.createServer(app);
let io = socketIo(server);

let port = 3000;
let hostname = "localhost";

app.use(express.static("public"));
app.use(express.json())

app.post("/game_page", (req, res) => {
    if(req.body.room !== undefined)
    {
      res.statusCode = 200
      socket.join(req.body.room);
      res.send();
    }
    else {
    res.status(400).send();
    }
});
app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});
io.on('connection', (socket) => {
    console.log('A user connected');
    function onConnection(socket) {
        socket.on('drawing', (data) => socket.broadcast.emit('drawing', data))
    }
    socket.on('joinRoom', (roomName) => {
        socket.join(roomName);
    });
    socket.on('messageToRoom', (data) => {
        const { room, message } = data;
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

