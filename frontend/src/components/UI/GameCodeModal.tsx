import { useState } from 'react';
import { Copy, Check, Users, Gamepad2 } from 'lucide-react';

interface GameCodeModalProps {
    gameCode: string;
    gameCodeModalRef: any;
}
export const GameCodeModal = ({ gameCode, gameCodeModalRef }: GameCodeModalProps) => {
    const [copied, setCopied] = useState(false);

    const copyGameCode = async () => {
        try {
            await navigator.clipboard.writeText(gameCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy game code:', err);
        }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 hidden" ref={gameCodeModalRef}>
            <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-purple-500/30 shadow-2xl relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-4 left-4 w-8 h-8 bg-purple-400 rounded-full animate-pulse"></div>
                    <div className="absolute top-12 right-8 w-4 h-4 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                    <div className="absolute bottom-8 left-12 w-6 h-6 bg-pink-400 rounded-full animate-pulse delay-700"></div>
                </div>

                {/* Header */}
                <div className="text-center mb-8 relative">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl mb-6 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Gamepad2 className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Game Ready! 🎉
                    </h2>
                    <p className="text-gray-300 text-lg">
                        Share this code with your opponent
                    </p>
                </div>

                {/* Game Code Section */}
                <div className="mb-8">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 relative overflow-hidden">
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"></div>

                        <div className="relative">
                            <div className="flex items-center justify-center mb-3">
                                <Users className="w-5 h-5 text-purple-400 mr-2" />
                                <span className="text-sm text-gray-400 font-medium">GAME CODE</span>
                            </div>

                            <div className="text-center">
                                <div className="inline-block bg-gray-900/50 rounded-xl px-6 py-4 border border-gray-700/50">
                                    <code className="text-3xl font-bold text-white tracking-[0.3em] font-mono">
                                        {gameCode}
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mb-6 text-center">
                    <p className="text-gray-400 text-sm leading-relaxed">
                        🎯 Your friend can join by entering this code in the "Join Existing Game" section
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={copyGameCode}
                        className={`flex-1 relative overflow-hidden rounded-xl font-semibold py-4 px-6 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ${copied
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                            }`}
                    >
                        <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity"></div>
                        {copied ? (
                            <>
                                <Check className="w-5 h-5" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-5 h-5" />
                                <span>Copy Code</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Waiting indicator */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center space-x-2 text-gray-400 text-sm">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span>Waiting for opponent...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};