"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/navigation/Sidebar";
import { TopBar } from "@/components/navigation/TopBar";
import { PathNode } from "@/components/path/PathNode";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface LessonItem {
  id: number;
  title: string;
  order_index: number;
  base_xp: number;
  status: "LOCKED" | "AVAILABLE" | "COMPLETED";
}

interface UnitItem {
  id: number;
  title: string;
  description: string;
  lessons: LessonItem[];
}

interface UserData {
  username: string;
  xp: number;
  streak: number;
  hearts: number;
  gems: number;
}

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null);
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, pathRes] = await Promise.all([
          fetch("${API_BASE}/api/user"),
          fetch("${API_BASE}/api/path"),
        ]);
        const userData = await userRes.json();
        const pathData = await pathRes.json();
        setUser(userData);
        setUnits(pathData.units);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen font-extrabold text-[#58cc02] text-xl">
        Loading Duolingo...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <main className="pl-64 flex flex-col min-h-screen">
        <TopBar
          streak={user?.streak || 0}
          hearts={user?.hearts || 0}
          gems={user?.gems || 0}
        />

        <div className="flex-1 max-w-2xl mx-auto w-full py-8 px-4 flex flex-col items-center">
          {units.map((unit) => (
            <div key={unit.id} className="w-full flex flex-col items-center mb-12">
              {/* Unit Banner */}
              <div className="w-full bg-[#58cc02] text-white p-5 rounded-2xl mb-8 shadow-sm">
                <h2 className="text-xl font-extrabold">{unit.title}</h2>
                <p className="text-sm font-semibold text-[#e1f7cf] mt-1">
                  {unit.description}
                </p>
              </div>

              {/* Lesson Path Nodes */}
              <div className="flex flex-col items-center">
                {unit.lessons.map((lesson, idx) => (
                  <PathNode
                    key={lesson.id}
                    id={lesson.id}
                    index={idx}
                    title={lesson.title}
                    status={lesson.status}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}