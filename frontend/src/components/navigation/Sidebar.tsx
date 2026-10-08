"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Trophy, User } from "lucide-react";

export const Sidebar = () => {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Learn", icon: BookOpen },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <aside className="w-64 border-r-2 border-[#e5e5e5] min-h-screen p-4 flex flex-col justify-between fixed left-0 top-0 bg-white z-20">
      <div>
        <div className="px-4 py-6">
          <h1 className="text-3xl font-extrabold text-[#58cc02] tracking-tighter">
            duolingo
          </h1>
        </div>
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm tracking-wide uppercase transition-all border-2 ${
                  isActive
                    ? "border-[#84d8ff] bg-[#ddf4ff] text-[#1cb0f6]"
                    : "border-transparent text-[#777777] hover:bg-[#f7f7f7]"
                }`}
              >
                <Icon className="w-6 h-6 stroke-[2.5]" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t-2 border-[#e5e5e5] text-xs text-[#afafaf] font-semibold">
        SDE Clone Assignment
      </div>
    </aside>
  );
};