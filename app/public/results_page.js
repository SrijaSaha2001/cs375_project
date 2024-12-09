const socket = io();
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let username = urlParams.get('username'); // get username from URL
let roomCode = urlParams.get('room'); // get room code from URL
let scores = {};
let max = -999;
let maxi = 0;
let winnerpt = 0;
let winnerName = "";
let points = document.getElementById("firstpt");
let name = document.getElementById("firstname");

socket.emit("finalScore", roomCode, scores);
socket.on("finalScore", (roomCode, scores)=> {
    for (let i = 0; i < scores.length; i++) {
        if (Object.values(scores[i]) > max) {
            max = Object.values(scores[i]);
            maxi = i;
        }
    }
    winnerpt = max;
    winnerName = Object.keys(scores[maxi]);
    console.log(winnerpt);
    let div = document.createElement("div");
    div.textContent = winnerpt;
    points.append(div);
});
