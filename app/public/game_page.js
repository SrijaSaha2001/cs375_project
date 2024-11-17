let socket = io();

let roomName = document.getElementById("roomName");
let button = document.getElementById("join");

button.addEventListener("click", () => {
    socket.emit('joinRoom', roomName)
    fetch("/game_page", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({room: roomName.value}),
    }).then(response => {
        let message = document.getElementById("message")
        if(response.status === 200) {
            message.textContent = "Success"
        }
        else {
            message.textContent = "Bad request"
        }
    }).catch(error => {
        console.log(error);
    });
})
