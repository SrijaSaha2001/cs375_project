let numPlayers = document.getElementById("players").value;
let drawTime = document.getElementById("drawtime").value;
let numRounds = document.getElementById("rounds").value;
let wordCount = document.getElementById("wordcount").value;
let numHints = document.getElementById("hints").value;
let customWords = document.getElementById("custom"); 
let startButton = document.getElementById("start");
let roomCode = document.getElementById("roomcode");

startButton.addEventListener("click", function(event) {
    // go to main game page
});

// copy room code to clipboard
roomCode.addEventListener("click", function(event) {
    var copyCode = roomCode.textContent;
    navigator.clipboard.writeText(copyCode);
    console.log("Copied the text: " + copyCode);
});