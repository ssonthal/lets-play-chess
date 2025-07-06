import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { INITIAL_TIME } from '../Constants';
import { ToastManager } from './UI/ToastManager';
import StartNewGame from './UI/StartNewGameModal';
import { GameCodeModal } from './UI/GameCodeModal';

export default function Landing({ socket, userId }: { socket: Socket, userId: string }) {
    const [gameId, setGameId] = useState('');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const startNewGameModalRef = useRef<HTMLDivElement>(null);
    const gameCodeModalRef = useRef<HTMLDivElement>(null);
    //customization
    const [isAi, setAi] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<string>('b');
    const [selectedTime, setSelectedTime] = useState(INITIAL_TIME);
    const [selectedLevel, setSelectedLevel] = useState<number>(1);

    const navigate = useNavigate();

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth) * 10,
                y: (e.clientY / window.innerHeight) * 10
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        socket.on("game-created", ({ gameId, color, time }) => {
            navigate(`/game/${gameId}`, {
                state: {
                    playerColor: color,
                    time: time
                },
            });
        });
        return () => {
            socket.off("game-created");
        };
    }, []);
    const handleStartGame = (() => {
        if (isAi && selectedTeam && selectedTime && selectedLevel) {
            startNewGameModalRef.current?.classList.add("hidden");
            const gameId = uuidv4().slice(0, 7).toUpperCase();
            navigate(`/game/${gameId}`, {
                state: {
                    playerColor: selectedTeam,
                    ai: true,
                    time: selectedTime,
                    level: selectedLevel
                },
            });
        } else if (!isAi && selectedTeam && selectedTime) {
            startNewGameModalRef.current?.classList.add("hidden");
            gameCodeModalRef.current?.classList.remove("hidden");
            const gameId = uuidv4().slice(0, 7).toUpperCase();
            socket.emit("create-game", { userId: userId, gameId: gameId, color: selectedTeam, time: selectedTime });
            setGameId(gameId);
        }
    });

    const handlePlayWithFriends = () => {
        setAi(false);
        startNewGameModalRef.current?.classList.remove("hidden");
    };
    const handlePlayWithAI = () => {
        setAi(true);
        startNewGameModalRef.current?.classList.remove("hidden");
    }
    const handleJoinGame = (id: string) => {
        socket.emit("join-game", { userId: userId, gameId: id });
    };
    return (
        <div>
            <ToastManager socket={socket} />
            <StartNewGame selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} selectedTime={selectedTime} setSelectedTime={setSelectedTime} selectedLevel={selectedLevel} setLevel={setSelectedLevel} isAi={isAi} startNewGameModalRef={startNewGameModalRef} handleStartGame={handleStartGame} />
            <GameCodeModal gameCodeModalRef={gameCodeModalRef} gameCode={gameId} />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`
                        }}>
                    </div>
                </div>

                {/* Floating Chess Pieces - Hidden on mobile for performance */}
                <div className="fixed inset-0 pointer-events-none hidden md:block">
                    <div
                        className="absolute top-20 left-10 text-4xl lg:text-6xl opacity-20 text-white transition-transform duration-1000 ease-out animate-pulse"
                        style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
                    >
                        ♛
                    </div>
                    <div
                        className="absolute top-40 right-20 text-3xl lg:text-5xl opacity-20 text-white transition-transform duration-1000 ease-out animate-pulse"
                        style={{
                            transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
                            animationDelay: '2s'
                        }}
                    >
                        ♞
                    </div>
                    <div
                        className="absolute bottom-32 left-1/4 text-5xl lg:text-7xl opacity-20 text-white transition-transform duration-1000 ease-out animate-pulse"
                        style={{
                            transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
                            animationDelay: '4s'
                        }}
                    >
                        ♜
                    </div>
                    <div
                        className="absolute bottom-20 right-1/3 text-2xl lg:text-4xl opacity-20 text-white transition-transform duration-1000 ease-out animate-pulse"
                        style={{
                            transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)`,
                            animationDelay: '1s'
                        }}
                    >
                        ♝
                    </div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {/* Header */}
                    <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fade-in">
                        <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-0 sm:mr-4 shadow-2xl animate-bounce">
                                <span className="text-2xl sm:text-3xl">♚</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent text-center sm:text-left">
                                Let's Play Chess
                            </h1>
                        </div>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-xs sm:max-w-md lg:max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                            Experience the ultimate online chess platform. Play against friends, challenge strangers, and master the game of kings.
                        </p>
                    </div>

                    {/* Main Action Card */}
                    <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-700 max-w-sm sm:max-w-md w-full mx-4 sm:mx-0 transform hover:scale-105 transition-all duration-300">
                        <div className="space-y-4 sm:space-y-6">
                            {/* Play With Friends Button*/}
                            <button
                                onClick={handlePlayWithFriends}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 text-base sm:text-lg shadow-lg hover:shadow-purple-500/25 hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
                            >
                                <span className="flex items-center justify-center">
                                    Play With Friends
                                </span>
                            </button>

                            {/* Play with AI */}
                            <button
                                onClick={handlePlayWithAI}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 text-base sm:text-lg shadow-lg hover:shadow-purple-500/25 hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
                            >
                                <span className="flex items-center justify-center">
                                    Play With AI
                                </span>
                            </button>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-600"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-transparent text-gray-400 font-medium">or</span>
                                </div>
                            </div>

                            {/* Join Game Section */}
                            <div className="space-y-3 sm:space-y-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Join Existing Game
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter Game ID (e.g. ABC123)"
                                        value={gameId}
                                        onChange={(e) => setGameId(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleJoinGame((e.target as HTMLInputElement).value);
                                        }}
                                        className="w-full bg-gray-800 bg-opacity-50 border border-gray-600 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-center font-mono tracking-wider focus:bg-opacity-70 text-sm sm:text-base"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 text-center">Press Enter to join the game</p>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 max-w-xs sm:max-w-2xl lg:max-w-4xl w-full px-4 sm:px-0">
                        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:transform hover:scale-105 sm:col-span-1 lg:col-span-1">
                            <div className="text-purple-400 text-2xl sm:text-3xl mb-3 sm:mb-4">⚡</div>
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Lightning Fast</h3>
                            <p className="text-gray-400 text-xs sm:text-sm">Real-time gameplay with instant moves and seamless synchronization.</p>
                        </div>
                        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105 sm:col-span-1 lg:col-span-1">
                            <div className="text-blue-400 text-2xl sm:text-3xl mb-3 sm:mb-4">🌐</div>
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Play Anywhere</h3>
                            <p className="text-gray-400 text-xs sm:text-sm">Cross-platform support. Play on desktop, tablet, or mobile.</p>
                        </div>
                        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 hover:border-pink-500 transition-all duration-300 hover:transform hover:scale-105 sm:col-span-2 lg:col-span-1">
                            <div className="text-pink-400 text-2xl sm:text-3xl mb-3 sm:mb-4">🏆</div>
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Competitive</h3>
                            <p className="text-gray-400 text-xs sm:text-sm">Challenge friends or face random opponents worldwide.</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 sm:mt-16 text-center px-4">
                        <p className="text-gray-500 text-sm animate-pulse">
                            Ready to make your move? Start playing now!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}