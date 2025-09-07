const ROWS = 6,
    COLS = 6;
const DEPTH = 3;
let board = Array.from({
    length: ROWS
}, () => Array(COLS).fill(0));
let currentPlayer = 1;
let isAITurn = false;
let isGameOver = false;
const boardEl = document.getElementById('game-board');
const messageEl = document.getElementById('message');
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popup-message');
const popupButton = document.getElementById('popup-button');
const startButton = document.getElementById('start-button');
const confirmPopup = document.getElementById('confirm-popup');
const confirmYesBtn = document.getElementById('confirm-yes');
const confirmNoBtn = document.getElementById('confirm-no');
const turnSelectPopup = document.getElementById('turn-select-popup');
const playerStartBtn = document.getElementById('player-start-btn');
const aiStartBtn = document.getElementById('ai-start-btn');

// New close buttons for popups
const closeTurnSelectBtn = document.getElementById('close-turn-select-btn');
const closePopupBtn = document.getElementById('close-popup-btn');
const closeConfirmBtn = document.getElementById('close-confirm-btn');

// New elements for stats
const totalGamesEl = document.getElementById('total-games-count');
const gamesWonEl = document.getElementById('games-won-count');
const gamesDrawnEl = document.getElementById('games-drawn-count');

const mobileAboutBtn = document.getElementById('mobile-about-btn');
const mobileRulesBtn = document.getElementById('mobile-rules-btn');
const mobileStatsBtn = document.getElementById('mobile-stats-btn');
const mobileInfoPopup = document.getElementById('mobile-info-popup');
const mobileInfoContent = document.getElementById('mobile-info-content');
const closeMobileInfoBtn = document.getElementById('close-mobile-info-btn');


// Audio elements
const turnSound = document.getElementById('turn-sound');
const winningSound = document.getElementById('winning-sound');
const losingSound = document.getElementById('losing-sound');
const drawSound = document.getElementById('draw-sound');


// --- Local Storage Functions ---
const LOCAL_STORAGE_KEY = 'clashOfDotsStats';
let gameStats = {
    totalGames: 0,
    gamesWon: 0,
    gamesDrawn: 0
};

function loadStats() {
    const storedStats = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedStats) {
        gameStats = JSON.parse(storedStats);
    }
    updateStatsDisplay();
}

function saveStats() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameStats));
}

function updateStatsDisplay() {
    totalGamesEl.textContent = gameStats.totalGames;
    gamesWonEl.textContent = gameStats.gamesWon;
    gamesDrawnEl.textContent = gameStats.gamesDrawn;
}

function incrementGamesWon() {
    gameStats.totalGames++;
    gameStats.gamesWon++;
    saveStats();
    updateStatsDisplay();
}

function incrementGamesDrawn() {
    gameStats.totalGames++;
    gameStats.gamesDrawn++;
    saveStats();
    updateStatsDisplay();
}

function incrementGamesLost() {
    gameStats.totalGames++;
    saveStats();
    updateStatsDisplay();
}

// UNLOCK AUDIO on first user interaction
document.addEventListener("click", () => {
    [turnSound, winningSound, losingSound, drawSound].forEach(sound => {
        sound.play().catch(() => {});
        sound.pause();
        sound.currentTime = 0;
    });
}, {
    once: true
});

// Play the turn sound
function playTurnSound() {
    turnSound.currentTime = 0;
    turnSound.play();
}

// Initialize board UI
function renderBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            if (board[r][c] === 1) cell.classList.add('player-piece-1');
            if (board[r][c] === 2) cell.classList.add('player-piece-2');
            cell.addEventListener('click', () => handleMove(c));
            boardEl.appendChild(cell);
        }
    }
}

// Drop piece logic
function handleMove(col) {
    if (isAITurn || isGameOver) return;
    const row = getOpenRow(board, col);
    if (row !== null) {
        board[row][col] = currentPlayer;
        renderBoard();
        playTurnSound();
        const winLine = checkWin(board, currentPlayer);
        if (winLine) {
            highlightWinningPieces(winLine);
            showPopup(`You Won! 🎉`, 'win');
        } else if (checkDraw(board)) {
            showPopup("It's a Draw! 🤝", 'draw');
        } else {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            messageEl.textContent = currentPlayer === 1 ? "Your turn 🔵" : "AI turn 🟡";
            if (currentPlayer === 2) {
                isAITurn = true;
                setTimeout(handleAIMove, 1000);
            }
        }
    }
}

