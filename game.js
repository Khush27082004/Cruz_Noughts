// ===== Cruz & Noughts (Sliding-3) — Core Game Logic + Music Toggle =====

// Global state
let moves = Array(10).fill(null);
let symbol = "X";
let isGameStarted = false;
let p1Name = ""; 
let p2Name = "";
let xMoveCount = 0; 
let oMoveCount = 0;

const xQueue = [];
const oQueue = [];

let vsComputer = true;
let computerThinking = false;

const winCells = [
  [1,2,3],[4,5,6],[7,8,9],
  [1,4,7],[2,5,8],[3,6,9],
  [1,5,9],[3,5,7]
];

let el = {};
let musicStarted = false;

// ===== UI + Music Setup =====
function cacheEls(){
  el.m1 = document.getElementById('m1');
  el.m2 = document.getElementById('m2');
  el.p1 = document.getElementById('player1');
  el.p2 = document.getElementById('player2');
  el.p2label = document.getElementById('p2label');
  el.startBtn = document.getElementById('startBtn');
  el.message = document.getElementById('message');
  el.xCount = document.getElementById('xMoveCount');
  el.oCount = document.getElementById('oMoveCount');
  el.restartBtn = document.getElementById('restartBtn');
  el.newGameBtn = document.getElementById('newGameBtn');
  el.hintBtn = document.getElementById('hintBtn');
  el.musicToggle = document.getElementById('musicToggle');
  el.music = document.getElementById('bg-music');
  el.cells = {};
  for (let i=1;i<=9;i++) el.cells[i] = document.getElementById('cell'+i);
}

// Smooth volume fade
function fadeVolume(to){
  let step = (to - el.music.volume) / 15;
  let interval = setInterval(() => {
    el.music.volume += step;
    if (Math.abs(el.music.volume - to) < 0.02){
      el.music.volume = to;
      clearInterval(interval);
    }
  }, 30);
}

// Toggle Music Button
function toggleMusic(){
  if(el.music.paused){
    el.music.play();
    fadeVolume(0.55);
    el.musicToggle.textContent = "🔊";
  } else {
    fadeVolume(0);
    setTimeout(() => el.music.pause(), 400);
    el.musicToggle.textContent = "🔇";
  }
}

// Start music after first click (mobile autoplay fix)
function ensureMusicStart(){
  if(!musicStarted){
    musicStarted = true;
    el.music.volume = 0;
    el.music.play();
    fadeVolume(0.55);
    el.musicToggle.textContent = "🔇";
  }
}

// ===== Core UI =====
function setMode(comp){
  vsComputer = comp;
  el.m1.classList.toggle('active', comp);
  el.m2.classList.toggle('active', !comp);
  if (comp){
    if (!el.p2.value.trim() || el.p2.value === 'Player 2') el.p2.value = 'Computer';
    el.p2label.textContent = 'Computer (O)';
  } else {
    if (el.p2.value === 'Computer') el.p2.value = '';
    el.p2label.textContent = 'Player 2 (O)';
  }
}

function updateMoveCounts(){
  el.xCount.innerText = xMoveCount;
  el.oCount.innerText = oMoveCount;
}

function clearBoard(){
  for(let i=1;i<=9;i++){
    el.cells[i].textContent = '';
    el.cells[i].classList.remove('winner');
  }
  moves = Array(10).fill(null);
  xQueue.length = 0; 
  oQueue.length = 0;
  symbol = 'X';
  xMoveCount = 0; 
  oMoveCount = 0; 
  updateMoveCounts();
}

function gameStart(){
  if (!el.p1.value.trim()) return alert('Enter Player 1 name');
  if (!el.p2.value.trim()) return alert(vsComputer ? 'Enter Computer name' : 'Enter Player 2 name');

  ensureMusicStart();

  p1Name = el.p1.value.trim();
  p2Name = el.p2.value.trim();
  isGameStarted = true;
  el.message.innerHTML = `${p1Name} vs ${p2Name}. ${p1Name} (X) starts!`;
  el.p1.readOnly = true; 
  el.p2.readOnly = true; 
  el.startBtn.disabled = true;
}

// ===== Game Logic =====
function checkWin(s){ return winCells.some(l => l.every(i => moves[i] === s)); }

function displayWinMessage(winner){
  const winSound = document.getElementById('win-sound');
  if(winSound){ winSound.currentTime = 0; winSound.play(); }
  el.message.innerHTML = `<span class='winnerTxt'>${winner} wins! 🎉</span>`;
}

function playSoundFor(sym){
  const snd = document.getElementById(sym === 'X' ? 'sound-x' : 'sound-o');
  if(snd){ snd.currentTime = 0; snd.play(); }
}

