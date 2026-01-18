"use client";
import { useAppStore } from "@/store/app-store";
import { Bell } from "lucide-react";

export function Header({ title = "Dashboard", subtitle = "Welcome back!" }: { title?: string; subtitle?: string }) {
    const { user } = useAppStore();
    const progress = (user.xp / (user.level * 100)) * 100;
    return (
        <header className="sticky top-0 h-[70px] glass border-b border-white/10 flex items-center px-6 gap-4 z-40">
            <div className="flex-1"><h1 className="text-xl font-semibold">{title}</h1><p className="text-sm text-gray-400">{subtitle}</p></div>
            <div className="flex items-center gap-3 px-4 py-2 bg-background-tertiary rounded-full">
                <div className="relative w-10 h-10">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${progress}, 100`} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{user.level}</span>
                </div>
                <div className="flex flex-col"><span className="text-xs text-gray-500">Level {user.level}</span><span className="text-sm font-semibold text-primary">{user.xp} XP</span></div>
            </div>
            <button className="relative p-2 text-gray-400 hover:text-white"><Bell className="w-6 h-6" /><span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">3</span></button>
        </header>
    );
}
