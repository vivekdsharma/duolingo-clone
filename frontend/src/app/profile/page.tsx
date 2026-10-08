"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/navigation/Sidebar";
import { TopBar } from "@/components/navigation/TopBar";
import { Flame, Trophy, Heart, Zap, Award } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  xp: number;
  streak: number;
  hearts: number;
  gems: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("http://localhost:8000/api/user");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Profile load error:", err);
      }
    }
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <main className="pl-64 flex flex-col min-h-screen">
        <TopBar
          streak={profile?.streak || 0}
          hearts={profile?.hearts || 0}
          gems={profile?.gems || 0}
        />

        <div className="flex-1 max-w-2xl mx-auto w-full py-10 px-4">
          <div className="flex items-center gap-6 pb-8 border-b-2 border-[#e5e5e5]">
            <div className="w-24 h-24 rounded-full bg-[#58cc02] text-white flex items-center justify-center text-4xl font-black shadow-inner">
              🦉
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#4b4b4b]">
                {profile?.username || "Learner"}
              </h1>
              <p className="text-sm font-bold text-[#afafaf] mt-1">Joined October 2026</p>
            </div>
          </div>

          <h2 className="text-xl font-black text-[#4b4b4b] mt-8 mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-[#e5e5e5] rounded-2xl p-4 flex items-center gap-4">
              <Flame className="w-8 h-8 text-[#ff9600] fill-[#ff9600]" />
              <div>
                <div className="text-xl font-black text-[#4b4b4b]">{profile?.streak}</div>
                <div className="text-xs font-bold text-[#afafaf] uppercase">Day streak</div>
              </div>
            </div>

            <div className="border-2 border-[#e5e5e5] rounded-2xl p-4 flex items-center gap-4">
              <Zap className="w-8 h-8 text-[#ffc800] fill-[#ffc800]" />
              <div>
                <div className="text-xl font-black text-[#4b4b4b]">{profile?.xp}</div>
                <div className="text-xs font-bold text-[#afafaf] uppercase">Total XP</div>
              </div>
            </div>

            <div className="border-2 border-[#e5e5e5] rounded-2xl p-4 flex items-center gap-4">
              <Heart className="w-8 h-8 text-[#ff4b4b] fill-[#ff4b4b]" />
              <div>
                <div className="text-xl font-black text-[#4b4b4b]">{profile?.hearts} / 5</div>
                <div className="text-xs font-bold text-[#afafaf] uppercase">Current Hearts</div>
              </div>
            </div>

            <div className="border-2 border-[#e5e5e5] rounded-2xl p-4 flex items-center gap-4">
              <Award className="w-8 h-8 text-[#1cb0f6]" />
              <div>
                <div className="text-xl font-black text-[#4b4b4b]">Gold</div>
                <div className="text-xs font-bold text-[#afafaf] uppercase">Current League</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}