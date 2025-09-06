# Clash of Dots

"Clash of Dots" is an engaging, AI-powered Connect Four game built for both desktop and mobile web. Challenge a smart AI opponent in a classic battle of wits, with real-time game statistics updated across all players.

## Features

*   **Classic Gameplay:** A modern, sleek take on the timeless Connect Four game.
*   **Intelligent AI Opponent:** The AI uses a Minimax algorithm with Alpha-Beta Pruning to make optimal moves, providing a challenging and strategic experience.
*   **Real-time Global Stats:** Track total games played, games won, and games drawn, with statistics updated and shared across all active players.
*   **Responsive Design:** A clean, minimalist user interface that's fully optimized for seamless play on any device.
*   **Intuitive UI:** Simple game controls and a clear information panel with game rules and project details.

## How to Play

The objective is simple: be the first to get four of your colored dots in a row—either horizontally, vertically, or diagonally.

*   Click on any column to drop your dot.
*   The game alternates between your turn (🔵) and the AI's turn (🟡).
*   The game ends when a player successfully connects four dots or when the board is full, resulting in a draw.
*   You can start a new game at any time, choosing who gets the first move.

## Tech Stack

The project is built with a simple but powerful stack for a full-stack, real-time experience.

*   **Front-End:** HTML, Tailwind CSS, and vanilla JavaScript.
*   **Back-End:** Node.js with Express.js.
*   **Database:** MongoDB with Mongoose for data persistence.

## Setup & Installation

To run this project locally, you need to set up both the back-end server and the front-end files.

### Prerequisites

*   Node.js (v14 or higher)
*   MongoDB (Local instance or cloud-hosted via MongoDB Atlas)

### Back-End Setup

1.  Clone this repository to your local machine.
2.  Navigate to the back-end directory in your terminal and install the dependencies:

    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and add your MongoDB connection string:

    ```
    MONGODB_URI="your_mongodb_connection_string"
    ```
4.  Start the server:

    ```bash
    node server.js
    ```

    The server will run on `http://localhost:3000`.

### Front-End Setup

1.  Open the `index.html` file in your preferred code editor.
2.  In the `<script>` tag, update the `API_URL` constant to point to your local server:

    ```javascript
    const API_URL = 'http://localhost:3000/api/stats';
    ```
3.  Simply open the `index.html` file in your web browser to start playing the game.

## Contributing

Contributions are welcome! If you have any suggestions or find a bug, please feel free to open an issue or submit a pull request.
