let express = require("express");
let http = require("http");
let socketIo = require("socket.io");

let app = express();
app.use(express.static("public"));
let server = http.createServer(app);
let io = socketIo(server);

let port = 3000;
let hostname = "localhost";

io.on('connection', (socket) => {
    console.log('A user connected');
});

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});