import React from "react";
import { Flame, Heart, Gem } from "lucide-react";

interface TopBarProps {
  streak: number;
  hearts: number;
  gems: number;
}

export const TopBar: React.FC<TopBarProps> = ({ streak, hearts, gems }) => {
  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur border-b-2 border-[#e5e5e5] h-16 px-6 flex items-center justify-end gap-6 z-10 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-2 font-extrabold text-[#ff9600]">
        <Flame className="w-6 h-6 fill-[#ff9600]" />
        <span>{streak}</span>
      </div>
      <div className="flex items-center gap-2 font-extrabold text-[#1cb0f6]">
        <Gem className="w-6 h-6 fill-[#1cb0f6]" />
        <span>{gems}</span>
      </div>
      <div className="flex items-center gap-2 font-extrabold text-[#ff4b4b]">
        <Heart className="w-6 h-6 fill-[#ff4b4b]" />
        <span>{hearts}</span>
      </div>
    </header>
  );
};