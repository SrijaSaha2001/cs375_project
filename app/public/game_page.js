let socket = io();


let button = document.getElementById("join");

button.addEventListener("click", () => {
    let roomName = document.getElementById("roomName").value;
    console.log(roomName)
    sessionStorage.setItem('roomName', roomName)
    socket.emit('joinRoom', roomName)
    console.log("Client")
    //window.location.href="main_page.html";
    window.open("main_page.html", '_blank').focus();
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
