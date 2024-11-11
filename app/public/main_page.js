const socket = io();

let chatBoard = document.getElementById("chatBoard");

socket.on('message', (message) => {
    let new_message = document.createElement('p');
    new_message.textContent = message;
    chatBoard.append(new_message);
}) 