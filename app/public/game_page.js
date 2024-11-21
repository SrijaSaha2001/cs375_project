let socket = io();

let roomName = document.getElementById("roomName");
let button = document.getElementById("join");

button.addEventListener("click", () => {
    console.log(roomName)
    socket.emit('joinRoom', roomName)
    window.location.href="main_page.html";
    /*fetch("/game_page", {
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
        window.location.href="lobby_page.html";
    }).catch(error => {
        console.log(error);
    });*/
})
