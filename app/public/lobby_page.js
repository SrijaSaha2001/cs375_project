const socket = io();

let roomCodeButton = document.getElementById("roomcode");

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let username = urlParams.get('username'); // get username from URL
let code = urlParams.get('room'); // get room code from URL
// console.log("Username: ", username, " - Room: ", code); // TESTING

// Updates username's associated socket id after redirection
socket.emit('redirected', code, username); 
socket.emit('joinRoom', code, username);
socket.emit('updateRoomCode', code, username);

// copy room code to clipboard
roomCodeButton.addEventListener("click", function(event) {
    var copyCode = roomCodeButton.textContent;
    navigator.clipboard.writeText(copyCode);
    console.log("Copied the text: " + copyCode);
});

//function to update the players section with current player ids in the room
function updateScoreBoard(players) {
    let playersList = document.getElementById("players")
    playersList.textContent = ""
    console.log("Players: ", players) // TESTING
    players.forEach((player) => {
        console.log(player)
        let row = document.createElement("tr")
        let column1 = document.createElement("td")
        column1.textContent = player
        row.appendChild(column1)
        playersList.append(row)
    })
}

socket.on('updatePlayers', (players) => {
    updateScoreBoard(players)
})

socket.on('updateCode', (roomCode) => { 
    roomCodeButton.textContent = roomCode;
});

socket.on('start', (roomCode) => {
    // Redirect user to Main page
    let url = 'http://localhost:3000/main_page.html?username=' + username + '&room=' + code;
    window.location.href = url;
});