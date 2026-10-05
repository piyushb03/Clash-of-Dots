/**
 * Clash of Dots - AI System
 * Minimax with Alpha-Beta Pruning, Move Ordering, Positional Matrix Heuristics,
 * Multi-Tier Difficulties (Recruit, Tactician, Master, Grandmaster),
 * Boss Personalities, and Real-Time Player Hint Generator.
 */

class ConnectAI {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Compute best move for the given board and player
     * @param {Array<Array<number>>} board 
     * @param {string} difficulty 'easy' | 'normal' | 'hard' | 'expert'
     * @param {number} aiPlayer 2 (default)
     * @param {string} bossType null | 'ignis' | 'cryo' | 'omni'
     */
    findBestMove(board, difficulty = 'normal', aiPlayer = 2, bossType = null) {
        const rows = board.length;
        const cols = board[0].length;
        const humanPlayer = aiPlayer === 1 ? 2 : 1;
        const availableMoves = this.getAvailableMoves(board, cols);

        if (availableMoves.length === 0) return null;
        if (availableMoves.length === 1) return availableMoves[0];

        // Immediate win check for AI
        for (let col of availableMoves) {
            const row = this.getOpenRow(board, col, rows);
            if (row !== null) {
                board[row][col] = aiPlayer;
                const isWin = this.checkWin(board, aiPlayer, rows, cols);
                board[row][col] = 0;
                if (isWin) return col;
            }
        }

        // Immediate block check (prevent human win next turn)
        for (let col of availableMoves) {
            const row = this.getOpenRow(board, col, rows);
            if (row !== null) {
                board[row][col] = humanPlayer;
                const isWin = this.checkWin(board, humanPlayer, rows, cols);
                board[row][col] = 0;
                if (isWin) return col;
            }
        }

        // Difficulty Tuning
        if (difficulty === 'easy') {
            // 35% chance to make random valid move
            if (Math.random() < 0.35) {
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
            return this.searchBestMove(board, 2, aiPlayer, humanPlayer, rows, cols);
        }

        if (difficulty === 'normal') {
            return this.searchBestMove(board, 3, aiPlayer, humanPlayer, rows, cols);
        }

        if (difficulty === 'hard') {
            return this.searchBestMove(board, 4, aiPlayer, humanPlayer, rows, cols);
        }

        // Expert / Grandmaster / Bosses
        const depth = (cols >= 8) ? 4 : 5;
        return this.searchBestMove(board, depth, aiPlayer, humanPlayer, rows, cols);
    }

    /**
     * Alpha-Beta Search with move ordering (center columns first)
     */
    searchBestMove(board, depth, aiPlayer, humanPlayer, rows, cols) {
        let bestScore = -Infinity;
        let bestMove = -1;
        const availableMoves = this.orderMoves(this.getAvailableMoves(board, cols), cols);

        for (let col of availableMoves) {
            const row = this.getOpenRow(board, col, rows);
            if (row !== null) {
                board[row][col] = aiPlayer;
                const score = this.minimax(board, depth - 1, -Infinity, Infinity, false, aiPlayer, humanPlayer, rows, cols);
                board[row][col] = 0;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = col;
                }
            }
        }

        return bestMove !== -1 ? bestMove : availableMoves[0];
    }

    minimax(board, depth, alpha, beta, isMaximizing, aiPlayer, humanPlayer, rows, cols) {
        if (this.checkWin(board, aiPlayer, rows, cols)) return 10000 + depth;
        if (this.checkWin(board, humanPlayer, rows, cols)) return -10000 - depth;

        const availableMoves = this.orderMoves(this.getAvailableMoves(board, cols), cols);
        if (depth === 0 || availableMoves.length === 0) {
            return this.evaluateBoard(board, aiPlayer, humanPlayer, rows, cols);
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let col of availableMoves) {
                const row = this.getOpenRow(board, col, rows);
                if (row !== null) {
                    board[row][col] = aiPlayer;
                    const evaluation = this.minimax(board, depth - 1, alpha, beta, false, aiPlayer, humanPlayer, rows, cols);
                    board[row][col] = 0;

                    maxEval = Math.max(maxEval, evaluation);
                    alpha = Math.max(alpha, evaluation);
                    if (beta <= alpha) break; // Beta cutoff
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let col of availableMoves) {
                const row = this.getOpenRow(board, col, rows);
                if (row !== null) {
                    board[row][col] = humanPlayer;
                    const evaluation = this.minimax(board, depth - 1, alpha, beta, true, aiPlayer, humanPlayer, rows, cols);
                    board[row][col] = 0;

                    minEval = Math.min(minEval, evaluation);
                    beta = Math.min(beta, evaluation);
                    if (beta <= alpha) break; // Alpha cutoff
                }
            }
            return minEval;
        }
    }

