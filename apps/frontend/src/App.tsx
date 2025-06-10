import { useEffect, useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Landing from "./components/Landing";
import GameManager from "./components/GameManager";

export function App() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    console.log(backendUrl);
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
        <Route path="/" element={<Landing socket={socket} />} />
        <Route path="/game/:gameId" element={<GameManager socket={socket} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;