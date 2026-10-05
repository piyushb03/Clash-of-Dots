/**
 * Clash of Dots - User Interface & Screen Flow Controller
 * Manages views (Menu, Game HUD, Campaign, Puzzles, Shop, Achievements, Stats),
 * Modals (Settings, Pause, Victory, Defeat, Briefing, Rules),
 * Live Board Rendering, Drop animations, Timers, and Toast notifications.
 */

class UIManager {
    constructor() {
        this.currentView = 'menu';
        this.gameMode = 'classic'; // 'classic' | 'campaign' | 'puzzle' | 'pvp' | 'daily'
        this.currentLevel = null;
        this.currentPuzzle = null;
        this.currentTurn = 1; // 1 or 2
        this.isAiThinking = false;
        this.isGameOver = false;
        this.turnTimer = null;
        this.timeLeft = 15;
        this.selectedPowerup = null;

        this.initDOM();
        this.bindEvents();
    }

    initDOM() {
        // Views
        this.views = {
            menu: document.getElementById('view-menu'),
            game: document.getElementById('view-game'),
            campaign: document.getElementById('view-campaign'),
            puzzles: document.getElementById('view-puzzles'),
            shop: document.getElementById('view-shop'),
            achievements: document.getElementById('view-achievements'),
            stats: document.getElementById('view-stats')
        };

        // Modals
        this.modals = {
            settings: document.getElementById('modal-settings'),
            pause: document.getElementById('modal-pause'),
            gameover: document.getElementById('modal-gameover'),
            briefing: document.getElementById('modal-briefing'),
            rules: document.getElementById('modal-rules')
        };

        // Game HUD Elements
        this.boardContainer = document.getElementById('game-board-container');
        this.gameBoardEl = document.getElementById('game-board');
        this.p1Badge = document.getElementById('hud-p1-badge');
        this.p2Badge = document.getElementById('hud-p2-badge');
        this.statusMsgEl = document.getElementById('hud-status-msg');
        this.timerEl = document.getElementById('hud-timer-val');
        this.moveCountEl = document.getElementById('hud-moves-val');
        this.powerupBar = document.getElementById('hud-powerups-bar');

        // Currency Counters
        this.coinsDisplays = document.querySelectorAll('.currency-coins-val');
        this.gemsDisplays = document.querySelectorAll('.currency-gems-val');
        this.levelDisplays = document.querySelectorAll('.profile-level-val');

        // Toast Container
        this.toastContainer = document.getElementById('toast-container');
    }

