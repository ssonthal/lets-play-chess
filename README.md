# Let's Play Chess

A modern, full-stack chess application that allows players to enjoy chess games online with real-time multiplayer functionality. Built with React, TypeScript, and Socket.io for seamless real-time gaming experience.

## 🎯 Features

### Core Gameplay
- **Real-time Multiplayer**: Play chess with friends in real-time using WebSocket connections
- **Game Rooms**: Create or join game rooms with unique room codes
- **AI Opponent**: Play against computer with different difficulty levels ✅
- **Spectator Mode**: Watch ongoing games as a spectator
- **Move Validation**: Comprehensive client and server-side move validation
- **Game History**: Track and review move history with full game notation

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
// Room Management
'create-room'     // Create a new game room
'join-room'       // Join an existing room with room code
'leave-room'      // Leave current room

// Game Actions
'make-move'       // Send a chess move
'resign'          // Resign from current game
'offer-draw'      // Offer a draw to opponent
'accept-draw'     // Accept opponent's draw offer
'decline-draw'    // Decline opponent's draw offer
'request-rematch' // Request a rematch after game ends

// Player Status
'player-ready'    // Signal player is ready to start
```

### Server → Client Events
```typescript
// Room Updates
'room-created'    // Room successfully created with room code
'room-joined'     // Successfully joined room
'room-full'       // Room is full, cannot join
'room-not-found'  // Room code doesn't exist
'player-joined'   // Another player joined the room
'player-left'     // Player left the room

// Game State Updates
'game-started'    // Game has begun
'move-made'       // Valid move was executed
'invalid-move'    // Move was rejected with reason
'game-over'       // Game ended (checkmate/stalemate/draw/resign)
'check'           // Player is in check
'checkmate'       // Game ended in checkmate
'stalemate'       // Game ended in stalemate

// Real-time Updates
'board-updated'   // Board state synchronized
'turn-changed'    // Player turn switched
'draw-offered'    // Draw offer received
'draw-accepted'   // Draw offer accepted
'draw-declined'   // Draw offer declined
'rematch-offered' // Rematch offer received
'game-reset'      // New game started (rematch)
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
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the development servers**
   
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
1. **Create Room**: Click "Create Room" to start a new game
2. **Share Code**: Share the generated room code with your friend
3. **Join Room**: Enter a room code to join an existing game
4. **AI Game**: Choose "Play vs AI" for single-player mode

### Making Moves
- Click on a piece to select it
- Click on a valid square to move the piece
- Valid moves are highlighted in green
- Captures are highlighted in red
- Special moves (castling, en passant) are automatically detected

### Game Controls
- **Resign**: Give up the current game
- **Offer Draw**: Propose a draw to your opponent
- **Rematch**: Start a new game with the same opponent

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
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── socket/         # Socket.io event handlers
│   │   ├── game/           # Chess game logic
│   │   ├── ai/             # AI opponent logic
│   │   └── utils/          # Server utilities
│   ├── server.js           # Main server file
│   └── package.json
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
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.com
   ```
2. Deploy the backend directory
3. Ensure proper CORS configuration for production

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
- [x] **AI Opponent**: Computer opponent with different difficulty levels

### Planned Features
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

- Mobile responsiveness could be improved for smaller screens
- Occasional WebSocket reconnection issues on slow networks
- Room codes expire after extended inactivity

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on [GitHub](https://github.com/ssonthal/lets-play-chess-2/issues)
- Check existing issues for solutions
- Contact the maintainer

---

**Happy Chess Playing! ♟️**

*Built with ❤️ for chess enthusiasts worldwide*