// --- Core AI Functions (Minimax with Alpha-Beta Pruning) ---
function handleAIMove() {
    let bestScore = -Infinity;
    let bestMove = -1;
    const availableMoves = getAvailableMoves(board);
    for (let move of availableMoves) {
        const newBoard = cloneBoard(board);
        const newRow = getOpenRow(newBoard, move);
        if (newRow !== null) {
            newBoard[newRow][move] = 2;
            const score = minimax(newBoard, DEPTH, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
    }
    if (bestMove !== -1) {
        const row = getOpenRow(board, bestMove);
        board[row][bestMove] = 2;
        renderBoard();
        playTurnSound();
        const winLine = checkWin(board, 2);
        if (winLine) {
            highlightWinningPieces(winLine);
            showPopup("AI Won! 🤖", 'lose');
        } else if (checkDraw(board)) {
            showPopup("It's a Draw! 🤝", 'draw');
        } else {
            currentPlayer = 1;
            isAITurn = false;
            messageEl.textContent = "Your turn 🔵";
        }
    }
}

function minimax(currentBoard, depth, alpha, beta, isMaximizingPlayer) {
    if (depth === 0 || checkWin(currentBoard, 1) || checkWin(currentBoard, 2) || checkDraw(currentBoard)) {
        return evaluateBoard(currentBoard);
    }
    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (let move of getAvailableMoves(currentBoard)) {
            const newBoard = cloneBoard(currentBoard);
            const newRow = getOpenRow(newBoard, move);
            if (newRow !== null) {
                newBoard[newRow][move] = 2;
                const evaluation = minimax(newBoard, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let move of getAvailableMoves(currentBoard)) {
            const newBoard = cloneBoard(currentBoard);
            const newRow = getOpenRow(newBoard, move);
            if (newRow !== null) {
                newBoard[newRow][move] = 1;
                const evaluation = minimax(newBoard, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
        }
        return minEval;
    }
}

function evaluateBoard(board) {
    let score = 0;
    const checkLine = (line) => {
        const aiPieces = line.filter(p => p === 2).length;
        const humanPieces = line.filter(p => p === 1).length;
        if (aiPieces === 4) return 10000;
        if (humanPieces === 4) return -10000;
        if (humanPieces === 3 && aiPieces === 0) return -50;
        if (humanPieces === 2 && aiPieces === 0) return -5;
        if (aiPieces === 3 && humanPieces === 0) return 75;
        if (aiPieces === 2 && humanPieces === 0) return 8;
        return 0;
    };

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (c + 3 < COLS) score += checkLine([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]]);
            if (r + 3 < ROWS) score += checkLine([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]]);
            if (r + 3 < ROWS && c + 3 < COLS) score += checkLine([board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]]);
            if (r - 3 >= 0 && c + 3 < COLS) score += checkLine([board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]]);
        }
    }
    return score;
}

function cloneBoard(board) {
    return board.map(row => [...row]);
}

function checkWin(board, player) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            if (board[r][c] === player && board[r][c + 1] === player && board[r][c + 2] === player && board[r][c + 3] === player) {
                return [
                    [r, c],
                    [r, c + 1],
                    [r, c + 2],
                    [r, c + 3]
                ];
            }
        }
    }
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r <= ROWS - 4; r++) {
            if (board[r][c] === player && board[r + 1][c] === player && board[r + 2][c] === player && board[r + 3][c] === player) {
                return [
                    [r, c],
                    [r + 1, c],
                    [r + 2, c],
                    [r + 3, c]
                ];
            }
        }
    }
    for (let c = 0; c <= COLS - 4; c++) {
        for (let r = 0; r <= ROWS - 4; r++) {
            if (board[r][c] === player && board[r + 1][c + 1] === player && board[r + 2][c + 2] === player && board[r + 3][c + 3] === player) {
                return [
                    [r, c],
                    [r + 1, c + 1],
                    [r + 2, c + 2],
                    [r + 3, c + 3]
                ];
            }
        }
    }
    for (let c = 3; c < COLS; c++) {
        for (let r = 0; r <= ROWS - 4; r++) {
            if (board[r][c] === player && board[r + 1][c - 1] === player && board[r + 2][c - 2] === player && board[r + 3][c - 3] === player) {
                return [
                    [r, c],
                    [r + 1, c - 1],
                    [r + 2, c - 2],
                    [r + 3, c - 3]
                ];
            }
        }
    }
    return null;
}

function highlightWinningPieces(winningLine) {
    winningLine.forEach(pos => {
        const cell = boardEl.querySelector(`[data-row="${pos[0]}"][data-col="${pos[1]}"]`);
        if (cell) cell.classList.add('winning-piece');
    });
}

function checkDraw(board) {
    return getAvailableMoves(board).length === 0;
}

function getOpenRow(board, col) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) return r;
    }
    return null;
}

function getAvailableMoves(board) {
    const moves = [];
    for (let c = 0; c < COLS; c++) {
        if (board[0][c] === 0) moves.push(c);
    }
    return moves;
}

// --- UI Functions ---
function showPopup(msg, type) {
    isAITurn = false;
    isGameOver = true;
    messageEl.textContent = msg;
    popupMessage.textContent = msg;
    popup.classList.remove('hidden');
    popup.classList.add('flex');
    if (type === 'win') {
        winningSound.currentTime = 0;
        winningSound.play();
        incrementGamesWon();
    } else if (type === 'lose') {
        losingSound.currentTime = 0;
        losingSound.play();
        incrementGamesLost();
    } else if (type === 'draw') {
        drawSound.currentTime = 0;
        drawSound.play();
        incrementGamesDrawn();
    }
}

