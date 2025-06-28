
import { Ref, useState } from 'react';

const CreateGameModal = ({ gameCode, onClose, createGameModalRef }: { gameCode: string, onClose: () => {}, createGameModalRef: Ref<HTMLDivElement> }) => {
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
        <div className="absolute inset-0 hidden z-50" ref={createGameModalRef}>
            {/* Backdrop with blur effect */}
            <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" />

            {/* Modal Container */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">

                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Game Created!</h2>
                        <p className="text-purple-100 text-lg">Share this code with your friend</p>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6">
                        <div className="text-center mb-6">
                            <p className="text-gray-600 text-sm mb-4">
                                🎮 Your game is ready! Share the code below to invite your friend.
                            </p>

                            {/* Game Code Display */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-4 border-2 border-dashed border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Game Code</p>
                                <p className="text-2xl font-bold text-gray-800 tracking-wider font-mono">
                                    {gameCode}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={copyGameCode}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                {copied ? '✅ Copied!' : '📋 Copy Code'}
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold rounded-xl transition-all duration-200 hover:bg-gray-100"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    {/* Decorative bottom border */}
                    <div className="h-1 bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500"></div>
                </div>
            </div>
        </div>
    );
};

export default CreateGameModal;