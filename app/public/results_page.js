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
let firstName = document.getElementById("firstPlace");
let secondName = document.getElementById("secondPlace");
let thirdName = document.getElementById("thirdPlace");
let firstPoints = document.getElementById("firstPoints");
let secondPoints = document.getElementById("secondPoints");
let thirdPoints = document.getElementById("thirdPoints");

socket.emit('joinRoom', roomCode, username);
socket.emit('results', roomCode)
socket.on("finalScore", (first, second, third)=> {
    firstName.textContent = first.name;
    firstPoints.textContent = first.score;
    secondName.textContent = second.name;
    secondPoints.textContent = second.score;
    thirdName.textContent = third.name;
    thirdPoints.textContent = third.score;
});