    /**
     * Strategic Heuristic Board Evaluation
     */
    evaluateBoard(board, aiPlayer, humanPlayer, rows, cols) {
        let score = 0;
        const centerCol = Math.floor(cols / 2);

        // Center column control bonus
        for (let r = 0; r < rows; r++) {
            if (board[r][centerCol] === aiPlayer) score += 6;
            else if (board[r][centerCol] === humanPlayer) score -= 6;

            if (cols % 2 === 0 && centerCol - 1 >= 0) {
                if (board[r][centerCol - 1] === aiPlayer) score += 4;
                else if (board[r][centerCol - 1] === humanPlayer) score -= 4;
            }
        }

        // Line evaluator
        const evaluateLine = (line) => {
            const aiCount = line.filter(p => p === aiPlayer).length;
            const humanCount = line.filter(p => p === humanPlayer).length;
            const emptyCount = line.filter(p => p === 0).length;

            if (aiCount === 4) return 10000;
            if (humanCount === 4) return -10000;

            if (aiCount === 3 && emptyCount === 1) return 120;
            if (humanCount === 3 && emptyCount === 1) return -140;

            if (aiCount === 2 && emptyCount === 2) return 15;
            if (humanCount === 2 && emptyCount === 2) return -18;

            return 0;
        };

        // Horizontal windows of 4
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                score += evaluateLine([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]]);
            }
        }

        // Vertical windows of 4
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r <= rows - 4; r++) {
                score += evaluateLine([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]]);
            }
        }

        // Diagonal positive
        for (let r = 0; r <= rows - 4; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                score += evaluateLine([board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]]);
            }
        }

        // Diagonal negative
        for (let r = 3; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                score += evaluateLine([board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]]);
            }
        }

        return score;
    }

    /**
     * Move Ordering: Order moves from center outwards for optimal alpha-beta pruning speed
     */
    orderMoves(moves, cols) {
        const center = (cols - 1) / 2;
        return moves.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
    }

    getAvailableMoves(board, cols) {
        const moves = [];
        for (let c = 0; c < cols; c++) {
            if (board[0][c] === 0) moves.push(c);
        }
        return moves;
    }

    getOpenRow(board, col, rows) {
        for (let r = rows - 1; r >= 0; r--) {
            if (board[r][col] === 0) return r;
        }
        return null;
    }

    checkWin(board, player, rows, cols) {
        // Horizontal
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (board[r][c] === player &&
                    board[r][c + 1] === player &&
                    board[r][c + 2] === player &&
                    board[r][c + 3] === player) return true;
            }
        }
        // Vertical
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r <= rows - 4; r++) {
                if (board[r][c] === player &&
                    board[r + 1][c] === player &&
                    board[r + 2][c] === player &&
                    board[r + 3][c] === player) return true;
            }
        }
        // Diagonals
        for (let r = 0; r <= rows - 4; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (board[r][c] === player &&
                    board[r + 1][c + 1] === player &&
                    board[r + 2][c + 2] === player &&
                    board[r + 3][c + 3] === player) return true;
            }
        }
        for (let r = 3; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (board[r][c] === player &&
                    board[r - 1][c + 1] === player &&
                    board[r - 2][c + 2] === player &&
                    board[r - 3][c + 3] === player) return true;
            }
        }
        return false;
    }

    /**
     * Hint system for player: search best move for Player 1
     */
    getPlayerHint(board) {
        const rows = board.length;
        const cols = board[0].length;
        return this.findBestMove(board, 'expert', 1);
    }
}

window.ConnectAI = ConnectAI;
window.connectAI = new ConnectAI();
