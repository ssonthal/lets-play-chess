import React from "react";
export default function Tile({variant, image} : {variant: string, image: string}) : React.ReactNode {
        return variant =="black" ? 
        (
            <div className = "w-[100px] h-[100px] bg-[#b58962] grid place-items-center">
                {image && <div className = "chess-piece w-[_100px] h-[_100px] bg-no-repeat bg-center hover:cursor-grab active:cursor-grabbing" style = {{backgroundImage: `url(${image})`}}>
                </div>}
            </div>
        ): 
        (   <div className = "w-[100px] h-[100px] bg-[#ebecd0] grid place-items-center">
                {image && <div className = "chess-piece w-[_100px] h-[_100px] bg-no-repeat bg-center hover:cursor-grab active:cursor-grabbing" style = {{backgroundImage: `url(${image})`}}>
                </div>}
            </div>
        );
}