/**
 * Clash of Dots - Tactical Puzzles & Daily Challenge Engine
 * 12 Curated Tactical Scenarios, Daily Challenge Generator,
 * and Blitz Mode configuration.
 */

const TACTICAL_PUZZLES = [
    {
        id: 'puz-1',
        title: 'Puzzle 1: Instant Victory',
        difficulty: 'Easy',
        description: 'Find the winning move in 1 turn. Connect four horizontally.',
        rows: 6, cols: 6,
        targetMoves: 1,
        rewardCoins: 50,
        rewardXP: 100,
        board: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 2, 2, 0, 0, 0],
            [1, 1, 1, 0, 2, 2]
        ],
        solutionMoves: [3],
        hint: 'Drop in column 4 (index 3) to complete the row of 4!'
    },
    {
        id: 'puz-2',
        title: 'Puzzle 2: Emergency Defense',
        difficulty: 'Easy',
        description: 'AI is threatening an instant vertical win next turn. Block the column!',
        rows: 6, cols: 6,
        targetMoves: 1,
        rewardCoins: 50,
        rewardXP: 100,
        board: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 2, 0, 0, 0],
            [1, 0, 2, 0, 0, 0],
            [1, 1, 2, 0, 0, 0]
        ],
        solutionMoves: [2],
        hint: 'Drop in column 3 (index 2) to cap the AI vertical stack before they strike!'
    },
    {
        id: 'puz-3',
        title: 'Puzzle 3: The Double Fork',
        difficulty: 'Medium',
        description: 'Create an unstoppable 2-way threat where AI can only block one side.',
        rows: 6, cols: 6,
        targetMoves: 1,
        rewardCoins: 80,
        rewardXP: 150,
        board: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 2, 2, 0, 0, 0],
            [0, 1, 1, 0, 0, 2]
        ],
        solutionMoves: [3],
        hint: 'Place your disc at column 4 (index 3) to create three-in-a-row with both ends open!'
    },
    {
        id: 'puz-4',
        title: 'Puzzle 4: Diagonal Strike',
        difficulty: 'Medium',
        description: 'Spot the diagonal path hidden between opponent pieces.',
        rows: 6, cols: 6,
        targetMoves: 1,
        rewardCoins: 80,
        rewardXP: 150,
        board: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 1, 2, 0, 0],
            [0, 1, 2, 1, 2, 2]
        ],
        solutionMoves: [3],
        hint: 'Look at the ascending diagonal starting from column 1 (index 0 or 1).'
    },
    {
        id: 'puz-5',
        title: 'Puzzle 5: The Column Trap',
        difficulty: 'Medium',
        description: 'Do not play where AI will win right above you. Force them to feed your win.',
        rows: 6, cols: 6,
        targetMoves: 2,
        rewardCoins: 100,
        rewardXP: 200,
        board: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 1, 2, 2, 0, 0],
            [2, 1, 1, 2, 0, 0]
        ],
        solutionMoves: [1],
        hint: 'Stack on column 2 (index 1) to seal your vertical four!'
    },
    {
        id: 'puz-6',
        title: 'Puzzle 6: Obstacle Bypass',
        difficulty: 'Hard',
        description: 'Navigate around solid obstacles to connect 4 diagonally.',
        rows: 6, cols: 6,
        targetMoves: 1,
        rewardCoins: 120,
        rewardXP: 250,
        board: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 0],
            [0, 0, 1, 2, 0, 0],
            [0, -1, 2, 1, 0, 0],
            [1, 2, 1, 2, 2, 0]
        ],
        solutionMoves: [4],
        hint: 'Drop in column 5 (index 4) to land at row 4 and connect the diagonal.'
    },
    {
        id: 'puz-7',
        title: 'Puzzle 7: The Zugzwang Bait',
        difficulty: 'Hard',
        description: 'Bait the AI into a move that opens your winning slot.',
        rows: 6, cols: 6,
        targetMoves: 2,
        rewardCoins: 150,
        rewardXP: 300,
        board: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 2, 0, 0, 0, 0],
            [0, 2, 1, 1, 0, 0],
            [1, 2, 2, 1, 2, 0]
        ],
        solutionMoves: [4],
        hint: 'Threaten horizontally on the right wing.'
    },
    {
        id: 'puz-8',
        title: 'Puzzle 8: High Ground Ascend',
        difficulty: 'Hard',
        description: 'Spot the elusive top-level anti-diagonal connection.',
        rows: 6, cols: 6,
        targetMoves: 1,
        rewardCoins: 150,
        rewardXP: 300,
        board: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 0],
            [0, 0, 1, 2, 2, 0],
            [0, 1, 2, 1, 2, 0],
            [1, 2, 1, 2, 1, 2]
        ],
        solutionMoves: [4],
        hint: 'Drop in column 5 (index 4) to elevate to row 2 and seal the 4-in-a-row diagonal.'
    },
    {
        id: 'puz-9',
        title: 'Puzzle 9: Precision Bombardment',
        difficulty: 'Expert',
        description: 'Use the Bomb power-up to blow open the AI fortification and score a win!',
        rows: 6, cols: 6,
        targetMoves: 1,
        hasBomb: true,
        rewardCoins: 200,
        rewardXP: 400,
        board: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 2, 0, 0, 0],
            [0, 0, 2, 0, 0, 0],
            [1, 1, 2, 1, 0, 0],
            [1, 1, 2, 1, 2, 2]
        ],
        solutionMoves: [2],
        hint: 'Detonate a bomb in column 3 (index 2) to eliminate the AI wall and connect your row!'
    },
    {
        id: 'puz-10',
        title: 'Puzzle 10: The Twin Spear',
        difficulty: 'Expert',
        description: 'Set up two simultaneous vertical threats that AI cannot both counter.',
        rows: 6, cols: 6,
        targetMoves: 2,
        rewardCoins: 200,
        rewardXP: 400,
        board: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 1, 0, 1, 0, 0],
            [2, 1, 2, 1, 0, 0],
            [2, 1, 2, 1, 2, 0]
        ],
        solutionMoves: [1, 3],
        hint: 'Either column 2 or column 4 will bring your vertical stack to 4.'
    },
    {
        id: 'puz-11',
        title: 'Puzzle 11: Laser Surgical Strike',
        difficulty: 'Master',
        description: 'Fire a laser to purge the obstructing column and drop your diagonal in place!',
        rows: 6, cols: 6,
        targetMoves: 1,
        hasLaser: true,
        rewardCoins: 250,
        rewardXP: 500,
        board: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 2, 1, 0, 0],
            [0, 1, 2, 2, 1, 0],
            [1, 2, 2, 1, 2, 1]
        ],
        solutionMoves: [2],
        hint: 'Vaporize column 3 (index 2) with the laser!'
    },
    {
        id: 'puz-12',
        title: 'Puzzle 12: Grandmaster Endgame',
        difficulty: 'Grandmaster',
        description: 'The definitive tactical endgame. Calculate 3 steps ahead to guarantee victory.',
        rows: 6, cols: 6,
        targetMoves: 2,
        rewardCoins: 300,
        rewardXP: 600,
        board: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 2, 1, 2, 0, 0],
            [2, 1, 2, 1, 1, 0],
            [1, 2, 1, 2, 2, 0],
            [1, 1, 2, 1, 2, 2]
        ],
        solutionMoves: [4],
        hint: 'Claim column 5 (index 4) to lock in an unavoidable double threat.'
    }
];

class ChallengeEngine {
    constructor() {
        this.puzzles = TACTICAL_PUZZLES;
    }

    getDailyChallenge() {
        const todayStr = new Date().toISOString().slice(0, 10);
        let hash = 0;
        for (let i = 0; i < todayStr.length; i++) {
            hash = (hash * 31 + todayStr.charCodeAt(i)) & 0xffffffff;
        }
        const puzzleIndex = Math.abs(hash) % this.puzzles.length;
        const puzzle = { ...this.puzzles[puzzleIndex] };

        return {
            id: `daily-${todayStr}`,
            date: todayStr,
            title: `Daily Protocol: ${todayStr}`,
            description: `Solve today's tactical scenario to earn 200 Coins and 50 Gems!`,
            rewardCoins: 200,
            rewardGems: 50,
            rewardXP: 400,
            puzzle: puzzle
        };
    }
}

window.TACTICAL_PUZZLES = TACTICAL_PUZZLES;
window.ChallengeEngine = ChallengeEngine;
window.challengeEngine = new ChallengeEngine();
