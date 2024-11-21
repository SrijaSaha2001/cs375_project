let roomCode = document.getElementById("roomcode");

// copy room code to clipboard
roomCode.addEventListener("click", function(event) {
    var copyCode = roomCode.textContent;
    navigator.clipboard.writeText(copyCode);
    console.log("Copied the text: " + copyCode);
});