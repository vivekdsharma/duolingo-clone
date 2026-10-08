import React from "react";
import Link from "next/link";
import { Button } from "../Button";
import { HeartCrack, Trophy, Flame } from "lucide-react";

interface CompletionModalProps {
  xpEarned: number;
  streak: number;
}

export const LessonCompleteModal: React.FC<CompletionModalProps> = ({ xpEarned, streak }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-black text-[#ffc800] mb-2">Lesson Complete!</h2>
        <p className="text-sm font-semibold text-[#777777] mb-6">
          You are making great progress!
        </p>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="border-2 border-[#ffc800] bg-[#fff9e6] rounded-2xl p-4 flex flex-col items-center">
            <Trophy className="w-8 h-8 text-[#ffc800] mb-1" />
            <span className="text-xs uppercase font-extrabold text-[#bfa000]">Total XP</span>
            <span className="text-2xl font-black text-[#58cc02]">+{xpEarned}</span>
          </div>
          <div className="border-2 border-[#ff9600] bg-[#fff2e5] rounded-2xl p-4 flex flex-col items-center">
            <Flame className="w-8 h-8 text-[#ff9600] fill-[#ff9600] mb-1" />
            <span className="text-xs uppercase font-extrabold text-[#d97706]">Streak</span>
            <span className="text-2xl font-black text-[#ff9600]">{streak} Days</span>
          </div>
        </div>

        <Link href="/" className="w-full">
          <Button variant="primary" fullWidth>
            Continue to Path
          </Button>
        </Link>
      </div>
    </div>
  );
};

interface OutOfHeartsModalProps {
  onRefill: () => void;
}

export const OutOfHeartsModal: React.FC<OutOfHeartsModalProps> = ({ onRefill }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center">
        <HeartCrack className="w-20 h-20 text-[#ff4b4b] fill-[#ff4b4b] mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-[#4b4b4b] mb-2">You ran out of hearts!</h2>
        <p className="text-sm font-semibold text-[#777777] mb-6">
          Refill your hearts to continue learning.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Button variant="primary" onClick={onRefill} fullWidth>
            Refill Hearts (Free)
          </Button>
          <Link href="/" className="w-full">
            <Button variant="secondary" fullWidth>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};