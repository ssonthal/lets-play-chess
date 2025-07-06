# Let's Play Chess

A modern, full-stack chess application that allows players to enjoy chess games online with real-time multiplayer functionality. Built with React, TypeScript, and Socket.io for seamless real-time gaming experience.

## 🎯 Features

### Core Gameplay
- **Real-time Multiplayer**: Play chess with friends using unique game IDs
- **Game State Persistence**: Games are saved in Redis and can be resumed
- **Time Controls**: Built-in chess timer with time tracking for both players
- **Move Validation**: Server-side move validation and game state management
- **Game History**: Complete move history stored in algebraic notation
- **Reconnection Support**: Players can reconnect to existing games

### Chess Rules Engine
Complete implementation of chess rules including:
- **Standard Moves**: All piece movements according to official chess rules
- **Special Moves**: 
  - Castling (both kingside and queenside)
  - En passant captures
  - Pawn promotion with piece selection
- **Game States**: 
  - Check and checkmate detection
  - Stalemate detection
  - Draw conditions and game endings
- **Move Highlighting**: Visual feedback for valid moves and piece threats

### User Experience
- **Interactive Board**: Intuitive drag-and-drop piece movement
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Updates**: Instant board synchronization between players
- **Game Controls**: Resign, offer draws, and request rematches

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework with hooks
- **TypeScript** - Type-safe JavaScript for better development experience
- **Socket.io Client** - Real-time bidirectional communication
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React Router** - Client-side routing and navigation
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Socket.io** - Real-time WebSocket communication
- **TypeScript** - Type-safe server-side development
- **CORS** - Cross-Origin Resource Sharing middleware

## 🔌 Socket Events

### Client → Server Events
```typescript
// Game Management
'create-game'              // Create a new game
// Parameters: { userId, gameId, color, time }

'join-game'               // Join an existing game
// Parameters: { userId, gameId }

'check-for-existing-game' // Check if player has an existing game
// Parameters: { userId, gameId }

// Game Actions
'move'                    // Send a chess move with game state
// Parameters: { userId, gameId, move, whiteTime, blackTime, currentTurn, isDraw, isStalemate, winningTeam }

'game-over'               // Notify game has ended
// Parameters: { userId, gameId }

'opponent-resigned'       // Notify opponent has resigned
// Parameters: { userId, gameId }
```

### Server → Client Events
```typescript
// Game Creation & Management
'game-created'            // Game successfully created or joined
// Data: { gameId, color, time }

'game-exists'             // Existing game found for player
// Data: { game object with current state }

'error'                   // Error occurred (invalid game ID, unauthorized, etc.)
// Data: error message string

// Game State Updates
'opponent-move'           // Opponent made a move
// Data: move object { from, to }

'game-ended'              // Game has ended
// Data: none

'opponent-resigned'       // Opponent has resigned
// Data: none
```

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ssonthal/lets-play-chess-2.git
   cd lets-play-chess-2
   ```

2. **Install dependencies**
   
   For the backend:
   ```bash
   cd backend
   npm install
   ```
   
   For the frontend:
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=3000
   REDIS_URL=redis://localhost:6379
   NODE_ENV=development
   ```

4. **Start Redis server** (required for game state storage)
   ```bash
   redis-server
   ```

5. **Start the development servers**
   
   Backend (from backend directory):
   ```bash
   node server.js
   ```
   
   Frontend (from frontend directory):
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🎮 How to Play

### Starting a Game
1. **Create Game**: Click "Create Game" and choose your color (white/black)
2. **Set Time Control**: Select time limit for the game
3. **Share Game ID**: Share the generated game ID with your friend
4. **Join Game**: Enter a game ID to join an existing game
5. **Resume Game**: Reconnect to your existing game if disconnected

### Making Moves
- Click on a piece to select it
- Click on a valid square to move the piece
- Valid moves are highlighted in green
- Captures are highlighted in red
- Special moves (castling, en passant) are automatically detected

### Game Controls
- **Resign**: Give up the current game
- **Timer**: Each player has a countdown timer
- **Reconnect**: Resume your game after disconnection
- **Game Status**: View current turn, draw status, and game outcome

## 📁 Project Structure

```
lets-play-chess-2/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Board/      # Chess board components
│   │   │   ├── Game/       # Game logic components
│   │   │   └── UI/         # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── socket/         # Socket.io client setup
│   ├── public/             # Static assets
│   └── package.json
├── backend/                # Node.js backend application
│   ├── server.js           # Main server file with Socket.io events
│   ├── redisClient.js      # Redis database operations
│   └── package.json        # Backend dependencies
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel)
1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `build` folder to your hosting service
3. Set environment variables for production API URL

### Backend (Render)
1. Set up environment variables on your hosting platform:
   ```env
   PORT=3000
   REDIS_URL=your-redis-connection-string
   NODE_ENV=production
   ```
2. Deploy the backend directory
3. Ensure Redis database is configured for production

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Socket.io** for real-time communication
- **React** and **TypeScript** communities
- Chess community for gameplay inspiration

## 🔮 Future Enhancements

### Completed Features
- [x] **Real-time Multiplayer**: Game state synchronization with Redis
- [x] **Time Controls**: Chess timer implementation
- [x] **Game Persistence**: Resume games after disconnection

### Planned Features
- [ ] **AI Opponent**: Computer opponent with different difficulty levels
- [ ] **Tournament System**: Organize and manage chess tournaments
- [ ] **Player Ratings**: ELO-based player ratings and leaderboards
- [ ] **Game Analysis**: Post-game analysis with chess engine
- [ ] **Puzzle Training**: Daily chess puzzles and tactical training
- [ ] **Time Controls**: Support for blitz, rapid, and classical formats
- [ ] **Email Notifications**: Game invites and reminders

### Technical Improvements
- [ ] **Database Integration**: Persistent game storage
- [ ] **User Authentication**: Player accounts and profiles
- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **Advanced AI**: Multiple AI difficulty levels and personalities
- [ ] **Game Database**: Save and replay historical games

## 🐛 Known Issues

- Player disconnection handling could be improved
- Time synchronization may drift on slow connections
- Need better error handling for Redis connection issues
- Game cleanup for abandoned games not implemented

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on [GitHub](https://github.com/ssonthal/lets-play-chess-2/issues)
- Check existing issues for solutions
- Contact the maintainer

---

**Happy Chess Playing! ♟️**

*Built with ❤️ for chess enthusiasts worldwide*
