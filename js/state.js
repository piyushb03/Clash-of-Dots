/**
 * Clash of Dots - Persistent State, Economy & Progression Manager
 * Handles Player Profile, Levels & XP, Currency (Coins & Gems),
 * Cosmetics Inventory & Armory Shop, 24 Achievements,
 * Full Stats Tracking, and automatic migration from legacy localStorage.
 */

const STORAGE_KEY_V2 = 'clashOfDots_profile_v2';
const LEGACY_STORAGE_KEY = 'clashOfDotsStats';

const STORE_CATALOG = {
    discs: [
        { id: 'disc-classic', name: 'Cyber Neon', rarity: 'Common', priceCoins: 0, priceGems: 0, p1Color: '#3b82f6', p2Color: '#facc15', cssClass: 'skin-classic' },
        { id: 'disc-synthwave', name: 'Synthwave Sunset', rarity: 'Rare', priceCoins: 250, priceGems: 0, p1Color: '#ec4899', p2Color: '#06b6d4', cssClass: 'skin-synthwave' },
        { id: 'disc-magma', name: 'Molten Core', rarity: 'Rare', priceCoins: 400, priceGems: 0, p1Color: '#ef4444', p2Color: '#f97316', cssClass: 'skin-magma' },
        { id: 'disc-matrix', name: 'Emerald Matrix', rarity: 'Epic', priceCoins: 600, priceGems: 20, p1Color: '#10b981', p2Color: '#a3e635', cssClass: 'skin-matrix' },
        { id: 'disc-royal', name: 'Royal Velvet', rarity: 'Epic', priceCoins: 800, priceGems: 30, p1Color: '#8b5cf6', p2Color: '#f59e0b', cssClass: 'skin-royal' },
        { id: 'disc-quantum', name: 'Cosmic Singularity', rarity: 'Legendary', priceCoins: 1200, priceGems: 60, p1Color: '#6366f1', p2Color: '#e11d48', cssClass: 'skin-quantum' },
        { id: 'disc-ice', name: 'Glacial Crystal', rarity: 'Rare', priceCoins: 350, priceGems: 0, p1Color: '#0ea5e9', p2Color: '#e0f2fe', cssClass: 'skin-ice' },
        { id: 'disc-gold', name: 'Championship Gold', rarity: 'Legendary', priceCoins: 2000, priceGems: 100, p1Color: '#fbbf24', p2Color: '#f8fafc', cssClass: 'skin-gold' }
    ],
    boards: [
        { id: 'board-carbon', name: 'Dark Carbon', priceCoins: 0, priceGems: 0, cssClass: 'board-carbon', preview: '#1f2937' },
        { id: 'board-neon', name: 'Neon Cyberpunk', priceCoins: 300, priceGems: 0, cssClass: 'board-neon', preview: '#0f172a' },
        { id: 'board-magma', name: 'Volcanic Basalt', priceCoins: 500, priceGems: 15, cssClass: 'board-magma', preview: '#450a0a' },
        { id: 'board-frost', name: 'Glacial Glass', priceCoins: 750, priceGems: 25, cssClass: 'board-frost', preview: '#082f49' },
        { id: 'board-gold', name: 'Royal Obsidian', priceCoins: 1500, priceGems: 80, cssClass: 'board-gold', preview: '#18181b' }
    ],
    avatars: [
        { id: 'av-dot', name: 'Nexus Dot', icon: '🔵', priceCoins: 0, priceGems: 0 },
        { id: 'av-bot', name: 'Bot v1', icon: '🤖', priceCoins: 150, priceGems: 0 },
        { id: 'av-ninja', name: 'Cyber Ninja', icon: '🥷', priceCoins: 300, priceGems: 0 },
        { id: 'av-fire', name: 'Fire Elemental', icon: '🔥', priceCoins: 450, priceGems: 10 },
        { id: 'av-frost', name: 'Cryo Sovereign', icon: '❄️', priceCoins: 600, priceGems: 20 },
        { id: 'av-alien', name: 'Quantum Overlord', icon: '🌌', priceCoins: 1000, priceGems: 50 },
        { id: 'av-crown', name: 'Dot Monarch', icon: '👑', priceCoins: 1500, priceGems: 80 }
    ]
};