    bindEvents() {
        // Navigation Buttons
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = btn.dataset.nav;
                window.audioEngine.playClick();
                this.switchView(target);
            });
            btn.addEventListener('mouseenter', () => window.audioEngine.playHover());
        });

        // Mode Select Cards
        document.getElementById('card-mode-campaign')?.addEventListener('click', () => {
            window.audioEngine.playClick();
            this.switchView('campaign');
        });
        document.getElementById('card-mode-classic')?.addEventListener('click', () => {
            window.audioEngine.playClick();
            this.startClassicGame();
        });
        document.getElementById('card-mode-puzzles')?.addEventListener('click', () => {
            window.audioEngine.playClick();
            this.switchView('puzzles');
        });
        document.getElementById('card-mode-pvp')?.addEventListener('click', () => {
            window.audioEngine.playClick();
            this.startPvpGame();
        });
        document.getElementById('card-mode-daily')?.addEventListener('click', () => {
            window.audioEngine.playClick();
            this.startDailyChallenge();
        });
        document.getElementById('btn-banner-daily')?.addEventListener('click', () => {
            window.audioEngine.playClick();
            this.startDailyChallenge();
        });

        // HUD Controls
        document.getElementById('btn-hud-pause')?.addEventListener('click', () => {
            window.audioEngine.playClick();
            this.openModal('pause');
        });
        document.getElementById('btn-hud-hint')?.addEventListener('click', () => {
            this.provideHint();
        });
        document.getElementById('btn-hud-undo')?.addEventListener('click', () => {
            this.handleUndo();
        });

        // Power-Up buttons
        document.querySelectorAll('.btn-powerup').forEach(btn => {
            btn.addEventListener('click', () => {
                const pwr = btn.dataset.powerup;
                this.selectPowerup(pwr, btn);
            });
        });

        // Settings Buttons & Sliders
        document.getElementById('btn-settings-open')?.addEventListener('click', () => {
            window.audioEngine.playClick();
            this.openSettingsModal();
        });
        document.getElementById('btn-rules-open')?.addEventListener('click', () => {
            window.audioEngine.playClick();
            this.openModal('rules');
        });
        document.getElementById('btn-music-toggle')?.addEventListener('click', () => {
            const muted = window.audioEngine.toggleMute();
            window.stateManager.settings.isMuted = muted;
            window.stateManager.saveState();
            this.updateAudioIcons();
        });

        // Settings Form controls
        const sfxSlider = document.getElementById('setting-sfx-volume');
        if (sfxSlider) {
            sfxSlider.addEventListener('input', (e) => {
                window.audioEngine.setSFXVolume(parseFloat(e.target.value));
                window.stateManager.settings.sfxVolume = parseFloat(e.target.value);
                window.stateManager.saveState();
            });
        }
        const musicSlider = document.getElementById('setting-music-volume');
        if (musicSlider) {
            musicSlider.addEventListener('input', (e) => {
                window.audioEngine.setMusicVolume(parseFloat(e.target.value));
                window.stateManager.settings.musicVolume = parseFloat(e.target.value);
                window.stateManager.saveState();
            });
        }
        const shakeToggle = document.getElementById('setting-screenshake');
        if (shakeToggle) {
            shakeToggle.addEventListener('change', (e) => {
                window.stateManager.settings.screenShake = e.target.checked;
                window.stateManager.saveState();
            });
        }
        const colorblindToggle = document.getElementById('setting-colorblind');
        if (colorblindToggle) {
            colorblindToggle.addEventListener('change', (e) => {
                window.stateManager.settings.colorblindMode = e.target.checked;
                document.body.classList.toggle('colorblind-mode', e.target.checked);
                window.stateManager.saveState();
            });
        }
        const boardSizeSelect = document.getElementById('setting-boardsize');
        if (boardSizeSelect) {
            boardSizeSelect.addEventListener('change', (e) => {
                window.stateManager.settings.boardSize = e.target.value;
                window.stateManager.saveState();
            });
        }
        const resetBtn = document.getElementById('btn-reset-data');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all progress, coins, and unlocks? This cannot be undone.')) {
                    window.stateManager.resetAllData();
                }
            });
        }

        // Close Modal buttons
        document.querySelectorAll('.btn-close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                window.audioEngine.playClick();
                this.closeAllModals();
            });
        });

        // Game Over Buttons
        document.getElementById('btn-gameover-rematch')?.addEventListener('click', () => {
            this.closeAllModals();
            this.restartCurrentGame();
        });
        document.getElementById('btn-gameover-menu')?.addEventListener('click', () => {
            this.closeAllModals();
            this.switchView('menu');
        });
        document.getElementById('btn-gameover-next')?.addEventListener('click', () => {
            this.closeAllModals();
            this.advanceNextCampaignLevel();
        });

        // Pause Menu Buttons
        document.getElementById('btn-pause-resume')?.addEventListener('click', () => {
            this.closeAllModals();
        });
        document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
            this.closeAllModals();
            this.restartCurrentGame();
        });
        document.getElementById('btn-pause-menu')?.addEventListener('click', () => {
            this.closeAllModals();
            this.switchView('menu');
        });

        // Shop Tabs
        document.querySelectorAll('.shop-tab-btn').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.shop-tab-btn').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderShop(tab.dataset.tab);
            });
        });

        // Start ambient BGM on first interaction
        document.addEventListener('click', () => {
            window.audioEngine.startAmbientMusic();
        }, { once: true });
    }

    switchView(viewName) {
        this.currentView = viewName;
        for (let key in this.views) {
            if (this.views[key]) {
                if (key === viewName) {
                    this.views[key].classList.remove('hidden');
                    this.views[key].classList.add('fade-in');
                } else {
                    this.views[key].classList.add('hidden');
                    this.views[key].classList.remove('fade-in');
                }
            }
        }

        // Update active class on mobile bottom navigation tabs
        document.querySelectorAll('.mobile-nav-bar .nav-item-btn').forEach(btn => {
            if (btn.dataset.nav === viewName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Pause timer if user leaves active game screen
        if (viewName !== 'game' && this.turnTimer) {
            clearInterval(this.turnTimer);
        } else if (viewName === 'game' && !this.isGameOver && !this.isAiThinking) {
            this.resetTurnTimer();
        }

        // Scroll to top on view change
        window.scrollTo({ top: 0, behavior: 'smooth' });

        this.updateHeaderStats();

        if (viewName === 'campaign') this.renderCampaignMap();
        else if (viewName === 'puzzles') this.renderPuzzlesList();
        else if (viewName === 'shop') this.renderShop('discs');
        else if (viewName === 'achievements') this.renderAchievements();
        else if (viewName === 'stats') this.renderStatsDashboard();
    }

    updateHeaderStats() {
        const profile = window.stateManager.profile;
        this.coinsDisplays.forEach(el => el.textContent = profile.coins.toLocaleString());
        this.gemsDisplays.forEach(el => el.textContent = profile.gems.toLocaleString());
        this.levelDisplays.forEach(el => el.textContent = profile.level);

        const xpPercent = Math.min(100, Math.floor((profile.xp / window.stateManager.getXPForNextLevel()) * 100));
        const xpBar = document.getElementById('header-xp-bar');
        if (xpBar) xpBar.style.width = `${xpPercent}%`;

        const avatarIcon = document.getElementById('header-avatar-icon');
        if (avatarIcon) avatarIcon.textContent = profile.avatar;
    }

    openModal(modalName) {
        if (this.modals[modalName]) {
            this.modals[modalName].classList.remove('hidden');
            this.modals[modalName].classList.add('flex');
        }
    }

    closeAllModals() {
        for (let key in this.modals) {
            if (this.modals[key]) {
                this.modals[key].classList.add('hidden');
                this.modals[key].classList.remove('flex');
            }
        }
    }

    showToast(message, icon = '✨', type = 'info') {
        if (!this.toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type} slide-up`;
        toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${message}</span>`;
        this.toastContainer.appendChild(toast);
        window.audioEngine.playCoin();

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    // --- GAME INITIALIZATION ---

    startClassicGame() {
        this.gameMode = 'classic';
        this.currentLevel = null;
        this.currentPuzzle = null;

        const sizeStr = window.stateManager.settings.boardSize || '6x6';
        let rows = 6, cols = 6;
        if (sizeStr === '7x6') { rows = 6; cols = 7; }
        else if (sizeStr === '8x7') { rows = 7; cols = 8; }

        this.initGameBoard(rows, cols);
        this.setupPlayerBadges('You', 'AI Opponent', window.stateManager.profile.avatar, '🤖');
        this.setPowerupAvailability([]);
        this.switchView('game');
        this.startMatch(1);
    }

    startPvpGame() {
        this.gameMode = 'pvp';
        this.currentLevel = null;
        this.currentPuzzle = null;
        this.initGameBoard(6, 7);
        this.setupPlayerBadges('Player 1 (Blue)', 'Player 2 (Yellow)', '🔵', '🟡');
        this.setPowerupAvailability([]);
        this.switchView('game');
        this.startMatch(1);
    }

    startDailyChallenge() {
        const daily = window.challengeEngine.getDailyChallenge();
        this.gameMode = 'daily';
        this.currentPuzzle = daily.puzzle;
        this.currentLevel = null;

        this.initGameBoard(daily.puzzle.rows, daily.puzzle.cols);
        this.engine.setBoardFromState(daily.puzzle.board);
        this.setupPlayerBadges('Operative', 'Daily Protocol', window.stateManager.profile.avatar, '📅');
        this.setPowerupAvailability(daily.puzzle.hasBomb ? ['bomb'] : daily.puzzle.hasLaser ? ['laser'] : []);

        this.currentTurn = 1;
        this.movesCount = 0;
        this.isGameOver = false;
        this.isAiThinking = false;
        this.updateHUD();
        this.resetTurnTimer();

        this.switchView('game');
        this.renderBoard();
        this.statusMsgEl.textContent = daily.description;
        this.showToast(`Daily Protocol: Solve in ${daily.puzzle.targetMoves} move(s)!`, '📅');
    }

    startCampaignLevel(level) {
        this.gameMode = 'campaign';
        this.currentLevel = level;
        this.currentPuzzle = null;

        this.initGameBoard(level.rows, level.cols);
        if (level.obstacles) {
            level.obstacles.forEach(obs => this.engine.addObstacle(obs.row, obs.col));
        }

        const oppName = level.isBoss ? level.bossName : 'AI Unit';
        const oppAvatar = level.isBoss ? level.bossAvatar : '🤖';
        this.setupPlayerBadges('Operative', oppName, window.stateManager.profile.avatar, oppAvatar);
        this.setPowerupAvailability(level.playerPowerups || []);

        this.switchView('game');
        this.startMatch(1);
        this.showToast(level.title, level.isBoss ? '⚠️' : '🚀');
    }

    startPuzzleGame(puzzle) {
        this.gameMode = 'puzzle';
        this.currentPuzzle = puzzle;
        this.currentLevel = null;

        this.initGameBoard(puzzle.rows, puzzle.cols);
        this.engine.setBoardFromState(puzzle.board);

        this.setupPlayerBadges('Operative', 'Tactical Board', window.stateManager.profile.avatar, '🧩');
        this.setPowerupAvailability(puzzle.hasBomb ? ['bomb'] : puzzle.hasLaser ? ['laser'] : []);

        this.currentTurn = 1;
        this.movesCount = 0;
        this.isGameOver = false;
        this.isAiThinking = false;
        this.updateHUD();
        this.resetTurnTimer();

        this.switchView('game');
        this.renderBoard();
        this.statusMsgEl.textContent = `${puzzle.title}: ${puzzle.description}`;
        this.showToast(`${puzzle.title}: ${puzzle.difficulty}`, '🧠');
    }

    initGameBoard(rows, cols) {
        this.engine = new window.GameEngine(rows, cols);

        // Set dynamic responsive grid properties
        this.boardContainer.style.setProperty('--board-cols', cols);
        this.boardContainer.style.setProperty('--board-rows', rows);
        this.boardContainer.style.setProperty('--board-aspect', `${cols} / ${rows}`);

        this.gameBoardEl.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size, 48px))`;
        this.gameBoardEl.style.gridTemplateRows = `repeat(${rows}, var(--cell-size, 48px))`;

        // Apply equipped board theme
        const equippedBoard = window.stateManager.equipped.board || 'board-carbon';
        this.boardContainer.className = `game-board-wrapper ${equippedBoard}`;
    }

    setupPlayerBadges(p1Name, p2Name, p1Icon, p2Icon) {
        const p1Title = document.getElementById('hud-p1-name');
        const p2Title = document.getElementById('hud-p2-name');
        const p1Avatar = document.getElementById('hud-p1-avatar');
        const p2Avatar = document.getElementById('hud-p2-avatar');

        if (p1Title) p1Title.textContent = p1Name;
        if (p2Title) p2Title.textContent = p2Name;
        if (p1Avatar) p1Avatar.textContent = p1Icon;
        if (p2Avatar) p2Avatar.textContent = p2Icon;
    }

    setPowerupAvailability(powerups) {
        this.selectedPowerup = null;
        document.querySelectorAll('.btn-powerup').forEach(btn => {
            const pwr = btn.dataset.powerup;
            if (powerups.includes(pwr)) {
                btn.classList.remove('hidden', 'active');
                btn.removeAttribute('disabled');
            } else {
                btn.classList.add('hidden');
                btn.setAttribute('disabled', 'true');
            }
        });
    }

    selectPowerup(pwr, btnElement) {
        if (this.selectedPowerup === pwr) {
            this.selectedPowerup = null;
            btnElement.classList.remove('active');
            this.statusMsgEl.textContent = 'Power-up deselected. Click a column to drop disc.';
        } else {
            this.selectedPowerup = pwr;
            document.querySelectorAll('.btn-powerup').forEach(b => b.classList.remove('active'));
            btnElement.classList.add('active');
            window.audioEngine.playHover();
            this.statusMsgEl.textContent = `[${pwr.toUpperCase()} READY] Click target column to activate!`;
        }
    }

    startMatch(startingPlayer = 1) {
        this.currentTurn = startingPlayer;
        this.isGameOver = false;
        this.isAiThinking = false;
        this.movesCount = 0;
        this.updateHUD();
        this.renderBoard();
        this.resetTurnTimer();

        if (this.currentTurn === 2 && this.gameMode !== 'pvp') {
            this.triggerAiTurn();
        }
    }

    resetTurnTimer() {
        clearInterval(this.turnTimer);
        this.timeLeft = 15;
        this.updateTimerDisplay();

        this.turnTimer = setInterval(() => {
            if (this.isGameOver || this.isAiThinking) return;
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                // Auto random move when time expires!
                const moves = this.engine.getAvailableMoves();
                if (moves.length > 0) {
                    const randomMove = moves[Math.floor(Math.random() * moves.length)];
                    this.handleColumnClick(randomMove);
                }
            }
        }, 1000);
    }

    updateTimerDisplay() {
        if (this.timerEl) {
            this.timerEl.textContent = `${this.timeLeft}s`;
            if (this.timeLeft <= 5) {
                this.timerEl.classList.add('text-red-400', 'pulse-fast');
            } else {
                this.timerEl.classList.remove('text-red-400', 'pulse-fast');
            }
        }
    }

    updateHUD() {
        if (this.moveCountEl) {
            this.moveCountEl.textContent = this.movesCount;
        }

        if (this.currentTurn === 1) {
            this.p1Badge?.classList.add('active-player-glow');
            this.p2Badge?.classList.remove('active-player-glow');
            if (this.statusMsgEl) this.statusMsgEl.textContent = 'Your Turn — Click a column to drop 🔵';
        } else {
            this.p2Badge?.classList.add('active-player-glow');
            this.p1Badge?.classList.remove('active-player-glow');
            if (this.statusMsgEl) {
                this.statusMsgEl.textContent = this.gameMode === 'pvp' ? 'Player 2 Turn 🟡' : 'AI Computing... 🤖';
            }
        }
    }

    renderBoard() {
        this.gameBoardEl.innerHTML = '';
        const equippedSkin = window.stateManager.equipped.disc || 'disc-classic';

        for (let r = 0; r < this.engine.rows; r++) {
            for (let c = 0; c < this.engine.cols; c++) {
                const cell = document.createElement('div');
                cell.className = `cell ${equippedSkin}`;
                cell.dataset.row = r;
                cell.dataset.col = c;

                const val = this.engine.board[r][c];
                if (val === 1) cell.classList.add('player-piece-1');
                else if (val === 2) cell.classList.add('player-piece-2');
                else if (val === -1) cell.classList.add('obstacle-piece');
                else cell.classList.add('empty');

                if (this.engine.isColumnFrozen(c, this.currentTurn)) {
                    cell.classList.add('frozen-column-cell');
                }

                cell.addEventListener('click', () => this.handleColumnClick(c));
                cell.addEventListener('mouseenter', () => this.highlightHoverColumn(c, true));
                cell.addEventListener('mouseleave', () => this.highlightHoverColumn(c, false));

                this.gameBoardEl.appendChild(cell);
            }
        }
    }

    highlightHoverColumn(col, isHover) {
        if (this.isGameOver || this.isAiThinking) return;
        const cells = this.gameBoardEl.querySelectorAll(`[data-col="${col}"]`);
        cells.forEach(c => {
            if (isHover) c.classList.add('col-hover');
            else c.classList.remove('col-hover');
        });
    }

    handleColumnClick(col) {
        if (this.isGameOver || this.isAiThinking) return;

        // Check if power-up is selected
        if (this.selectedPowerup) {
            this.executePowerup(col, this.selectedPowerup);
            return;
        }

        // Standard disc drop
        const result = this.engine.dropPiece(col, this.currentTurn);
        if (!result.success) {
            window.audioEngine.playError();
            if (result.reason === 'frozen') {
                this.showToast('This column is frozen! Choose another.', '❄️', 'warning');
            }
            return;
        }

        this.movesCount++;
        window.audioEngine.playDrop(this.currentTurn);

        // Visual drop animation & particle impact
        this.renderBoard();
        const droppedCell = this.gameBoardEl.querySelector(`[data-row="${result.row}"][data-col="${result.col}"]`);
        if (droppedCell) {
            droppedCell.classList.add('new-piece');
            const color = this.currentTurn === 1 ? '#3b82f6' : '#facc15';
            window.particleEngine.triggerDropImpact(droppedCell, color);
        }

        if (result.winLine) {
            this.handleGameWin(result.winLine, this.currentTurn);
        } else if (result.isDraw) {
            this.handleGameDraw();
        } else if (this.gameMode === 'puzzle' || this.gameMode === 'daily') {
            this.checkPuzzleProgress(col, result);
            return;
        } else {
            // Switch Turn
            this.currentTurn = this.currentTurn === 1 ? 2 : 1;
            this.updateHUD();
            this.resetTurnTimer();

            if (this.currentTurn === 2 && this.gameMode !== 'pvp') {
                this.triggerAiTurn();
            }
        }
    }

    executePowerup(col, pwr) {
        let result;
        if (pwr === 'bomb') {
            result = this.engine.useBomb(col, this.currentTurn);
            window.audioEngine.playExplosion();
            window.particleEngine.shakeScreen();
            const cell = this.gameBoardEl.querySelector(`[data-col="${col}"]`);
            window.particleEngine.triggerBombExplosion(cell);
            this.showToast('BOMB DETONATED! Debris cleared!', '💣');
        } else if (pwr === 'laser') {
            result = this.engine.useLaser(col, this.currentTurn);
            window.audioEngine.playLaser();
            window.particleEngine.shakeScreen();
            this.showToast('LASER BEAM FIRED! Column vaporized!', '⚡');
        } else if (pwr === 'freeze') {
            result = this.engine.useFreeze(col, this.currentTurn);
            window.audioEngine.playFreeze();
            this.showToast(`Column ${col + 1} Frozen for next turn!`, '❄️');
        }

        this.movesCount++;
        this.updateHUD();
        window.stateManager.stats.powerupsUsed = (window.stateManager.stats.powerupsUsed || 0) + 1;
        this.selectedPowerup = null;
        document.querySelectorAll('.btn-powerup').forEach(b => {
            if (b.dataset.powerup === pwr) b.setAttribute('disabled', 'true');
            b.classList.remove('active');
        });

        this.renderBoard();
        if (this.gameMode === 'puzzle' || this.gameMode === 'daily') {
            const puzzle = this.currentPuzzle;
            const winLine = (result && result.winLine) || this.engine.checkWin(1);
            const isSolution = (puzzle && puzzle.solutionMoves) ? puzzle.solutionMoves.includes(col) : false;
            if (winLine || isSolution) {
                this.handleGameWin(winLine || [[this.engine.rows - 1, col]], 1);
                return;
            } else {
                window.audioEngine.playError();
                this.showToast('Tactical objective missed! Try again.', '⚠️', 'warning');
                setTimeout(() => this.restartCurrentGame(), 1200);
                return;
            }
        }

        if (result && result.winLine) {
            this.handleGameWin(result.winLine, this.currentTurn);
        } else if (result && result.isDraw) {
            this.handleGameDraw();
        } else {
            this.currentTurn = this.currentTurn === 1 ? 2 : 1;
            this.updateHUD();
            this.resetTurnTimer();
            if (this.currentTurn === 2 && this.gameMode !== 'pvp') {
                this.triggerAiTurn();
            }
        }
    }

    triggerAiTurn() {
        this.isAiThinking = true;
        this.statusMsgEl.textContent = 'AI Computing Strategy... 🤖';

        const difficulty = this.currentLevel ? this.currentLevel.aiDifficulty : window.stateManager.settings.aiDifficulty;
        const bossAbility = this.currentLevel ? this.currentLevel.bossAbility : null;

        // Artificial delay for organic feel (400ms - 800ms)
        setTimeout(() => {
            if (this.isGameOver) return;
            const bestMove = window.connectAI.findBestMove(this.engine.board, difficulty, 2, bossAbility);
            this.isAiThinking = false;

            if (bestMove !== null && bestMove !== undefined) {
                const result = this.engine.dropPiece(bestMove, 2);
                if (result.success) {
                    window.audioEngine.playDrop(2);
                    this.renderBoard();
                    const droppedCell = this.gameBoardEl.querySelector(`[data-row="${result.row}"][data-col="${result.col}"]`);
                    if (droppedCell) {
                        droppedCell.classList.add('new-piece');
                        window.particleEngine.triggerDropImpact(droppedCell, '#facc15');
                    }

                    if (result.winLine) {
                        this.handleGameWin(result.winLine, 2);
                    } else if (result.isDraw) {
                        this.handleGameDraw();
                    } else {
                        this.currentTurn = 1;
                        this.updateHUD();
                        this.resetTurnTimer();
                    }
                }
            }
        }, 550);
    }

    checkPuzzleProgress(col, result) {
        const puzzle = this.currentPuzzle;
        if (!puzzle) return;

        const winLine = (result && result.winLine) || this.engine.checkWin(1);
        const isSolution = (puzzle.solutionMoves || []).includes(col);

        if (winLine || isSolution) {
            if (winLine || this.movesCount >= puzzle.targetMoves) {
                const line = winLine || [[result ? result.row : puzzle.rows - 1, col]];
                this.handleGameWin(line, 1);
                return;
            } else {
                // Multi-step puzzle: correct move 1! Counter with AI
                this.currentTurn = 2;
                this.updateHUD();
                this.isAiThinking = true;
                this.statusMsgEl.textContent = 'Correct move! AI countering... 🤖';
                setTimeout(() => {
                    if (this.isGameOver) return;
                    const aiMove = window.connectAI.findBestMove(this.engine.board, 'normal', 2);
                    this.isAiThinking = false;
                    if (aiMove !== null) {
                        const aiRes = this.engine.dropPiece(aiMove, 2);
                        window.audioEngine.playDrop(2);
                        this.renderBoard();
                        if (aiRes.winLine) {
                            this.handleGameWin(aiRes.winLine, 2);
                            return;
                        }
                    }
                    this.currentTurn = 1;
                    this.updateHUD();
                    this.statusMsgEl.textContent = 'Finish the sequence to claim victory!';
                }, 550);
                return;
            }
        } else {
            window.audioEngine.playError();
            this.statusMsgEl.textContent = 'Tactical objective missed! Resetting...';
            this.showToast('Missed tactical target! Try again or use 💡 Hint.', '⚠️', 'warning');
            setTimeout(() => {
                if (this.currentPuzzle && (this.gameMode === 'puzzle' || this.gameMode === 'daily')) {
                    this.restartCurrentGame();
                }
            }, 1200);
        }
    }

    handleGameWin(winLine, winner) {
        this.isGameOver = true;
        clearInterval(this.turnTimer);

        // Highlight winning line pieces
        winLine.forEach(([r, c]) => {
            const cell = this.gameBoardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (cell) cell.classList.add('winning-piece');
        });

        const isPlayerWin = winner === 1;
        if (isPlayerWin) {
            window.audioEngine.playWin();
            window.particleEngine.triggerVictoryConfetti();
        } else {
            window.audioEngine.playLose();
        }

        // Record Stats & Rewards
        let earnedCoins = 50;
        let earnedXP = 100;
        let earnedGems = 2;
        let stars = 0;

        if (this.gameMode === 'campaign' && this.currentLevel && isPlayerWin) {
            stars = 1;
            if (this.movesCount <= (this.currentLevel.maxMoves - 4)) stars++;
            if (this.movesCount <= (this.currentLevel.maxMoves - 8)) stars++;
            stars = Math.max(1, stars);

            earnedCoins = 80 * stars;
            earnedXP = 150 * stars;
            earnedGems = 5 * stars;
            window.stateManager.recordCampaignLevel(this.currentLevel.id, stars, this.movesCount);
        } else if (this.gameMode === 'puzzle' && this.currentPuzzle && isPlayerWin) {
            earnedCoins = this.currentPuzzle.rewardCoins;
            earnedXP = this.currentPuzzle.rewardXP;
            window.stateManager.recordPuzzleSolved(this.currentPuzzle.id, earnedCoins, earnedXP);
        } else if (this.gameMode === 'daily' && isPlayerWin) {
            const daily = window.challengeEngine.getDailyChallenge();
            earnedCoins = daily.rewardCoins;
            earnedGems = daily.rewardGems;
            earnedXP = daily.rewardXP;
            window.stateManager.recordDailyCompleted(daily.date, earnedCoins, earnedGems, earnedXP);
        } else {
            window.stateManager.recordGameResult(isPlayerWin ? 'win' : 'lose');
        }

        const leveledUp = window.stateManager.addXP(earnedXP);
        if (leveledUp) {
            setTimeout(() => {
                window.audioEngine.playLevelUp();
                this.showToast(`LEVEL UP! You reached Level ${window.stateManager.profile.level}!`, '🎖️');
            }, 800);
        }

        // Show Game Over Modal
        setTimeout(() => {
            this.showGameOverModal(isPlayerWin, earnedCoins, earnedGems, earnedXP, stars);
        }, 1100);
    }

    handleGameDraw() {
        this.isGameOver = true;
        clearInterval(this.turnTimer);
        window.audioEngine.playDraw();
        window.stateManager.recordGameResult('draw');
        this.showGameOverModal(null, 25, 0, 50, 0);
    }

    showGameOverModal(isWin, coins, gems, xp, stars) {
        const titleEl = document.getElementById('gameover-title');
        const subtitleEl = document.getElementById('gameover-subtitle');
        const coinsEl = document.getElementById('gameover-coins');
        const gemsEl = document.getElementById('gameover-gems');
        const xpEl = document.getElementById('gameover-xp');
        const starsContainer = document.getElementById('gameover-stars-container');
        const nextBtn = document.getElementById('btn-gameover-next');

        if (isWin === true) {
            titleEl.textContent = 'VICTORY!';
            titleEl.className = 'text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400';
            subtitleEl.textContent = 'Flawless calculation, Operative.';
        } else if (isWin === false) {
            titleEl.textContent = 'DEFEAT';
            titleEl.className = 'text-4xl font-extrabold text-red-500';
            subtitleEl.textContent = 'The AI adapted to your moves. Re-strategize and try again.';
        } else {
            titleEl.textContent = 'STALEMATE';
            titleEl.className = 'text-4xl font-extrabold text-yellow-400';
            subtitleEl.textContent = 'Evenly matched. Every sector defended.';
        }

        if (coinsEl) coinsEl.textContent = `+${coins}`;
        if (gemsEl) gemsEl.textContent = `+${gems}`;
        if (xpEl) xpEl.textContent = `+${xp} XP`;

        // Star rating display for Campaign
        if (starsContainer) {
            if (this.gameMode === 'campaign' && stars > 0) {
                starsContainer.classList.remove('hidden');
                starsContainer.innerHTML = [1, 2, 3].map(s => `
                    <span class="text-3xl ${s <= stars ? 'text-yellow-400 animate-bounce' : 'text-gray-600'}">★</span>
                `).join('');
            } else {
                starsContainer.classList.add('hidden');
            }
        }

        if (nextBtn) {
            if (this.gameMode === 'campaign' && isWin) nextBtn.classList.remove('hidden');
            else nextBtn.classList.add('hidden');
        }

        this.openModal('gameover');
    }

    restartCurrentGame() {
        if (this.gameMode === 'campaign' && this.currentLevel) {
            this.startCampaignLevel(this.currentLevel);
        } else if (this.gameMode === 'puzzle' && this.currentPuzzle) {
            this.startPuzzleGame(this.currentPuzzle);
        } else if (this.gameMode === 'daily') {
            this.startDailyChallenge();
        } else if (this.gameMode === 'pvp') {
            this.startPvpGame();
        } else {
            this.startClassicGame();
        }
    }

    advanceNextCampaignLevel() {
        if (!this.currentLevel) return;
        const currentId = this.currentLevel.id;
        for (let world of window.CAMPAIGN_WORLDS) {
            const idx = world.levels.findIndex(l => l.id === currentId);
            if (idx !== -1 && idx + 1 < world.levels.length) {
                this.startCampaignLevel(world.levels[idx + 1]);
                return;
            }
        }
        this.switchView('campaign');
    }

    provideHint() {
        if (this.isGameOver || this.isAiThinking) return;

        let bestCol;
        if (this.currentPuzzle && (this.gameMode === 'puzzle' || this.gameMode === 'daily')) {
            bestCol = (this.currentPuzzle.solutionMoves && this.currentPuzzle.solutionMoves.length > 0)
                ? this.currentPuzzle.solutionMoves[0]
                : null;
            if (this.currentPuzzle.hint) {
                this.showToast(this.currentPuzzle.hint, '💡', 'info');
            } else if (bestCol !== null) {
                this.showToast(`Tactical Target: Column ${bestCol + 1}!`, '💡', 'info');
            }
        } else {
            bestCol = window.connectAI.getPlayerHint(this.engine.board);
            if (bestCol !== null && bestCol !== undefined) {
                this.showToast(`Recommended Move: Column ${bestCol + 1}!`, '💡', 'info');
            }
        }

        if (bestCol !== null && bestCol !== undefined) {
            window.audioEngine.playCoin();
            const cells = this.gameBoardEl.querySelectorAll(`[data-col="${bestCol}"]`);
            cells.forEach(c => {
                c.classList.add('hint-pulse');
                setTimeout(() => c.classList.remove('hint-pulse'), 1800);
            });
        }
    }

    handleUndo() {
        if (this.isGameOver || this.isAiThinking) return;
        if (this.engine.undoMove()) {
            if (this.gameMode !== 'pvp') {
                this.engine.undoMove(); // Undo AI move as well
            }
            this.renderBoard();
            window.audioEngine.playClick();
            this.showToast('Move Undone', '↩️');
        }
    }

    // --- CAMPAIGN VIEW RENDERING ---

    renderCampaignMap() {
        const container = document.getElementById('campaign-worlds-container');
        if (!container) return;

        container.innerHTML = window.CAMPAIGN_WORLDS.map(world => {
            const levelsHtml = world.levels.map(lvl => {
                const saved = window.stateManager.completedLevels[lvl.id];
                const stars = saved ? saved.stars : 0;
                const isCompleted = stars > 0;
                const starIcons = '★'.repeat(stars) + '☆'.repeat(3 - stars);

                return `
                    <div class="campaign-node ${lvl.isBoss ? 'boss-node' : ''} ${isCompleted ? 'completed' : ''}" data-level-id="${lvl.id}">
                        <div class="node-icon">${lvl.isBoss ? (lvl.bossAvatar || '👑') : '⚔️'}</div>
                        <div class="node-title">${lvl.title}</div>
                        <div class="node-stars">${starIcons}</div>
                    </div>
                `;
            }).join('');

            return `
                <div class="campaign-world-card" style="border-top-color: ${world.color};">
                    <div class="flex justify-between items-center mb-3">
                        <div>
                            <h3 class="text-xl font-bold text-white">${world.title}</h3>
                            <p class="text-sm text-gray-400">${world.subtitle} — ${world.description}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        ${levelsHtml}
                    </div>
                </div>
            `;
        }).join('');

        // Bind click on nodes
        container.querySelectorAll('.campaign-node').forEach(node => {
            node.addEventListener('click', () => {
                const lvlId = node.dataset.levelId;
                for (let w of window.CAMPAIGN_WORLDS) {
                    const found = w.levels.find(l => l.id === lvlId);
                    if (found) {
                        window.audioEngine.playClick();
                        this.openBriefingModal(found);
                        break;
                    }
                }
            });
        });
    }

    openBriefingModal(level) {
        document.getElementById('briefing-title').textContent = level.title;
        document.getElementById('briefing-desc').textContent = level.briefing;
        document.getElementById('briefing-moves').textContent = `${level.maxMoves} Moves`;
        document.getElementById('briefing-grid').textContent = `${level.cols}x${level.rows} Grid`;

        const starsList = document.getElementById('briefing-stars-list');
        if (starsList) {
            starsList.innerHTML = Object.entries(level.starConditions).map(([starNum, cond]) => `
                <li class="flex items-center space-x-2 text-gray-300">
                    <span class="text-yellow-400 font-bold">${starNum}★</span>
                    <span>${cond}</span>
                </li>
            `).join('');
        }

        const deployBtn = document.getElementById('btn-briefing-deploy');
        if (deployBtn) {
            deployBtn.onclick = () => {
                this.closeAllModals();
                this.startCampaignLevel(level);
            };
        }

        this.openModal('briefing');
    }

    // --- PUZZLES VIEW RENDERING ---

    renderPuzzlesList() {
        const container = document.getElementById('puzzles-grid');
        if (!container) return;

        container.innerHTML = window.challengeEngine.puzzles.map(puz => {
            const isSolved = (window.stateManager.completedPuzzles || []).includes(puz.id);
            return `
                <div class="puzzle-card ${isSolved ? 'solved' : ''}" data-puzzle-id="${puz.id}">
                    <div class="flex justify-between items-start mb-2">
                        <span class="puzzle-diff diff-${puz.difficulty.toLowerCase()}">${puz.difficulty}</span>
                        ${isSolved ? '<span class="text-green-400 font-bold text-sm">✓ SOLVED</span>' : ''}
                    </div>
                    <h4 class="font-bold text-white mb-1">${puz.title}</h4>
                    <p class="text-xs text-gray-400 mb-3">${puz.description}</p>
                    <div class="flex justify-between items-center text-xs text-yellow-400 font-semibold">
                        <span>Reward: 🪙 ${puz.rewardCoins}</span>
                        <button class="btn-play-puzzle px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold">Solve</button>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.puzzle-card').forEach(card => {
            card.addEventListener('click', () => {
                const puzId = card.dataset.puzzleId;
                const puzzle = window.challengeEngine.puzzles.find(p => p.id === puzId);
                if (puzzle) {
                    window.audioEngine.playClick();
                    this.startPuzzleGame(puzzle);
                }
            });
        });
    }

    // --- SHOP VIEW RENDERING ---

    renderShop(category = 'discs') {
        const container = document.getElementById('shop-items-container');
        if (!container) return;

        const catalog = window.STORE_CATALOG[category] || [];
        const inventory = window.stateManager.inventory[category] || [];
        const equippedId = category === 'discs' ? window.stateManager.equipped.disc : category === 'boards' ? window.stateManager.equipped.board : window.stateManager.equipped.avatar;

        container.innerHTML = catalog.map(item => {
            const isOwned = inventory.includes(item.id);
            const isEquipped = equippedId === item.id;

            return `
                <div class="shop-card ${isEquipped ? 'equipped' : ''}" data-category="${category}" data-id="${item.id}">
                    <div class="shop-card-preview mb-3 flex items-center justify-center">
                        ${category === 'discs' ? `
                            <div class="w-12 h-12 rounded-full border-2 border-white shadow-lg" style="background: ${item.p1Color};"></div>
                        ` : category === 'boards' ? `
                            <div class="w-16 h-12 rounded border border-gray-600 shadow" style="background: ${item.preview};"></div>
                        ` : `
                            <span class="text-4xl">${item.icon}</span>
                        `}
                    </div>
                    <h4 class="font-bold text-white text-sm mb-1">${item.name}</h4>
                    <div class="shop-card-action mt-2">
                        ${isEquipped ? `
                            <button class="w-full py-1.5 bg-green-700 text-white text-xs font-bold rounded" disabled>EQUIPPED</button>
                        ` : isOwned ? `
                            <button class="btn-shop-equip w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded">EQUIP</button>
                        ` : `
                            <button class="btn-shop-buy w-full py-1.5 bg-yellow-500 hover:bg-yellow-400 text-gray-950 text-xs font-bold rounded">
                                🪙 ${item.priceCoins} ${item.priceGems > 0 ? `+ 💎 ${item.priceGems}` : ''}
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        // Bind Buy/Equip
        container.querySelectorAll('.btn-shop-buy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = btn.closest('.shop-card');
                const cat = card.dataset.category;
                const id = card.dataset.id;
                const res = window.stateManager.buyItem(cat, id);
                if (res.success) {
                    window.audioEngine.playCoin();
                    this.showToast(`Purchased ${res.item.name}!`, '🎉');
                    window.stateManager.equipItem(cat, id);
                    this.updateHeaderStats();
                    this.renderShop(cat);
                } else {
                    window.audioEngine.playError();
                    this.showToast(res.reason, '⚠️', 'error');
                }
            });
        });

        container.querySelectorAll('.btn-shop-equip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = btn.closest('.shop-card');
                const cat = card.dataset.category;
                const id = card.dataset.id;
                window.stateManager.equipItem(cat, id);
                window.audioEngine.playClick();
                this.updateHeaderStats();
                this.renderShop(cat);
                this.showToast('Item Equipped!', '✨');
            });
        });
    }

    // --- ACHIEVEMENTS VIEW RENDERING ---

    renderAchievements() {
        const container = document.getElementById('achievements-list');
        if (!container) return;

        const claimed = window.stateManager.claimedAchievements || [];
        container.innerHTML = window.ACHIEVEMENTS_LIST.map(ach => {
            const isClaimed = claimed.includes(ach.id);
            return `
                <div class="achievement-card ${isClaimed ? 'claimed' : 'locked'}">
                    <div class="text-3xl mr-3">${ach.icon}</div>
                    <div class="flex-grow">
                        <div class="flex justify-between items-center">
                            <h4 class="font-bold text-white text-sm">${ach.title}</h4>
                            <span class="text-xs ${isClaimed ? 'text-green-400 font-bold' : 'text-gray-400'}">
                                ${isClaimed ? 'CLAIMED ✓' : `🪙 ${ach.rewardCoins} 💎 ${ach.rewardGems}`}
                            </span>
                        </div>
                        <p class="text-xs text-gray-400 mt-1">${ach.desc}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // --- STATS DASHBOARD RENDERING ---

    renderStatsDashboard() {
        const stats = window.stateManager.stats;
        const total = stats.totalGames || 0;
        const won = stats.gamesWon || 0;
        const drawn = stats.gamesDrawn || 0;
        const lost = stats.gamesLost || 0;
        const winrate = total > 0 ? Math.round((won / total) * 100) : 0;

        document.getElementById('stat-total-games').textContent = total;
        document.getElementById('stat-win-rate').textContent = `${winrate}%`;
        document.getElementById('stat-wins').textContent = won;
        document.getElementById('stat-losses').textContent = lost;
        document.getElementById('stat-draws').textContent = drawn;
        document.getElementById('stat-streak').textContent = `${stats.winStreak} (Best: ${stats.maxWinStreak})`;
        document.getElementById('stat-stars').textContent = `${window.stateManager.getTotalStars()} / 72`;
        document.getElementById('stat-puzzles').textContent = (window.stateManager.completedPuzzles || []).length;
    }

    openSettingsModal() {
        const sfx = document.getElementById('setting-sfx-volume');
        const music = document.getElementById('setting-music-volume');
        const shake = document.getElementById('setting-screenshake');
        const cb = document.getElementById('setting-colorblind');
        const bSize = document.getElementById('setting-boardsize');

        if (sfx) sfx.value = window.stateManager.settings.sfxVolume;
        if (music) music.value = window.stateManager.settings.musicVolume;
        if (shake) shake.checked = window.stateManager.settings.screenShake;
        if (cb) cb.checked = window.stateManager.settings.colorblindMode;
        if (bSize) bSize.value = window.stateManager.settings.boardSize;

        this.openModal('settings');
    }

    updateAudioIcons() {
        const btn = document.getElementById('btn-music-toggle');
        if (btn) {
            btn.textContent = window.stateManager.settings.isMuted ? '🔇' : '🔊';
        }
    }
}

window.uiManager = new UIManager();
