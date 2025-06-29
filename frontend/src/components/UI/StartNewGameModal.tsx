import { useState } from 'react';
import { Crown, Clock, Zap, User, Bot, ChevronDown } from 'lucide-react';

interface StartNewGameModalProps {
    selectedTeam: string;
    setSelectedTeam: (team: string) => void;
    selectedTime: number;
    setSelectedTime: (time: number) => void;
    selectedLevel: number;
    setLevel: (level: number) => void;
    isAi: boolean;
    startNewGameModalRef: any;
    handleStartGame: () => void;
}
const StartNewGame = ({ selectedTeam, setSelectedTeam, selectedTime, setSelectedTime, selectedLevel, setLevel, isAi, startNewGameModalRef, handleStartGame }: StartNewGameModalProps) => {
    const [showTimeDropdown, setShowTimeDropdown] = useState(false);
    const [showLevelDropdown, setShowLevelDropdown] = useState(false);
    const timeOptions = [
        { value: 60, label: '1 min', icon: '⚡' },
        { value: 180, label: '3 min', icon: '🔥' },
        { value: 300, label: '5 min', icon: '⏱️' },
        { value: 600, label: '10 min', icon: '⏰' },
        { value: 900, label: '15 min', icon: '🕐' },
        { value: 1800, label: '30 min', icon: '⌛' }
    ];

    const levelOptions = [
        { value: 1, label: 'Beginner', description: 'Perfect for learning', color: 'text-green-400' },
        { value: 2, label: 'Intermediate', description: 'Moderate challenge', color: 'text-yellow-400' },
        { value: 3, label: 'Advanced', description: 'Tough opponent', color: 'text-orange-400' },
        { value: 4, label: 'Expert', description: 'Master level', color: 'text-red-400' },
        { value: 5, label: 'Grandmaster', description: 'Ultimate challenge', color: 'text-purple-400' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 hidden" ref={startNewGameModalRef}>
            <div
                className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-purple-500/30 shadow-2xl"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4">
                        {isAi ? <Bot className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isAi ? 'Play with AI' : 'Play with Friends'}
                    </h2>
                    <p className="text-gray-300 text-sm">
                        {isAi ? 'Challenge our AI and improve your skills' : `Challenge your friends and have fun!`}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Team Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Choose Your Side</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setSelectedTeam('w')}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${selectedTeam === 'w'
                                    ? 'border-purple-500 bg-purple-500/20 text-white'
                                    : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-300"></div>
                                    <span className="font-medium">White</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setSelectedTeam('b')}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${selectedTeam === 'b'
                                    ? 'border-purple-500 bg-purple-500/20 text-white'
                                    : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-6 h-6 bg-gray-800 rounded-full border-2 border-gray-600"></div>
                                    <span className="font-medium">Black</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Time Control */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Time Control</label>
                        <div className="relative">
                            <button
                                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                                className="w-full p-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white flex items-center justify-between hover:border-purple-500 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <Clock className="w-5 h-5 text-purple-400" />
                                    <span>{timeOptions.find(t => t.value === selectedTime)?.label} per player</span>
                                </div>
                                <ChevronDown className={`w-5 h-5 transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showTimeDropdown && (
                                <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-600 rounded-xl overflow-hidden z-10">
                                    {timeOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSelectedTime(option.value);
                                                setShowTimeDropdown(false);
                                            }}
                                            className="w-full p-3 text-left hover:bg-purple-500/20 text-white flex items-center space-x-3 transition-colors"
                                        >
                                            <span className="text-lg">{option.icon}</span>
                                            <span>{option.label} per player</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Level Selection */}
                    {isAi && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">AI Difficulty</label>
                            <div className="relative">
                                <button
                                    onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                                    className="w-full p-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white flex items-center justify-between hover:border-purple-500 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Crown className="w-5 h-5 text-yellow-400" />
                                        <div className="text-left">
                                            <div className={levelOptions.find(l => l.value === selectedLevel)?.color}>
                                                {levelOptions.find(l => l.value === selectedLevel)?.label}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {levelOptions.find(l => l.value === selectedLevel)?.description}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 transition-transform ${showLevelDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showLevelDropdown && (
                                    <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-600 rounded-xl overflow-hidden z-10">
                                        {levelOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setLevel(option.value);
                                                    setShowLevelDropdown(false);
                                                }}
                                                className="w-full p-4 text-left hover:bg-purple-500/20 transition-colors"
                                            >
                                                <div className={`font-medium ${option.color}`}>
                                                    {option.label}
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    {option.description}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Start Game Button */}
                    <button
                        onClick={handleStartGame}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                        <Zap className="w-5 h-5" />
                        <span>Start Game</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StartNewGame;