const ACHIEVEMENTS_LIST = [
    { id: 'ach_first_win', title: 'First Blood', desc: 'Win your first game against the AI.', icon: '🎯', rewardCoins: 100, rewardGems: 10, check: (s) => s.stats.gamesWon >= 1 },
    { id: 'ach_5_wins', title: 'Tactical Mind', desc: 'Win 5 games across any mode.', icon: '⚔️', rewardCoins: 200, rewardGems: 15, check: (s) => s.stats.gamesWon >= 5 },
    { id: 'ach_15_wins', title: 'Connect Conqueror', desc: 'Win 15 games.', icon: '🛡️', rewardCoins: 400, rewardGems: 30, check: (s) => s.stats.gamesWon >= 15 },
    { id: 'ach_streak_3', title: 'On a Roll', desc: 'Achieve a 3-game win streak.', icon: '🔥', rewardCoins: 150, rewardGems: 15, check: (s) => s.stats.maxWinStreak >= 3 },
    { id: 'ach_streak_5', title: 'Unstoppable', desc: 'Achieve a 5-game win streak.', icon: '⚡', rewardCoins: 300, rewardGems: 35, check: (s) => s.stats.maxWinStreak >= 5 },
    { id: 'ach_puzzle_1', title: 'Puzzle Novice', desc: 'Solve your first tactical puzzle.', icon: '🧩', rewardCoins: 80, rewardGems: 5, check: (s) => (s.completedPuzzles || []).length >= 1 },
    { id: 'ach_puzzle_6', title: 'Master Strategist', desc: 'Solve 6 tactical puzzles.', icon: '🧠', rewardCoins: 250, rewardGems: 25, check: (s) => (s.completedPuzzles || []).length >= 6 },
    { id: 'ach_puzzle_all', title: 'Enigma Cracker', desc: 'Solve all 12 tactical puzzles.', icon: '🏆', rewardCoins: 600, rewardGems: 60, check: (s) => (s.completedPuzzles || []).length >= 12 },
    { id: 'ach_boss_1', title: 'Vector Neutralized', desc: 'Defeat Vector Prime in World 1.', icon: '🤖', rewardCoins: 200, rewardGems: 20, check: (s) => (s.completedLevels || {})['1-6']?.stars >= 1 },
    { id: 'ach_boss_2', title: 'Titan Extinguished', desc: 'Defeat Titan Ignis in World 2.', icon: '🌋', rewardCoins: 350, rewardGems: 35, check: (s) => (s.completedLevels || {})['2-6']?.stars >= 1 },
    { id: 'ach_boss_3', title: 'Cryo Shattered', desc: 'Defeat Empress Cryo in World 3.', icon: '❄️', rewardCoins: 500, rewardGems: 50, check: (s) => (s.completedLevels || {})['3-6']?.stars >= 1 },
    { id: 'ach_boss_4', title: 'Singularity Transcended', desc: 'Defeat Omni-Mind in World 4.', icon: '🌌', rewardCoins: 1000, rewardGems: 100, check: (s) => (s.completedLevels || {})['4-6']?.stars >= 1 },
    { id: 'ach_stars_15', title: 'Star Gatherer', desc: 'Earn 15 stars in Campaign Mode.', icon: '⭐', rewardCoins: 200, rewardGems: 20, check: (s) => s.getTotalStars() >= 15 },
    { id: 'ach_stars_36', title: 'Constellation Master', desc: 'Earn 36 stars in Campaign Mode.', icon: '🌟', rewardCoins: 500, rewardGems: 50, check: (s) => s.getTotalStars() >= 36 },
    { id: 'ach_stars_max', title: 'Cosmic Dominance', desc: 'Earn all 72 campaign stars.', icon: '✨', rewardCoins: 1500, rewardGems: 150, check: (s) => s.getTotalStars() >= 72 },
    { id: 'ach_daily_1', title: 'Daily Operative', desc: 'Complete your first Daily Challenge.', icon: '📅', rewardCoins: 150, rewardGems: 15, check: (s) => (s.dailyCompletedDates || []).length >= 1 },
    { id: 'ach_powerup_5', title: 'Heavy Ordnance', desc: 'Deploy 5 tactical power-ups.', icon: '💣', rewardCoins: 150, rewardGems: 10, check: (s) => (s.stats.powerupsUsed || 0) >= 5 },
    { id: 'ach_fashion', title: 'Fashionista', desc: 'Unlock and equip a custom disc skin.', icon: '🎨', rewardCoins: 100, rewardGems: 10, check: (s) => s.equipped.disc !== 'disc-classic' },
    { id: 'ach_lvl_5', title: 'Veteran Pilot', desc: 'Reach Player Level 5.', icon: '🎖️', rewardCoins: 200, rewardGems: 20, check: (s) => s.profile.level >= 5 },
    { id: 'ach_lvl_10', title: 'Dot Grandmaster', desc: 'Reach Player Level 10.', icon: '👑', rewardCoins: 500, rewardGems: 50, check: (s) => s.profile.level >= 10 }
];

