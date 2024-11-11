let socket = io();

let roomName = document.getElementById("roomName");
let button = document.getElementById("join");

button.addEventListener("click", () => {
    socket.emit('joinRoom', roomName)
})
