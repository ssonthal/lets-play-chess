# Let's Play Chess 2

A modern, full-stack chess application that allows players to enjoy chess games online with real-time multiplayer functionality.

## 🎯 Features

- **Real-time Multiplayer**: Play chess with friends in real-time
- **Game Rooms**: Create or join game rooms with unique room codes
- **Chess Rules Engine**: Complete implementation of chess rules including:
  - Castling (both kingside and queenside)
  - En passant captures
  - Pawn promotion
  - Check and checkmate detection
  - Stalemate detection
- **Move Validation**: Client and server-side move validation
- **Game History**: Track and review move history

## 🛠️ Tech Stack

### Frontend
- **React.js** - User interface framework
- **TypeScript** - Type-safe JavaScript
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **TypeScript** - Type-safe server-side code

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
   cd server
   npm install
   ```
   
   For the frontend:
   ```bash
   cd client
   npm install
   ```

3. **Start the development servers**
   
   Backend (from server directory):
   ```bash
   node server.js
   ```
   
   Frontend (from client directory):
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000


## 🚀 Deployment

### Frontend (Vercel)
1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `build` folder to your hosting service

### Backend (Railway)
1. Set up environment variables on your hosting platform
2. Deploy the server directory
3. Ensure MongoDB connection is configured for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments
- Socket.io for real-time communication

## 📸 Demo
https://github.com/user-attachments/assets/76d37e50-56d5-4976-8ef2-09d84a57fda5

## 🔮 Future Enhancements

- [ ] AI opponent with different difficulty levels
- [ ] Tournament system
- [ ] Player ratings and leaderboards
- [ ] Game analysis with chess engine
- [ ] Puzzle training mode
- [ ] Time controls (blitz, rapid, classical)
- [ ] Email notifications for game invites

---

**Happy Chess Playing! ♟️**
