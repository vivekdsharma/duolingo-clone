import React from "react";
import Link from "next/link";
import { Star, Check, Lock } from "lucide-react";

interface PathNodeProps {
  id: number;
  index: number;
  title: string;
  status: "LOCKED" | "AVAILABLE" | "COMPLETED";
}

// Ye offsets Duolingo jaisa S-curve / snake layout banate hain
const X_OFFSETS = [0, 48, 80, 48, 0, -48, -80, -48];

export const PathNode: React.FC<PathNodeProps> = ({ id, index, title, status }) => {
  const xOffset = X_OFFSETS[index % X_OFFSETS.length];
  const isAvailable = status === "AVAILABLE";
  const isCompleted = status === "COMPLETED";
  const isLocked = status === "LOCKED";

  const renderIcon = () => {
    if (isCompleted) return <Check className="w-8 h-8 stroke-[3] text-white" />;
    if (isAvailable) return <Star className="w-8 h-8 fill-white text-white" />;
    return <Lock className="w-7 h-7 text-[#afafaf]" />;
  };

  const getButtonStyles = () => {
    if (isCompleted) {
      return "bg-[#ffc800] border-[#e5a200] shadow-[0_6px_0_#e5a200]";
    }
    if (isAvailable) {
      return "bg-[#58cc02] border-[#46a302] shadow-[0_6px_0_#46a302] animate-pulse";
    }
    return "bg-[#e5e5e5] border-[#cecece] shadow-[0_6px_0_#cecece] cursor-not-allowed";
  };

  return (
    <div
      className="relative flex flex-col items-center my-6 select-none"
      style={{ transform: `translateX(${xOffset}px)` }}
    >
      {isAvailable && (
        <div className="absolute -top-11 z-10 bg-white border-2 border-[#e5e5e5] font-extrabold text-xs tracking-wider uppercase px-3 py-1.5 rounded-xl shadow-md text-[#58cc02] animate-bounce">
          Start
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-[#e5e5e5] rotate-45" />
        </div>
      )}

      {isLocked ? (
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center border-2 border-b-0 transition-transform ${getButtonStyles()}`}
        >
          {renderIcon()}
        </div>
      ) : (
        <Link href={`/lesson/${id}`}>
          <button
            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 border-b-0 active:translate-y-1 active:shadow-[0_2px_0] transition-all cursor-pointer ${getButtonStyles()}`}
          >
            {renderIcon()}
          </button>
        </Link>
      )}

      <span className="mt-2 text-xs font-bold text-[#777777] max-w-[100px] text-center truncate">
        {title}
      </span>
    </div>
  );
};