function placeSymbol(cell, force){
  const sym = force || symbol;
  if(moves[cell] !== null) return false;

  moves[cell] = sym;
  el.cells[cell].textContent = sym;
  playSoundFor(sym);

  const q = sym === 'X' ? xQueue : oQueue;
  q.push(cell);
  if(q.length > 3){
    const remove = q.shift();
    moves[remove] = null;
    el.cells[remove].textContent = '';
  }

  if(sym === 'X') xMoveCount++; else oMoveCount++;
  updateMoveCounts();
  return true;
}
function endRoundIfWin(){
  let winnerSymbol = null;
  let winningLine = null;

  for(let line of winCells){
    const [a,b,c] = line;
    if(moves[a] && moves[a] === moves[b] && moves[a] === moves[c]){
      winnerSymbol = moves[a];
      winningLine = line;
      break;
    }
  }

  if (!winnerSymbol) return false;

  // ⭐ Highlight the winning cells
  winningLine.forEach(i => el.cells[i].classList.add("winner"));

  // Display message
  displayWinMessage(winnerSymbol === "X" ? p1Name : p2Name);
  isGameStarted = false;
  return true;
}


function switchTurn(){ symbol = (symbol === 'X') ? 'O' : 'X'; }

window.onCellClick = function(cell){
  if (!isGameStarted || computerThinking) return;
  ensureMusicStart();
  if(!placeSymbol(cell)) return;
  if(endRoundIfWin()) return;
  switchTurn();
  if(vsComputer && symbol === 'O'){
    computerThinking = true;
    setTimeout(()=>{ computerMove(); computerThinking = false; }, 350);
  }
};

// ===== Computer AI (Sliding-3 Aware) =====
function getEmptyCells(){ return [...Array(10).keys()].slice(1).filter(i => moves[i] === null); }

function wouldWinIf(sym, cell){
  const backup = moves[cell];
  const q = sym==='X'? xQueue : oQueue;
  const g = q.slice();
  moves[cell] = sym; g.push(cell);
  if(g.length > 3){ const rm = g[0]; const prev = moves[rm]; moves[rm] = null; const win = checkWin(sym); moves[rm]=prev; moves[cell]=backup; return win; }
  const win = checkWin(sym); moves[cell] = backup; return win;
}

function scoreCell(c){ return c===5?3 : [1,3,7,9].includes(c)?2 : 1; }

function bestMoveForO(){
  const e = getEmptyCells();
  for(const c of e) if(wouldWinIf('O',c)) return c;
  for(const c of e) if(wouldWinIf('X',c)) return c;
  let best=null,sc=-1;
  for(const c of e){
    let boost=0;
    for(const line of winCells){
      if(line.includes(c)){
        const m=line.map(i=>moves[i]);
        if(m.includes('X')===false) boost+=m.filter(v=>v==='O').length+1;
      }
    }
    const total=boost*2+scoreCell(c);
    if(total>sc){ sc=total; best=c; }
  }
  return best ?? e[0];
}

function computerMove(){
  if(!isGameStarted) return;
  const c = bestMoveForO();
  if(c!=null){
    placeSymbol(c,'O');
    if(endRoundIfWin()) return;
    switchTurn();
  }
}

// ===== Hint =====
function hint(){
  if(!isGameStarted) return;
  const t=symbol, e=getEmptyCells();
  let pick=null;
  for(const c of e) if(wouldWinIf(t,c)) pick=c;
  if(!pick){ const opp=t==='X'?'O':'X'; for(const c of e) if(wouldWinIf(opp,c)) pick=c; }
  if(!pick) pick=[5,1,3,7,9,2,4,6,8].find(c => e.includes(c));
  if(pick){ el.cells[pick].classList.add('winner'); setTimeout(()=>el.cells[pick].classList.remove('winner'),600); el.message.textContent=`Suggested move: ${pick}`; }
}

// ===== Init =====
document.addEventListener('DOMContentLoaded',()=>{
  cacheEls();
  el.m1.onclick=()=>setMode(true);
  el.m2.onclick=()=>setMode(false);
  el.startBtn.onclick=gameStart;
  el.hintBtn.onclick=hint;
  el.musicToggle.onclick=toggleMusic;
  el.restartBtn.onclick=()=>{ clearBoard(); isGameStarted=true; el.message.textContent=`${p1Name} vs ${p2Name}. ${symbol} to play.`; };
  
  el.newGameBtn.onclick = () => {
  clearBoard();
  isGameStarted = false;

  // 🆕 Reset name input fields
  el.p1.value = "";
  el.p2.value = "";

  // 🆕 Reset label for Player 2 depending on mode
  el.p2label.textContent = vsComputer ? "Computer (O)" : "Player 2 (O)";

  el.p1.readOnly = false;
  el.p2.readOnly = false;
  el.startBtn.disabled = false;
  el.message.textContent = "Choose a mode, enter names, and press Start.";
};

document.getElementById("normalModeBtn").onclick = () => {
  window.location.href = "normal.html";
};

  clearBoard();
  setMode(true);
});
