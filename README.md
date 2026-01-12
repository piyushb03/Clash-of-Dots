# Clash of Dots — Connect Four with AI

A classic Connect Four game with an intelligent AI opponent powered by Minimax algorithm.

<img width="1490" height="870" alt="image" src="https://github.com/user-attachments/assets/c4e596f8-b135-4140-ba45-2cddb4c799d5" />



## 📋 Description

Clash of Dots is a web-based implementation of the classic Connect Four game featuring an AI opponent that uses the Minimax algorithm with Alpha-Beta pruning for strategic gameplay. Play against the computer and track your performance with persistent local statistics.

## ✨ Features

- **Classic Connect Four Gameplay** — Play on a traditional 7x6 grid
- **Intelligent AI Opponent** — Minimax algorithm with Alpha-Beta pruning
- **Persistent Statistics** — Track games played, won, and drawn using browser local storage
- **Responsive Design** — Works seamlessly on desktop and mobile devices
- **No Backend Required** — Fully self-contained web application

## 🎮 How to Play

1. Open `index.html` in your web browser
2. Choose who goes first (You or AI)
3. Click on any column to drop your disc
4. Connect four discs horizontally, vertically, or diagonally to win
5. First player to connect four wins!

## 📸 Demo

https://github.com/user-attachments/assets/563b971b-64e0-4c19-9f84-af0dd5ecf4cb


## 📁 Project Structure

```
Clash-of-Dots/
├── index.html      # Main HTML structure
├── style.css       # Game styling
└── script.js       # Game logic and AI
```

## 🚀 Installation

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/clash-of-dots.git
cd clash-of-dots
```

2. **Open the game**
```bash
# Simply open index.html in your browser
# Or use a local server:
python -m http.server 8000
# Visit http://localhost:8000
```

That's it! No dependencies or installation required.

## 🛠️ Tech Stack

- **HTML5** — Structure and layout
- **CSS3** — Styling and animations
- **JavaScript (ES6+)** — Game logic and AI
- **Local Storage API** — Persistent statistics

## 🤖 AI Algorithm

The AI opponent uses:
- **Minimax Algorithm** — Evaluates all possible moves
- **Alpha-Beta Pruning** — Optimizes decision-making speed
- **Depth-Limited Search** — Balances performance and intelligence

## 📊 Game Statistics

Stats tracked locally in your browser:
- Total games played
- Games won
- Games lost
- Games drawn
- Win percentage
  



## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Project Link: [https://github.com/yourusername/clash-of-dots](https://github.com/yourusername/clash-of-dots)


---

<div align="center">

**⭐ If you enjoyed this game, please give it a star! ⭐**

Made with ❤️ for game lovers

</div>
