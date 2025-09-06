```markdown
# Clash of Dots: Connect Four with AI

## Description

"Clash of Dots" is a classic Connect Four game implemented as a self-contained web application. It features an AI opponent powered by the Minimax algorithm with Alpha-Beta pruning. The game tracks local statistics without needing a backend server.

## Features

-   **Classic Connect Four Gameplay**: Play the traditional game on a 7x6 grid, aiming to connect four discs in a row horizontally, vertically, or diagonally.
-   **Intelligent AI Opponent**: The AI uses the Minimax algorithm with Alpha-Beta pruning to make strategic decisions.
-   **Persistent Local Statistics**: Game statistics (games played, won, and drawn) are stored in the browser's local storage.
-   **Responsive Design**: The game is designed to be responsive and work well on both desktop and mobile devices.

## How to Play

1.  Open the `index.html` file in your web browser.
2.  Choose whether you or the AI will go first.
3.  Click on a column to drop your disc.
4.  The first player to connect four discs in a row wins.

## Project Structure

The project is structured as follows:

-   `index.html`: The main HTML file for the game's structure and UI.
-   `style.css`: The CSS file for styling the game's appearance.
-   `script.js`: The JavaScript file containing the game logic and AI.
```