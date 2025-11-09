let moves = Array(9).fill(null);
let history = [];
let symbol = "X";
let isGameStarted = false;
let p1Name = "";
let p2Name = "";
let xMoveCount = 0;
let oMoveCount = 0;
let timer = null;
let timeLeft = 10;

// 🎵 Sound Elements
const clickSoundX = document.getElementById("sound-x");
const clickSoundO = document.getElementById("sound-o");
const winSound = document.getElementById("win-sound");

function gameStart() {
    const p1 = document.getElementById("player1");
    const p2 = document.getElementById("player2");

    if (p1.value.trim() && p2.value.trim()) {
        p1Name = p1.value;
        p2Name = p2.value;
        document.getElementById("board").style.display = "block";
        p1.readOnly = true;
        p2.readOnly = true;
        document.getElementById("startBtn").disabled = true;

        moves = Array(9).fill(null);
        symbol = "X";
        isGameStarted = true;
        xMoveCount = 0;
        oMoveCount = 0;
        updateMoveCounts();
        document.getElementById("message").innerHTML = "";
        startTimer();
    } else {
        alert("Enter players name!!");
    }
}

const winCells = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7]
];

function checkWin() {
    for (const win of winCells) {
        if (
            moves[win[0]] != null &&
            moves[win[0]] === moves[win[1]] &&
            moves[win[0]] === moves[win[2]]
        ) {
            return true;
        }
    }
    return false;
}

function reset() {
    const p1 = document.getElementById("player1");
    const p2 = document.getElementById("player2");
    p1.readOnly = false;
    p2.readOnly = false;
    document.getElementById("startBtn").disabled = false;
}

function updateMoveCounts() {
    document.getElementById("xMoveCount").innerText = xMoveCount;
    document.getElementById("oMoveCount").innerText = oMoveCount;
}

function onCellClick(cellNo) {
    if (!isGameStarted) return;

    if (moves[cellNo] == null) {
        const cell = document.getElementById("cell" + cellNo);
        moves[cellNo] = symbol;
        cell.innerHTML = symbol;

        // 🎵 Play click sound
        if (symbol === "X") {
            clickSoundX.currentTime = 0;
            clickSoundX.play();
        } else {
            clickSoundO.currentTime = 0;
            clickSoundO.play();
        }

        history.push(cellNo);
        if (history.length > 6) {
            const hCellNo = history.shift();
            const oldCell = document.getElementById("cell" + hCellNo);
            oldCell.innerHTML = "";
            moves[hCellNo] = null;
        }

        if (symbol === "X") xMoveCount++;
        else oMoveCount++;

        updateMoveCounts();

        // 🏆 Check for win before switching or restarting timer
        if (checkWin()) {
            const winner = symbol === "X" ? p1Name : p2Name;
            displayWinMessage(winner);
            stopTimer();
            isGameStarted = false;
            reset();

            // 🎵 Play win sound
            winSound.currentTime = 0;
            winSound.play();
            return;
        }

        // ⏱️ If not win, switch player and reset timer
        symbol = symbol === "X" ? "O" : "X";
        resetTimer();
    }
}

function displayWinMessage(winner) {
    document.getElementById("message").innerHTML = `<span class='winner'>${winner} Wins This Game!🎉🥳👑</span>`;
}

// 🕒 Timer Functions
function startTimer() {
    stopTimer(); // Prevent multiple timers
    document.getElementById("message").innerHTML = `Player ${symbol}'s turn. Time left: ${timeLeft} seconds`;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("message").innerHTML = `Player ${symbol}'s turn. Time left: ${timeLeft} seconds`;
        if (timeLeft <= 0) handleTimeout();
    }, 1000);
}

function resetTimer() {
    stopTimer();
    timeLeft = 10;
    startTimer();
}

function stopTimer() {
    clearInterval(timer);
}

function handleTimeout() {
    const winner = symbol === "X" ? p2Name : p1Name;
    displayWinMessage(winner);
    stopTimer();
    isGameStarted = false;
    reset();

    // 🎵 Play win sound
    winSound.currentTime = 0;
    winSound.play();
}

// 🔁 Restart Game
document.getElementById("restartBtn").addEventListener("click", restartGame);
function restartGame() {
    stopTimer();
    timeLeft = 10;
    moves = Array(9).fill(null);
    history = [];
    symbol = "X";
    isGameStarted = true;
    xMoveCount = 0;
    oMoveCount = 0;
    updateMoveCounts();

    document.querySelectorAll(".grid-item").forEach(cell => (cell.innerHTML = ""));
    document.getElementById("message").innerHTML = `Player ${symbol}'s turn. Time left: ${timeLeft} seconds`;
    resetTimer();
}

// 🆕 New Game
document.getElementById("newGameBtn").addEventListener("click", newGame);
function newGame() {
    stopTimer();
    timeLeft = 10;
    moves = Array(9).fill(null);
    history = [];
    symbol = "X";
    isGameStarted = false;
    p1Name = "";
    p2Name = "";
    xMoveCount = 0;
    oMoveCount = 0;
    updateMoveCounts();

    document.querySelectorAll(".grid-item").forEach(cell => (cell.innerHTML = ""));
    const p1 = document.getElementById("player1");
    const p2 = document.getElementById("player2");
    p1.value = "";
    p2.value = "";
    p1.readOnly = false;
    p2.readOnly = false;
    document.getElementById("startBtn").disabled = false;
    document.getElementById("message").innerHTML = "";
}
