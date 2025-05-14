import React from "react";
export default function Tile({ image, number, highlight }: { image: string | undefined, number: number, highlight: boolean }): React.ReactNode {
    return number % 2 == 0 ?
        (
            <div className="w-[100px] h-[100px] bg-[#b58962] grid place-items-center">
                {!highlight && image && <div className="chess-piece w-[_100px] h-[_100px] bg-no-repeat bg-center hover:cursor-grab active:cursor-grabbing" style={{ backgroundImage: `url(${image})` }}>
                </div>}
                {highlight && !image && <div className="absolute w-[_24px] h-[_24px] bg-[rgba(0,0,0,0.4)] rounded-full"></div>}
                {highlight && image &&
                    <div>
                        <div className="absolute w-[_100px] h-[_100px] border-5 border-[rgba(0,0,0,0.4)] border-solid rounded-full"></div>
                        <div className="chess-piece w-[_100px] h-[_100px] bg-no-repeat bg-center hover:cursor-grab active:cursor-grabbing" style={{ backgroundImage: `url(${image})` }}></div>
                    </div>}
            </div >
        ) :
        (<div className="w-[100px] h-[100px] bg-[#ebecd0] grid place-items-center">
            {image && !highlight && <div className="chess-piece w-[_100px] h-[_100px] bg-no-repeat bg-center hover:cursor-grab active:cursor-grabbing" style={{ backgroundImage: `url(${image})` }}>
            </div>}
            {highlight && !image && <div className="absolute w-[_24px] h-[_24px] bg-[rgba(0,0,0,0.4)] rounded-full"></div>}
            {highlight && image &&
                <div>
                    <div className="absolute w-[_100px] h-[_100px] border-5 border-[rgba(0,0,0,0.4)] border-solid rounded-full"></div>
                    <div className="chess-piece w-[_100px] h-[_100px] bg-no-repeat bg-center hover:cursor-grab active:cursor-grabbing" style={{ backgroundImage: `url(${image})` }}></div>
                </div>}
        </div>
        );
}