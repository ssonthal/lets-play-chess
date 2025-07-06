import { TeamType } from "../../Types"

interface EndgameModalProps {
    endgameModalRef: any
    board: any
    restartGame: () => void
    endgameMsg: string
}
export const EndgameModal = ({ endgameModalRef, board, restartGame, endgameMsg }: EndgameModalProps) => {
    return (
        <div className="absolute inset-0 hidden z-50" ref={endgameModalRef}>
            <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-6 sm:py-8 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Game Over</h2>
                        <p className="text-purple-100 text-base sm:text-lg">{endgameMsg}</p>
                    </div>

                    <div className="px-6 py-6">
                        <div className="text-center mb-6">
                            <p className="text-gray-600 text-sm">
                                {board.winningTeam === TeamType.WHITE ? '🤍' : board.winningTeam === TeamType.BLACK ? '⚫' : '🤝'}
                                {' '}Well played! Ready for another game?
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={restartGame}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                            >
                                🎯 Play Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}