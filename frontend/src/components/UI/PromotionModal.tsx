import { PieceType } from "../../Types"

interface PromotionModalProps {
    promotionModalRef: any
    promotePawn: (type: PieceType) => void
    setPromotionTeam: () => void
}
export const PromotionModal = ({ promotionModalRef, promotePawn, setPromotionTeam }: PromotionModalProps) => {

    return (
        <div className="absolute inset-0 hidden z-40" ref={promotionModalRef}>
            <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="bg-white bg-opacity-85 backdrop-blur-xs rounded-2xl shadow-xl p-4 sm:p-6 border border-white border-opacity-30 w-full max-w-sm sm:max-w-md">
                    <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4 justify-center">
                        {["queen", "rook", "bishop", "knight"].map((type, idx) => (
                            <div
                                key={idx}
                                onClick={() =>
                                    promotePawn(PieceType[type.toUpperCase() as keyof typeof PieceType])
                                }
                                className="group relative flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-70 rounded-xl shadow-md border border-purple-200 border-opacity-50 group-hover:border-purple-400 group-hover:shadow-lg transition-all duration-200 flex items-center justify-center mb-2">
                                    <img
                                        className="w-10 h-10 sm:w-14 sm:h-14 transition-transform duration-200 group-hover:scale-110"
                                        src={`/assets/pieces/${type}_${setPromotionTeam()}.png`}
                                        alt={type}
                                    />
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-gray-700 capitalize group-hover:text-purple-600 transition-colors duration-200">
                                    {type}
                                </span>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity duration-200 pointer-events-none" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}