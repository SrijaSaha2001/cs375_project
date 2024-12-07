let socket = io();

const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

let create = document.getElementById("create"); // create new room button
let join = document.getElementById("join"); // join with code button

// create new room
create.addEventListener("click", () => {
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
    socket.emit('createRoom', roomCode);
    let url = 'http://localhost:3000/settings_page.html?room=' + roomCode;
    window.location.href = url;
})

// join with room code 
join.addEventListener("click", () => {
    let roomName = document.getElementById("roomName").value;
    console.log(roomName)
    sessionStorage.setItem('roomName', roomName)
    socket.emit('joinRoom', roomName)
    console.log("Client")
    //let url = 'main_page.html?room=' + roomName
    let url = 'http://localhost:3000/main_page.html?room=' + roomName;
    //window.open(url, '_blank').focus();
    window.location.href = url;
})
