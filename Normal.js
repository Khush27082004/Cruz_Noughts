let moves = Array(9).fill(null);
let history = [];
let symbol = "X";
let isGameStarted = false;
let p1Name = "";
let p2Name = "";
let xMoveCount = 0;
let oMoveCount = 0;

function gameStart() {
	var p1 = document.getElementById("player1");
	var p2 = document.getElementById("player2");
	
	if (p1.value.trim() != "" && p2.value.trim() != "") {
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
		document.getElementById("message").innerHTML = "";  // Reset message when game starts
	} else {
		alert("Enter players name!!");
	}
}

let winCells = [[1,2,3], [4,5,6], [7,8,9], [1,4,7], [2,5,8], [3,6,9], [1,5,9], [3,5,7]];

function checkWin() {
	for(let index = 0; index < winCells.length; index++) {
		let win = winCells[index];
		if (moves[win[0]] != null && moves[win[0]] == moves[win[1]] && 
			moves[win[0]]  == moves[win[2]] &&
			moves[win[1]]  == moves[win[2]]) {
			return true;
		}
	}
	
	return false;
}

function reset() {
	var p1 = document.getElementById("player1");
	var p2 = document.getElementById("player2");
	
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

        // 🔊 Play sound based on current symbol
        const soundX = document.getElementById('sound-x');
        const soundO = document.getElementById('sound-o');

        if (symbol === "X") {
            soundX.currentTime = 0;
            soundX.play();
        } else {
            soundO.currentTime = 0;
            soundO.play();
        }

        // 🔁 Manage move history
        history.push(cellNo);
        if (history.length > 6) {
            const hCellNo = history.shift();
            const oldCell = document.getElementById("cell" + hCellNo);
            oldCell.innerHTML = "";
            moves[hCellNo] = null;
        }

        // 🧮 Move counter update
        if (symbol === "X") {
            xMoveCount++;
        } else {
            oMoveCount++;
        }
        updateMoveCounts();

        // 🏆 Win check
        if (checkWin()) {
    // 🔊 Play win sound
    const winSound = document.getElementById('win-sound');
    winSound.currentTime = 0;
    winSound.play();

    // 🏆 Display winner message
    displayWinMessage(symbol === "X" ? p1Name : p2Name);

    // 🔁 Reset after win
    reset();
    isGameStarted = false;
    return;
}


        function displayWinMessage(winner) {
            document.getElementById("message").innerHTML = `<span class='winner'>${winner} Wins This Game!🎉🥳👑</span>`;
        }

        // 🔄 Switch player
        symbol = (symbol === "X") ? "O" : "X";
		
	}

}
// Get the restart and new game button elements
let restartBtn = document.getElementById("restartBtn");
let newGameBtn = document.getElementById("newGameBtn");

// Add event listeners to the buttons
restartBtn.addEventListener("click", restartGame);
newGameBtn.addEventListener("click", newGame);

// Define the restartGame function
function restartGame() {
  // Reset the game state
  moves = Array(9).fill(null);
  history = [];
  symbol = "X";
  isGameStarted = false;

  // Reset the game board
  let cells = document.querySelectorAll(".grid-item");
  cells.forEach((cell) => {
    cell.innerHTML = "";
  });

  // Clear the winning message
  document.getElementById("message").innerHTML = "";
}

// Define the newGame function
function newGame() {
  // Reset the game state
  moves = Array(9).fill(null);
  history = [];
  symbol = "X";
  isGameStarted = false;
  p1Name = "";
  p2Name = "";

  // Reset the game board
  let cells = document.querySelectorAll(".grid-item");
  cells.forEach((cell) => {
    cell.innerHTML = "";
  });

  // Reset the input fields and start button
  let p1 = document.getElementById("player1");
  let p2 = document.getElementById("player2");
  p1.value = "";
  p2.value = "";
  p1.readOnly = false;
  p2.readOnly = false;
  document.getElementById("startBtn").disabled = false;

  // Clear the winning message
  document.getElementById("message").innerHTML = "";
}