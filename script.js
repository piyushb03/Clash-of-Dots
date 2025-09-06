const ROWS = 6,
    COLS = 7;
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
const mobileTotalGamesEl = document.getElementById('mobile-total-games-count');
const mobileGamesWonEl = document.getElementById('mobile-games-won-count');
const mobileGamesDrawnEl = document.getElementById('mobile-games-drawn-count');

// Audio elements
const turnSound = document.getElementById('turn-sound');
const winningSound = document.getElementById('winning-sound');
const losingSound = document.getElementById('losing-sound');
const drawSound = document.getElementById('draw-sound');
const menuToggleBtn = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');


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

    mobileTotalGamesEl.textContent = gameStats.totalGames;
    mobileGamesWonEl.textContent = gameStats.gamesWon;
    mobileGamesDrawnEl.textContent = gameStats.gamesDrawn;
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

    mobileTotalGamesEl.textContent = gameStats.totalGames;
    mobileGamesWonEl.textContent = gameStats.gamesWon;
    mobileGamesDrawnEl.textContent = gameStats.gamesDrawn;
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

renderBoard();

// New menu buttons
const aboutBtn = document.getElementById('about-btn');
const rulesBtn = document.getElementById('rules-btn');
const aboutPane = document.getElementById('about-pane');
const rulesPane = document.getElementById('rules-pane');
const aboutBackBtn = document.getElementById('about-back-btn');
const rulesBackBtn = document.getElementById('rules-back-btn');

// Fix: Reset menu state to main pane when opening/toggling
menuToggleBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('-translate-x-full');
    document.getElementById('main-menu-pane').classList.remove('hidden');
    aboutPane.classList.add('hidden');
    rulesPane.classList.add('hidden');
});

// Show About pane
aboutBtn.addEventListener('click', () => {
    document.getElementById('main-menu-pane').classList.add('hidden');
    aboutPane.classList.remove('hidden');
});

// Show Rules pane
rulesBtn.addEventListener('click', () => {
    document.getElementById('main-menu-pane').classList.add('hidden');
    rulesPane.classList.remove('hidden');
});

// Go back from About pane
aboutBackBtn.addEventListener('click', () => {
    aboutPane.classList.add('hidden');
    document.getElementById('main-menu-pane').classList.remove('hidden');
});

// Go back from Rules pane
rulesBackBtn.addEventListener('click', () => {
    rulesPane.classList.add('hidden');
    document.getElementById('main-menu-pane').classList.remove('hidden');
});

// Initial load of stats from local storage on page load
loadStats();
