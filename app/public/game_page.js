let socket = io();

// Used to generate random room codes
const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

let create = document.getElementById("create"); // create new room button
let join = document.getElementById("join"); // join with code button

function validateUsername(name) {
    if(name.length < 1 || name === "" || name === " ") {
        return false;
    }
    else {
        return true;
    }
}

// Create new room
create.addEventListener("click", () => {
    let username = document.getElementById("username").value;
    if(validateUsername(username)) {
        // Generate random room code
        let roomCode = "";
        for(let i = 0; i < 6; i++) {
            if(i % 2 == 0) {
                let x = Math.floor(Math.random() * 26); // get random index for letters
                roomCode = roomCode.concat(letters[x]);
            }
            else {
                let y = Math.floor(Math.random() * 9); // get random index for numbers
                roomCode = roomCode.concat(numbers[y]); 
            }
        }
        sessionStorage.setItem('roomCode', roomCode);
        socket.emit('createRoom', roomCode, username);

        // Redirect room creator to the Settings page
        let url = 'http://localhost:3000/settings_page.html?username=' + username + '&room=' + roomCode;
        window.location.href = url;
    }
    else {
        console.log("INVALID USERNAME");
        // add pop up 
    }
})

// Join with room code 
join.addEventListener("click", () => {
    let username = document.getElementById("username").value; 
    if(validateUsername(username)) {
        let roomName = document.getElementById("roomName").value;
        //console.log(roomName) // TESTING
        socket.emit("roomExists", roomName, username); // check if room exists
    }
    else {
        console.log("INVALID USERNAME");
    }
})

// Response from room code validation
socket.on('roomExists', (roomName, username) => {
    console.log("Room [", roomName, "] exists!"); // TESTING
    sessionStorage.setItem('roomName', roomName)

    // Redirect user to Lobby page
    let url = 'http://localhost:3000/lobby_page.html?username=' + username + '&room=' + roomName;
    window.location.href = url;
});

// Response from room code validation
socket.on('roomInvalid', (roomName) => {
    // add pop up saying the room doesn't exist

    // TESTING
    console.log("Room [", roomName, "] doesn't exist!");
});