/**
 * Clash of Dots - Core Game Engine
 * Connect Four logic supporting customizable grid sizes (6x6, 7x6, 8x7),
 * obstacles, gravity recalculation, special powers (bomb, laser, freeze, swap),
 * move history, win checking, and draw conditions.
 */

class GameEngine {
    constructor(rows = 6, cols = 6) {
        this.rows = rows;
        this.cols = cols;
        this.board = [];
        this.moveHistory = [];
        this.frozenColumns = { 1: [], 2: [] }; // player -> [colIdx]
        this.reset(rows, cols);
    }

    reset(rows = this.rows, cols = this.cols) {
        this.rows = rows;
        this.cols = cols;
        this.board = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
        this.moveHistory = [];
        this.frozenColumns = { 1: [], 2: [] };
    }

    setBoardFromState(boardArray) {
        this.rows = boardArray.length;
        this.cols = boardArray[0].length;
        this.board = boardArray.map(r => [...r]);
        this.moveHistory = [];
    }

    addObstacle(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.board[row][col] = -1; // -1 represents solid obstacle/rock
        }
    }

    getOpenRow(col) {
        if (col < 0 || col >= this.cols) return null;
        for (let r = this.rows - 1; r >= 0; r--) {
            if (this.board[r][col] === 0) {
                return r;
            }
        }
        return null;
    }

    getAvailableMoves() {
        const moves = [];
        for (let c = 0; c < this.cols; c++) {
            if (this.getOpenRow(c) !== null) {
                moves.push(c);
            }
        }
        return moves;
    }

    isColumnFrozen(col, player) {
        return (this.frozenColumns[player] || []).includes(col);
    }

    clearFrozenForPlayer(player) {
        this.frozenColumns[player] = [];
    }

    // Drop standard piece
    dropPiece(col, player) {
        if (this.isColumnFrozen(col, player)) {
            return { success: false, reason: 'frozen' };
        }
        const row = this.getOpenRow(col);
        if (row === null) {
            return { success: false, reason: 'full' };
        }

        this.board[row][col] = player;
        this.moveHistory.push({ type: 'drop', row, col, player });

        const winLine = this.checkWin(player);
        const isDraw = !winLine && this.checkDraw();

        return {
            success: true,
            row,
            col,
            player,
            winLine,
            isDraw
        };
    }

    // Power-up: BOMB (drills to the base, clearing 3x3 foundation & collapsing towers with gravity)
    useBomb(col, player) {
        const targetRow = this.rows - 1;
        const affectedCells = [];

        for (let r = Math.max(0, targetRow - 2); r <= targetRow; r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                if (this.board[r][c] !== -1 && this.board[r][c] !== 0) {
                    affectedCells.push({ row: r, col: c, prevVal: this.board[r][c] });
                    this.board[r][c] = 0;
                }
            }
        }

        this.applyGravity();
        this.moveHistory.push({ type: 'bomb', col, player, affectedCells });

        return {
            success: true,
            affectedCells,
            winLine: this.checkWin(player),
            isDraw: this.checkDraw()
        };
    }

    // Power-up: LASER (clears entire column from top to bottom)
    useLaser(col, player) {
        if (col < 0 || col >= this.cols) return { success: false };
        const affectedCells = [];

        for (let r = 0; r < this.rows; r++) {
            if (this.board[r][col] !== -1 && this.board[r][col] !== 0) {
                affectedCells.push({ row: r, col, prevVal: this.board[r][col] });
                this.board[r][col] = 0;
            }
        }

        this.applyGravity();
        this.moveHistory.push({ type: 'laser', col, player, affectedCells });

        return {
            success: true,
            affectedCells,
            winLine: this.checkWin(player),
            isDraw: this.checkDraw()
        };
    }

    // Power-up: FREEZE (Freezes target column for opponent next turn)
    useFreeze(col, player) {
        const targetPlayer = player === 1 ? 2 : 1;
        if (!this.frozenColumns[targetPlayer].includes(col)) {
            this.frozenColumns[targetPlayer].push(col);
        }
        return { success: true, col, targetPlayer };
    }

    // Recalculates gravity (pieces fall down if cells beneath them were cleared by Bomb or Laser)
    applyGravity() {
        for (let c = 0; c < this.cols; c++) {
            let writeRow = this.rows - 1;
            for (let r = this.rows - 1; r >= 0; r--) {
                if (this.board[r][c] === -1) {
                    writeRow = r - 1;
                } else if (this.board[r][c] !== 0) {
                    const val = this.board[r][c];
                    this.board[r][c] = 0;
                    this.board[writeRow][c] = val;
                    writeRow--;
                }
            }
        }
    }

    // Undo last move
    undoMove() {
        if (this.moveHistory.length === 0) return false;
        const lastMove = this.moveHistory.pop();
        if (lastMove.type === 'drop') {
            this.board[lastMove.row][lastMove.col] = 0;
            return true;
        }
        return false;
    }

    // Win condition checking: 4-in-a-row
    checkWin(player) {
        // Horizontal
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c <= this.cols - 4; c++) {
                if (this.board[r][c] === player &&
                    this.board[r][c + 1] === player &&
                    this.board[r][c + 2] === player &&
                    this.board[r][c + 3] === player) {
                    return [
                        [r, c], [r, c + 1], [r, c + 2], [r, c + 3]
                    ];
                }
            }
        }

        // Vertical
        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r <= this.rows - 4; r++) {
                if (this.board[r][c] === player &&
                    this.board[r + 1][c] === player &&
                    this.board[r + 2][c] === player &&
                    this.board[r + 3][c] === player) {
                    return [
                        [r, c], [r + 1, c], [r + 2, c], [r + 3, c]
                    ];
                }
            }
        }

        // Diagonal (Down-Right)
        for (let r = 0; r <= this.rows - 4; r++) {
            for (let c = 0; c <= this.cols - 4; c++) {
                if (this.board[r][c] === player &&
                    this.board[r + 1][c + 1] === player &&
                    this.board[r + 2][c + 2] === player &&
                    this.board[r + 3][c + 3] === player) {
                    return [
                        [r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]
                    ];
                }
            }
        }

        // Diagonal (Up-Right)
        for (let r = 3; r < this.rows; r++) {
            for (let c = 0; c <= this.cols - 4; c++) {
                if (this.board[r][c] === player &&
                    this.board[r - 1][c + 1] === player &&
                    this.board[r - 2][c + 2] === player &&
                    this.board[r - 3][c + 3] === player) {
                    return [
                        [r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]
                    ];
                }
            }
        }

        return null;
    }

    checkDraw() {
        for (let c = 0; c < this.cols; c++) {
            if (this.board[0][c] === 0) return false;
        }
        return true;
    }

    cloneBoard() {
        return this.board.map(row => [...row]);
    }
}

window.GameEngine = GameEngine;
