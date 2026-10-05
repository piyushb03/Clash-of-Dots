/**
 * Clash of Dots - Campaign System
 * 4 Themed Worlds, 24 Distinct Stages (20 Levels + 4 Epic Boss Battles),
 * 3-Star Rating Goals, Objectives, Environmental Hazards, and Special Mechanics.
 */

const CAMPAIGN_WORLDS = [
    {
        id: 'world-1',
        title: 'World 1: Neon Nexus',
        subtitle: 'The Digital Grid',
        description: 'Master the fundamentals of dot warfare across neon-lit cyber highways.',
        theme: 'neon',
        color: '#3b82f6',
        accent: '#60a5fa',
        bossId: 'boss-vector',
        levels: [
            {
                id: '1-1',
                title: 'First Contact',
                rows: 6, cols: 6,
                aiDifficulty: 'easy',
                maxMoves: 20,
                obstacles: [],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 12 moves',
                    3: 'Prevent AI from making 3-in-a-row'
                },
                briefing: 'Welcome to the Grid, Operative. Connect four dots horizontally, vertically, or diagonally to defeat the AI recruit.'
            },
            {
                id: '1-2',
                title: 'Center Control',
                rows: 6, cols: 6,
                aiDifficulty: 'easy',
                maxMoves: 18,
                obstacles: [],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 14 moves',
                    3: 'Place at least 3 discs in the center columns'
                },
                briefing: 'Control the middle columns to dominate all angles of tactical approach.'
            },
            {
                id: '1-3',
                title: 'The Obstacle Course',
                rows: 6, cols: 6,
                aiDifficulty: 'normal',
                maxMoves: 18,
                obstacles: [{ row: 5, col: 2 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win with an obstacle on the board',
                    3: 'Win within 12 moves'
                },
                briefing: 'A digital firewall block has materialized in column 3. Navigate around it to claim victory.'
            },
            {
                id: '1-4',
                title: 'Rapid Response',
                rows: 6, cols: 6,
                aiDifficulty: 'normal',
                maxMoves: 14,
                obstacles: [{ row: 5, col: 1 }, { row: 5, col: 4 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 10 moves',
                    3: 'Win using a diagonal line'
                },
                briefing: 'Two blocked sectors. AI logic is learning fast. Execute a diagonal blitz.'
            },
            {
                id: '1-5',
                title: 'Threshold Breach',
                rows: 7, cols: 6,
                aiDifficulty: 'normal',
                maxMoves: 22,
                obstacles: [],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 14 moves',
                    3: 'Do not allow AI more than two 2-in-a-row lines'
                },
                briefing: 'The arena has expanded to 7 rows! The sector guardian approaches.'
            },
            {
                id: '1-6',
                title: 'BOSS: Vector Prime',
                isBoss: true,
                bossName: 'Vector Prime',
                bossAvatar: '🤖',
                bossTitle: 'Nexus Firewall Core',
                rows: 7, cols: 6,
                aiDifficulty: 'hard',
                maxMoves: 26,
                obstacles: [{ row: 6, col: 0 }, { row: 6, col: 5 }],
                bossAbility: 'glitch',
                starConditions: {
                    1: 'Defeat Vector Prime',
                    2: 'Win in under 18 moves',
                    3: 'Win without using the undo power'
                },
                briefing: 'ALERT: Vector Prime defends the mainframe with adaptive algorithms. Break through its defense matrix!'
            }
        ]
    },
    {
        id: 'world-2',
        title: 'World 2: Magma Core',
        subtitle: 'The Molten Foundry',
        description: 'Venture into subterranean volcanic vents where molten debris obstructs the grid.',
        theme: 'magma',
        color: '#ef4444',
        accent: '#f97316',
        bossId: 'boss-ignis',
        levels: [
            {
                id: '2-1',
                title: 'Lava Vent',
                rows: 6, cols: 6,
                aiDifficulty: 'normal',
                maxMoves: 20,
                obstacles: [{ row: 5, col: 0 }, { row: 5, col: 5 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 12 moves',
                    3: 'Win with a vertical connection'
                },
                briefing: 'Outer columns are blocked by volcanic basalt. Battle fiercely for the central four corridors.'
            },
            {
                id: '2-2',
                title: 'Bomb Discovered',
                rows: 6, cols: 6,
                aiDifficulty: 'normal',
                maxMoves: 20,
                playerPowerups: ['bomb'],
                obstacles: [{ row: 4, col: 2 }, { row: 4, col: 3 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Use the Bomb power-up effectively',
                    3: 'Win in under 14 moves'
                },
                briefing: 'You have unearthed the Bomb Dot power-up! Detonate it to shatter obstructing rock and surrounding pieces.'
            },
            {
                id: '2-3',
                title: 'Thermal Vent',
                rows: 7, cols: 6,
                aiDifficulty: 'hard',
                maxMoves: 22,
                playerPowerups: ['bomb'],
                obstacles: [{ row: 6, col: 2 }, { row: 5, col: 3 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 16 moves',
                    3: 'Connect 4 diagonally across the rocks'
                },
                briefing: 'Asymmetrical rock obstacles force unconventional angles. Plan 3 steps ahead.'
            },
            {
                id: '2-4',
                title: 'Foundry Siege',
                rows: 7, cols: 7,
                aiDifficulty: 'hard',
                maxMoves: 24,
                playerPowerups: ['bomb'],
                obstacles: [{ row: 6, col: 1 }, { row: 6, col: 3 }, { row: 6, col: 5 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 18 moves',
                    3: 'Maintain center control'
                },
                briefing: 'Expanded 7x7 grid! Scattered obsidian debris restricts standard vertical stacking.'
            },
            {
                id: '2-5',
                title: 'Inferno Forge',
                rows: 7, cols: 7,
                aiDifficulty: 'hard',
                maxMoves: 22,
                playerPowerups: ['bomb', 'laser'],
                obstacles: [{ row: 6, col: 2 }, { row: 6, col: 4 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 14 moves',
                    3: 'Do not allow AI to connect 3 discs vertically'
                },
                briefing: 'Laser power-up unlocked! Fire through an entire column to incinerate enemy formations.'
            },
            {
                id: '2-6',
                title: 'BOSS: Titan Ignis',
                isBoss: true,
                bossName: 'Titan Ignis',
                bossAvatar: '🌋',
                bossTitle: 'Lord of the Molten Core',
                rows: 7, cols: 7,
                aiDifficulty: 'expert',
                maxMoves: 28,
                playerPowerups: ['bomb', 'laser'],
                obstacles: [{ row: 6, col: 0 }, { row: 6, col: 6 }, { row: 5, col: 3 }],
                bossAbility: 'eruption',
                starConditions: {
                    1: 'Extinguish Titan Ignis',
                    2: 'Win in under 20 moves',
                    3: 'Complete without losing more than 8 discs'
                },
                briefing: 'WARNING: Titan Ignis commands intense heat and relentless offensive pressure. Strike swiftly!'
            }
        ]
    },
    {
        id: 'world-3',
        title: 'World 3: Glacial Spire',
        subtitle: 'The Cryo Citadel',
        description: 'Ascend the frozen spires where icy chill and freezing columns test tactical resilience.',
        theme: 'ice',
        color: '#06b6d4',
        accent: '#38bdf8',
        bossId: 'boss-cryo',
        levels: [
            {
                id: '3-1',
                title: 'Frostbite Pass',
                rows: 7, cols: 6,
                aiDifficulty: 'normal',
                maxMoves: 22,
                obstacles: [{ row: 6, col: 1 }, { row: 6, col: 4 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 16 moves',
                    3: 'Win using a horizontal four'
                },
                briefing: 'Sub-zero temperatures demand pristine calculation. Build a horizontal bridge to victory.'
            },
            {
                id: '3-2',
                title: 'Ice Wall Defense',
                rows: 7, cols: 6,
                aiDifficulty: 'hard',
                maxMoves: 24,
                playerPowerups: ['freeze'],
                obstacles: [{ row: 5, col: 2 }, { row: 6, col: 2 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Use Freeze power-up on the AI',
                    3: 'Win in under 16 moves'
                },
                briefing: 'Freeze power-up acquired! Lock an opponent column to deny their winning slot for a critical turn.'
            },
            {
                id: '3-3',
                title: 'Slippery Slope',
                rows: 7, cols: 7,
                aiDifficulty: 'hard',
                maxMoves: 22,
                playerPowerups: ['freeze', 'bomb'],
                obstacles: [{ row: 6, col: 0 }, { row: 6, col: 3 }, { row: 6, col: 6 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 18 moves',
                    3: 'Achieve a double-threat fork'
                },
                briefing: 'Set a two-way trap that cannot be defended even by the cryogenic AI.'
            },
            {
                id: '3-4',
                title: 'Blizzard Stalker',
                rows: 7, cols: 7,
                aiDifficulty: 'hard',
                maxMoves: 20,
                playerPowerups: ['freeze'],
                obstacles: [{ row: 5, col: 1 }, { row: 5, col: 5 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 14 moves',
                    3: 'Win with a diagonal four'
                },
                briefing: 'Visibility drops in the blizzard. Find the diagonal angle AI overlooks.'
            },
            {
                id: '3-5',
                title: 'Crystal Matrix',
                rows: 8, cols: 7,
                aiDifficulty: 'expert',
                maxMoves: 26,
                playerPowerups: ['freeze', 'bomb', 'laser'],
                obstacles: [{ row: 7, col: 2 }, { row: 7, col: 4 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 18 moves',
                    3: 'Zero player blunders'
                },
                briefing: 'Massive 8-row crystalline arena! Utilize your entire arsenal of power-ups.'
            },
            {
                id: '3-6',
                title: 'BOSS: Empress Cryo',
                isBoss: true,
                bossName: 'Empress Cryo',
                bossAvatar: '❄️',
                bossTitle: 'Monarch of Perpetual Winter',
                rows: 8, cols: 7,
                aiDifficulty: 'expert',
                maxMoves: 30,
                playerPowerups: ['freeze', 'laser'],
                obstacles: [{ row: 7, col: 0 }, { row: 7, col: 6 }, { row: 6, col: 3 }],
                bossAbility: 'deep-freeze',
                starConditions: {
                    1: 'Shatter Empress Cryo',
                    2: 'Win in under 20 moves',
                    3: 'Prevent Cryo from freezing your winning move'
                },
                briefing: 'DANGER: Empress Cryo creates impenetrable defensive barricades. Break her perimeter!'
            }
        ]
    },
    {
        id: 'world-4',
        title: 'World 4: Quantum Void',
        subtitle: 'The Event Horizon',
        description: 'The boundaries of spacetime warp in the Singularity. Face the ultimate AI consciousness.',
        theme: 'quantum',
        color: '#a855f7',
        accent: '#c084fc',
        bossId: 'boss-omni',
        levels: [
            {
                id: '4-1',
                title: 'Singularity Edge',
                rows: 7, cols: 7,
                aiDifficulty: 'hard',
                maxMoves: 22,
                playerPowerups: ['bomb', 'freeze', 'laser'],
                obstacles: [{ row: 6, col: 3 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 16 moves',
                    3: 'Score a win with a laser combo'
                },
                briefing: 'Dark matter pulses at the center of the board. All tactics are permitted.'
            },
            {
                id: '4-2',
                title: 'Event Horizon',
                rows: 8, cols: 7,
                aiDifficulty: 'expert',
                maxMoves: 26,
                playerPowerups: ['bomb', 'laser'],
                obstacles: [{ row: 7, col: 1 }, { row: 7, col: 5 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 18 moves',
                    3: 'Never allow AI to hold 3 consecutive discs'
                },
                briefing: 'Expanded depth. High computational precision required to prevail.'
            },
            {
                id: '4-3',
                title: 'Quantum Entanglement',
                rows: 8, cols: 8,
                aiDifficulty: 'expert',
                maxMoves: 28,
                playerPowerups: ['freeze', 'laser'],
                obstacles: [{ row: 7, col: 2 }, { row: 7, col: 5 }, { row: 6, col: 3 }, { row: 6, col: 4 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 20 moves',
                    3: 'Complete without undoing'
                },
                briefing: 'A symmetrical quantum distortion splits the arena. Exploit the flanks!'
            },
            {
                id: '4-4',
                title: 'Null Space',
                rows: 8, cols: 8,
                aiDifficulty: 'expert',
                maxMoves: 26,
                playerPowerups: ['bomb', 'freeze', 'laser'],
                obstacles: [{ row: 7, col: 0 }, { row: 7, col: 7 }, { row: 6, col: 1 }, { row: 6, col: 6 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 18 moves',
                    3: 'Win using a vertical connect'
                },
                briefing: 'Void barriers block the edges. Channel all drops through the gravitational center.'
            },
            {
                id: '4-5',
                title: 'The Great Gate',
                rows: 8, cols: 8,
                aiDifficulty: 'expert',
                maxMoves: 30,
                playerPowerups: ['bomb', 'freeze', 'laser'],
                obstacles: [{ row: 7, col: 3 }, { row: 7, col: 4 }],
                starConditions: {
                    1: 'Win the match',
                    2: 'Win in under 22 moves',
                    3: 'Execute a 3-way simultaneous win setup'
                },
                briefing: 'The gateway to Omni-Mind is unsealed. Prove your mastery of Connect Four.'
            },
            {
                id: '4-6',
                title: 'FINAL BOSS: Omni-Mind Singularity',
                isBoss: true,
                bossName: 'Omni-Mind Singularity',
                bossAvatar: '🌌',
                bossTitle: 'Prime Artificial Consciousness',
                rows: 8, cols: 8,
                aiDifficulty: 'expert',
                maxMoves: 36,
                playerPowerups: ['bomb', 'freeze', 'laser'],
                obstacles: [{ row: 7, col: 0 }, { row: 7, col: 7 }, { row: 6, col: 2 }, { row: 6, col: 5 }],
                bossAbility: 'quantum-shift',
                starConditions: {
                    1: 'Deconstruct Omni-Mind',
                    2: 'Win in under 24 moves',
                    3: 'Claim all 3 stars to achieve Grandmaster Ascension'
                },
                briefing: 'FINAL PROTOCOL: Omni-Mind evaluates 10,000 simulations per second. Outsmart the transcendent intelligence to become the Legend of Dots!'
            }
        ]
    }
];

window.CAMPAIGN_WORLDS = CAMPAIGN_WORLDS;
