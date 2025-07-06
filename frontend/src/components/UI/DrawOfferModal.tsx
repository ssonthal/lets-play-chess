import { Dispatch, SetStateAction } from "react";
import { Socket } from "socket.io-client";

interface DrawOfferModalProps {
    drawOfferModalRef: any
    setDrawResponse: Dispatch<SetStateAction<boolean>>
    socket: Socket
    gameId: any
    userId: any
}

export const DrawOfferModal = ({ drawOfferModalRef, setDrawResponse, socket, gameId, userId }: DrawOfferModalProps) => {
    return (
        <div className="absolute inset-0 hidden z-50" ref={drawOfferModalRef}>
            {/* Simple backdrop overlay */}
            <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" />

            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
                    {/* Enhanced header with handshake icon */}
                    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 px-6 py-8 text-center relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent"></div>
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full"></div>
                        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white mb-2">Draw Offer</h2>
                            <p className="text-white/90 text-sm">Your opponent has offered a draw</p>
                        </div>
                    </div>

                    {/* Enhanced body with context */}
                    <div className="px-6 py-8">
                        <div className="text-center mb-6">
                            <p className="text-gray-600 text-sm mb-4">
                                Both players can agree to end the game peacefully with a draw result.
                            </p>
                            <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <span>½ - ½</span>
                                </div>
                                <div className="text-gray-300">•</div>
                                <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <span>Equal result</span>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced buttons with distinct styling */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setDrawResponse(true);
                                    drawOfferModalRef.current.classList.add('hidden');
                                    socket.emit("draw-offer-accepted", { userId: userId, gameId: gameId });
                                }}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-base flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Accept
                            </button>
                            <button
                                onClick={() => {
                                    setDrawResponse(false);
                                    drawOfferModalRef.current.classList.add('hidden');
                                    socket.emit("draw-offer-rejected", { userId: userId, gameId: gameId });
                                }}
                                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-base flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Decline
                            </button>
                        </div>
                    </div>

                    {/* Enhanced bottom accent */}
                    <div className="h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-500 opacity-80"></div>
                </div>
            </div>
        </div>
    )
}