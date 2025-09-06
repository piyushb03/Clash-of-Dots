require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to enable CORS and parse JSON bodies
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB! 🎉'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Define the game stats schema and model with default values set to 0
const gameStatsSchema = new mongoose.Schema({
    totalGames: {
        type: Number,
        default: 0
    },
    gamesWon: {
        type: Number,
        default: 0
    },
    gamesDrawn: {
        type: Number,
        default: 0
    }
});

const GameStats = mongoose.model('GameStats', gameStatsSchema);

// Endpoint to get game stats
app.get('/api/stats', async (req, res) => {
    try {
        let stats = await GameStats.findOne({});
        if (!stats) {
            // If no stats exist, create a new document with default values
            stats = new GameStats();
            await stats.save();
        }
        res.json(stats);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching stats',
            error
        });
    }
});

// Endpoint to update game stats (increment total games)
app.post('/api/stats/total', async (req, res) => {
    try {
        let stats = await GameStats.findOne({});
        if (!stats) {
            stats = new GameStats();
        }
        stats.totalGames += 1;
        await stats.save();
        res.json(stats);
    } catch (error) {
        res.status(500).json({
            message: 'Error updating total games',
            error
        });
    }
});

// Endpoint to update game stats (increment games won and total games)
app.post('/api/stats/win', async (req, res) => {
    try {
        let stats = await GameStats.findOne({});
        if (!stats) {
            stats = new GameStats();
        }
        stats.totalGames += 1;
        stats.gamesWon += 1;
        await stats.save();
        res.json(stats);
    } catch (error) {
        res.status(500).json({
            message: 'Error updating games won',
            error
        });
    }
});

// Endpoint to update game stats (increment games drawn and total games)
app.post('/api/stats/draw', async (req, res) => {
    try {
        let stats = await GameStats.findOne({});
        if (!stats) {
            stats = new GameStats();
        }
        stats.totalGames += 1;
        stats.gamesDrawn += 1;
        await stats.save();
        res.json(stats);
    } catch (error) {
        res.status(500).json({
            message: 'Error updating games drawn',
            error
        });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});