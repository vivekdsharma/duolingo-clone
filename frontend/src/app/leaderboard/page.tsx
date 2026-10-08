"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/navigation/Sidebar";
import { TopBar } from "@/components/navigation/TopBar";
import { Trophy, Shield } from "lucide-react";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Player {
  id: number;
  username: string;
  xp: number;
  avatar: string;
  is_user?: boolean;
}

interface UserData {
  streak: number;
  hearts: number;
  gems: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const [boardRes, userRes] = await Promise.all([
          fetch(`${API_BASE}/api/leaderboard`),
          fetch(`${API_BASE}/api/user`),
        ]);
        const boardData = await boardRes.json();
        const userData = await userRes.json();
        setLeaderboard(boardData.leaderboard);
        setUser(userData);
      } catch (err) {
        console.error("Leaderboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <main className="pl-64 flex flex-col min-h-screen">
        <TopBar
          streak={user?.streak || 0}
          hearts={user?.hearts || 0}
          gems={user?.gems || 0}
        />

        <div className="flex-1 max-w-xl mx-auto w-full py-10 px-4">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-3xl bg-[#ffc800]/15 text-[#ffc800] mb-3">
              <Trophy className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-black text-[#4b4b4b]">Gold League</h1>
            <p className="text-sm font-semibold text-[#afafaf] mt-1">
              Top learners advance to the next league
            </p>
          </div>

          <div className="border-2 border-[#e5e5e5] rounded-3xl overflow-hidden divide-y-2 divide-[#e5e5e5]">
            {leaderboard.map((player, index) => {
              const rank = index + 1;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 transition-colors ${
                    player.is_user ? "bg-[#ddf4ff] font-black" : "hover:bg-[#f7f7f7]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-6 text-center font-extrabold text-base ${
                        rank === 1
                          ? "text-[#ffc800]"
                          : rank === 2
                          ? "text-[#afafaf]"
                          : rank === 3
                          ? "text-[#cd7f32]"
                          : "text-[#777777]"
                      }`}
                    >
                      {rank}
                    </span>
                    <span className="text-2xl">{player.avatar}</span>
                    <span className="font-extrabold text-[#4b4b4b] text-base">
                      {player.username} {player.is_user && "(You)"}
                    </span>
                  </div>
                  <span className="text-sm font-black text-[#777777]">{player.xp} XP</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}