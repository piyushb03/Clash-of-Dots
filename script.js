/**
 * Clash of Dots - Main Application Entry Point
 * Orchestrates the modular engines (Audio, AI, Engine, Campaign, Challenges, State, Particles, UI),
 * handles initialization, unlocks Web Audio on first interaction, and maintains 100% backward
 * compatibility for legacy function calls and localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Clash of Dots - World-Class Edition');

    // Sync legacy audio elements with AudioEngine
    if (window.audioEngine) {
        window.audioEngine.audioElements = {
            turn: document.getElementById('turn-sound'),
            winning: document.getElementById('winning-sound'),
            losing: document.getElementById('losing-sound'),
            draw: document.getElementById('draw-sound')
        };
    }

    // Initialize State & UI
    if (window.stateManager) {
        window.stateManager.loadState();
    }

    if (window.uiManager) {
        window.uiManager.updateHeaderStats();
        window.uiManager.updateAudioIcons();
        window.uiManager.switchView('menu');
    }

    // Audio unlock listener for mobile & modern browsers
    const unlockAudio = () => {
        if (window.audioEngine) {
            window.audioEngine.initContext();
            window.audioEngine.startAmbientMusic();
        }
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
});

// --- BACKWARD COMPATIBILITY BRIDGE ---
// Preserves legacy function signatures for test suites, scripts, or direct console interactions.
window.board = Array.from({ length: 6 }, () => Array(6).fill(0));
window.ROWS = 6;
window.COLS = 6;
window.DEPTH = 3;

window.renderBoard = function() {
    if (window.uiManager) window.uiManager.renderBoard();
};

window.handleMove = function(col) {
    if (window.uiManager) window.uiManager.handleColumnClick(col);
};

window.checkWin = function(board, player) {
    if (window.connectAI) {
        return window.connectAI.checkWin(board, player, board.length, board[0].length);
    }
    return false;
};

window.checkDraw = function(board) {
    if (window.connectAI) {
        return window.connectAI.getAvailableMoves(board, board[0].length).length === 0;
    }
    return false;
};

window.getOpenRow = function(board, col) {
    if (window.connectAI) {
        return window.connectAI.getOpenRow(board, col, board.length);
    }
    return null;
};

window.getAvailableMoves = function(board) {
    if (window.connectAI) {
        return window.connectAI.getAvailableMoves(board, board[0].length);
    }
    return [];
};

window.evaluateBoard = function(board) {
    if (window.connectAI) {
        return window.connectAI.evaluateBoard(board, 2, 1, board.length, board[0].length);
    }
    return 0;
};

window.minimax = function(currentBoard, depth, alpha, beta, isMaximizingPlayer) {
    if (window.connectAI) {
        return window.connectAI.minimax(currentBoard, depth, alpha, beta, isMaximizingPlayer, 2, 1, currentBoard.length, currentBoard[0].length);
    }
    return 0;
};

window.loadStats = function() {
    if (window.stateManager) {
        window.stateManager.loadState();
        if (window.uiManager) window.uiManager.updateHeaderStats();
    }
};

window.saveStats = function() {
    if (window.stateManager) window.stateManager.saveState();
};