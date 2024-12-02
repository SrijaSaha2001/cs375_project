let socket = io();

let button = document.getElementById("join");

button.addEventListener("click", () => {
    let roomName = document.getElementById("roomName").value;
    console.log(roomName)
    sessionStorage.setItem('roomName', roomName)
    socket.emit('joinRoom', roomName)
    console.log("Client")
    let url = 'main_page.html?room=' + roomName
    window.open(url, '_blank').focus();
})