function hideAllPopups() {
    turnSelectPopup.classList.remove('flex');
    turnSelectPopup.classList.add('hidden');
    confirmPopup.classList.remove('flex');
    confirmPopup.classList.add('hidden');
    popup.classList.remove('flex');
    popup.classList.add('hidden');
    mobileInfoPopup.classList.remove('flex');
    mobileInfoPopup.classList.add('hidden');
}

function showStartOptions() {
    if (isGameOver) {
        resetGame();
    } else {
        confirmPopup.classList.remove('hidden');
        confirmPopup.classList.add('flex');
    }
}

function showTurnSelectPopup() {
    confirmPopup.classList.remove('flex');
    confirmPopup.classList.add('hidden');
    turnSelectPopup.classList.remove('hidden');
    turnSelectPopup.classList.add('flex');
}

function handleConfirmation(confirmed) {
    confirmPopup.classList.remove('flex');
    confirmPopup.classList.add('hidden');
    if (confirmed) showTurnSelectPopup();
}

function startGame(startPlayer) {
    turnSelectPopup.classList.remove('flex');
    turnSelectPopup.classList.add('hidden');
    board = Array.from({
        length: ROWS
    }, () => Array(COLS).fill(0));
    currentPlayer = startPlayer;
    isAITurn = startPlayer === 2;
    isGameOver = false;
    messageEl.textContent = startPlayer === 1 ? "Your turn 🔵" : "AI turn 🟡";
    renderBoard();
    if (isAITurn) {
        setTimeout(handleAIMove, 1000);
    }
}

function resetGame() {
    board = Array.from({
        length: ROWS
    }, () => Array(COLS).fill(0));
    currentPlayer = 1;
    isAITurn = false;
    isGameOver = false;
    messageEl.textContent = "Your turn 🔵";
    renderBoard();
    popup.classList.add('hidden');
    showTurnSelectPopup();
}

// Event listeners
startButton.addEventListener('click', showStartOptions);
popupButton.addEventListener('click', showStartOptions);
confirmYesBtn.addEventListener('click', () => handleConfirmation(true));
confirmNoBtn.addEventListener('click', () => hideAllPopups());
playerStartBtn.addEventListener('click', () => {
    startGame(1);
});
aiStartBtn.addEventListener('click', () => {
    startGame(2);
});
closeTurnSelectBtn.addEventListener('click', hideAllPopups);
closePopupBtn.addEventListener('click', hideAllPopups);
closeConfirmBtn.addEventListener('click', hideAllPopups);

// Mobile navbar button event listeners
mobileAboutBtn.addEventListener('click', () => {
    mobileInfoContent.innerHTML = `
        <h2 class="text-xl font-semibold mb-3 text-yellow-400">About the Project</h2>
        <ul class="list-disc pl-6 space-y-2 text-gray-300 text-justify">
            <li>Classic Connect Four game reimagined with AI.</li>
            <li>AI uses <span class="text-yellow-300 font-semibold">Minimax + Alpha-Beta Pruning</span> for decision
                making.</li>
            <li>Custom <span class="text-yellow-300 font-semibold">heuristic evaluation</span> for smart strategies.
            </li>
            <li>Demonstrates advanced algorithmic design & problem-solving.</li>
        </ul>
    `;
    mobileInfoPopup.classList.remove('hidden');
    mobileInfoPopup.classList.add('flex');
});

mobileRulesBtn.addEventListener('click', () => {
    mobileInfoContent.innerHTML = `
        <h2 class="text-xl font-semibold mt-8 mb-3 text-green-400">Game Rules</h2>
        <ol class="list-decimal pl-6 space-y-2 text-gray-300 text-justify">
            <li>Players drop discs into a 6×6 grid, one turn at a time.</li>
            <li>Objective: connect <span class="font-semibold text-white">four discs</span> horizontally,
                vertically, or diagonally.</li>
            <li>Game ends with a win or if the board is completely filled (draw).</li>
        </ol>
    `;
    mobileInfoPopup.classList.remove('hidden');
    mobileInfoPopup.classList.add('flex');
});

mobileStatsBtn.addEventListener('click', () => {
    mobileInfoContent.innerHTML = `
        <h2 class="text-xl font-semibold mb-3 text-cyan-400">Your Stats</h2>
        <div class="bg-gray-800 rounded-lg p-4 shadow-lg flex justify-around text-center mb-6">
            <div>
                <p class="text-gray-400 text-sm">Games Played</p>
                <p class="text-xl font-bold text-white">${gameStats.totalGames}</p>
            </div>
            <div class="h-10 w-px bg-gray-600"></div>
            <div>
                <p class="text-gray-400 text-sm">Games Won</p>
                <p class="text-xl font-bold text-green-400">${gameStats.gamesWon}</p>
            </div>
            <div class="h-10 w-px bg-gray-600"></div>
            <div>
                <p class="text-gray-400 text-sm">Games Drawn</p>
                <p class="text-xl font-bold text-yellow-400">${gameStats.gamesDrawn}</p>
            </div>
        </div>
    `;
    mobileInfoPopup.classList.remove('hidden');
    mobileInfoPopup.classList.add('flex');
});

closeMobileInfoBtn.addEventListener('click', hideAllPopups);


renderBoard();
loadStats();