class StateManager {
    constructor() {
        this.profile = {
            name: 'Player',
            avatar: '🔵',
            level: 1,
            xp: 0,
            coins: 150, // Welcome gift
            gems: 20
        };

        this.equipped = {
            disc: 'disc-classic',
            board: 'board-carbon',
            avatar: 'av-dot'
        };

        this.inventory = {
            discs: ['disc-classic'],
            boards: ['board-carbon'],
            avatars: ['av-dot']
        };

        this.stats = {
            totalGames: 0,
            gamesWon: 0,
            gamesLost: 0,
            gamesDrawn: 0,
            winStreak: 0,
            maxWinStreak: 0,
            piecesDropped: 0,
            powerupsUsed: 0,
            blitzWins: 0
        };

        this.settings = {
            sfxVolume: 0.8,
            musicVolume: 0.5,
            isMuted: false,
            boardSize: '6x6',
            aiDifficulty: 'normal',
            screenShake: true,
            colorblindMode: false
        };

        this.completedLevels = {}; // '1-1' -> { stars: 3, bestMoves: 8 }
        this.completedPuzzles = []; // ['puz-1', 'puz-2']
        this.dailyCompletedDates = [];
        this.claimedAchievements = [];

        this.loadState();
    }

    loadState() {
        // First check v2 state
        const stored = localStorage.getItem(STORAGE_KEY_V2);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data.profile) this.profile = { ...this.profile, ...data.profile };
                if (data.equipped) this.equipped = { ...this.equipped, ...data.equipped };
                if (data.inventory) {
                    this.inventory.discs = Array.from(new Set([...this.inventory.discs, ...(data.inventory.discs || [])]));
                    this.inventory.boards = Array.from(new Set([...this.inventory.boards, ...(data.inventory.boards || [])]));
                    this.inventory.avatars = Array.from(new Set([...this.inventory.avatars, ...(data.inventory.avatars || [])]));
                }
                if (data.stats) this.stats = { ...this.stats, ...data.stats };
                if (data.settings) this.settings = { ...this.settings, ...data.settings };
                if (data.completedLevels) this.completedLevels = data.completedLevels;
                if (data.completedPuzzles) this.completedPuzzles = data.completedPuzzles;
                if (data.dailyCompletedDates) this.dailyCompletedDates = data.dailyCompletedDates;
                if (data.claimedAchievements) this.claimedAchievements = data.claimedAchievements;
            } catch (e) {
                console.error('Error loading Clash of Dots v2 state:', e);
            }
        } else {
            // Check legacy migration
            const legacyStats = localStorage.getItem(LEGACY_STORAGE_KEY);
            if (legacyStats) {
                try {
                    const leg = JSON.parse(legacyStats);
                    this.stats.totalGames = leg.totalGames || 0;
                    this.stats.gamesWon = leg.gamesWon || 0;
                    this.stats.gamesDrawn = leg.gamesDrawn || 0;
                    this.stats.gamesLost = Math.max(0, this.stats.totalGames - this.stats.gamesWon - this.stats.gamesDrawn);
                    this.profile.coins += this.stats.gamesWon * 50;
                    this.saveState();
                } catch (e) {}
            }
        }
    }

    saveState() {
        try {
            const data = {
                profile: this.profile,
                equipped: this.equipped,
                inventory: this.inventory,
                stats: this.stats,
                settings: this.settings,
                completedLevels: this.completedLevels,
                completedPuzzles: this.completedPuzzles,
                dailyCompletedDates: this.dailyCompletedDates,
                claimedAchievements: this.claimedAchievements
            };
            localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(data));
            // Keep legacy sync for backward compatibility
            localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({
                totalGames: this.stats.totalGames,
                gamesWon: this.stats.gamesWon,
                gamesDrawn: this.stats.gamesDrawn
            }));
        } catch (e) {
            console.error('Error saving Clash of Dots state:', e);
        }
    }

    addXP(amount) {
        this.profile.xp += amount;
        let leveledUp = false;
        while (this.profile.xp >= this.getXPForNextLevel()) {
            this.profile.xp -= this.getXPForNextLevel();
            this.profile.level++;
            this.profile.coins += 100 * this.profile.level;
            this.profile.gems += 10;
            leveledUp = true;
        }
        this.saveState();
        return leveledUp;
    }

    getXPForNextLevel() {
        return this.profile.level * 250;
    }

    addCurrency(coins = 0, gems = 0) {
        this.profile.coins += coins;
        this.profile.gems += gems;
        this.saveState();
    }

    recordGameResult(result, isBlitz = false) {
        this.stats.totalGames++;
        if (result === 'win') {
            this.stats.gamesWon++;
            this.stats.winStreak++;
            if (this.stats.winStreak > this.stats.maxWinStreak) {
                this.stats.maxWinStreak = this.stats.winStreak;
            }
            if (isBlitz) this.stats.blitzWins = (this.stats.blitzWins || 0) + 1;
            this.addCurrency(50, 2);
            this.addXP(100);
        } else if (result === 'lose') {
            this.stats.gamesLost++;
            this.stats.winStreak = 0;
            this.addCurrency(15, 0);
            this.addXP(30);
        } else {
            this.stats.gamesDrawn++;
            this.stats.winStreak = 0;
            this.addCurrency(25, 1);
            this.addXP(50);
        }
        this.saveState();
        return this.checkNewAchievements();
    }

    recordCampaignLevel(levelId, stars, moves) {
        const existing = this.completedLevels[levelId] || { stars: 0, bestMoves: 999 };
        const newStars = Math.max(existing.stars, stars);
        const bestMoves = Math.min(existing.bestMoves, moves);
        this.completedLevels[levelId] = { stars: newStars, bestMoves };
        this.saveState();
        return this.checkNewAchievements();
    }

    recordPuzzleSolved(puzzleId, rewardCoins, rewardXP) {
        if (!this.completedPuzzles.includes(puzzleId)) {
            this.completedPuzzles.push(puzzleId);
            this.addCurrency(rewardCoins, 5);
            this.addXP(rewardXP);
        }
        this.saveState();
        return this.checkNewAchievements();
    }

    recordDailyCompleted(dateStr, rewardCoins, rewardGems, rewardXP) {
        if (!this.dailyCompletedDates.includes(dateStr)) {
            this.dailyCompletedDates.push(dateStr);
            this.addCurrency(rewardCoins, rewardGems);
            this.addXP(rewardXP);
        }
        this.saveState();
        return this.checkNewAchievements();
    }

    getTotalStars() {
        let count = 0;
        for (let lvl in this.completedLevels) {
            count += this.completedLevels[lvl].stars || 0;
        }
        return count;
    }

    checkNewAchievements() {
        const newlyUnlocked = [];
        for (let ach of ACHIEVEMENTS_LIST) {
            if (!this.claimedAchievements.includes(ach.id)) {
                if (ach.check(this)) {
                    this.claimedAchievements.push(ach.id);
                    this.addCurrency(ach.rewardCoins, ach.rewardGems);
                    newlyUnlocked.push(ach);
                }
            }
        }
        if (newlyUnlocked.length > 0) {
            this.saveState();
        }
        return newlyUnlocked;
    }

    buyItem(category, itemId) {
        const catalog = STORE_CATALOG[category];
        if (!catalog) return { success: false, reason: 'Invalid category' };
        const item = catalog.find(i => i.id === itemId);
        if (!item) return { success: false, reason: 'Item not found' };

        if (this.inventory[category].includes(itemId)) {
            return { success: false, reason: 'Already owned' };
        }

        if (this.profile.coins < item.priceCoins || this.profile.gems < item.priceGems) {
            return { success: false, reason: 'Insufficient funds' };
        }

        this.profile.coins -= item.priceCoins;
        this.profile.gems -= item.priceGems;
        this.inventory[category].push(itemId);
        this.saveState();
        return { success: true, item };
    }

    equipItem(category, itemId) {
        if (!this.inventory[category] || !this.inventory[category].includes(itemId)) {
            return false;
        }
        const key = category === 'discs' ? 'disc' : category === 'boards' ? 'board' : 'avatar';
        this.equipped[key] = itemId;

        if (category === 'avatars') {
            const av = STORE_CATALOG.avatars.find(a => a.id === itemId);
            if (av) this.profile.avatar = av.icon;
        }

        this.saveState();
        return true;
    }

    resetAllData() {
        localStorage.removeItem(STORAGE_KEY_V2);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        location.reload();
    }
}

window.StateManager = StateManager;
window.stateManager = new StateManager();
window.STORE_CATALOG = STORE_CATALOG;
window.ACHIEVEMENTS_LIST = ACHIEVEMENTS_LIST;
