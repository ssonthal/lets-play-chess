import { useEffect, useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Landing from "./components/Landing";
import GameManager from "./components/GameManager";
import { v4 as uuidv4 } from 'uuid';

export function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userId, setUserId] = useState(localStorage.getItem("letsplayChessGuestUserId") || "");
  useEffect(() => {
    if (!userId) {
      const newUserId = uuidv4();
      localStorage.setItem("letsplayChessGuestUserId", newUserId);
      setUserId(newUserId);
    }
  }, []);
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const newSocket = io(backendUrl);
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  if (!socket) {
    // Could show a loading spinner here
    return <div>Connecting to server...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing socket={socket} userId={userId}/>} />
        <Route path="/game/:gameId" element={<GameManager socket={socket} userId={userId}/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;