"use client";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { showToast } from "./toast-provider";

export function PomodoroTimer() {
    const { timer, startTimer, pauseTimer, resetTimer, decrementTimer, setTimerDuration, setTimerSubject, addSession } = useAppStore();
    const [showCelebration, setShowCelebration] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
    const progress = (timer.timeLeft / timer.duration) * 565.48;

    useEffect(() => {
        if (timer.isRunning) { intervalRef.current = setInterval(decrementTimer, 1000); }
        else if (intervalRef.current) clearInterval(intervalRef.current);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [timer.isRunning, decrementTimer]);

    useEffect(() => {
        if (timer.timeLeft === 0 && timer.isRunning) {
            pauseTimer(); addSession(timer.subject, timer.duration / 60); setShowCelebration(true);
            showToast(`🎉 Session complete! +${(timer.duration / 60) * 2} XP`, "success");
        }
    }, [timer.timeLeft, timer.isRunning]);

    const subjects = [{ value: "Math", label: "📐 Math" }, { value: "Science", label: "🔬 Science" }, { value: "History", label: "📚 History" }, { value: "Languages", label: "🌍 Languages" }, { value: "Computer Science", label: "💻 CS" }, { value: "Other", label: "📝 Other" }];
    const presets = [{ label: "25m", value: 25 }, { label: "50m", value: 50 }, { label: "90m", value: 90 }];

    return (
        <>
            <div className="bg-background-secondary border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-8">
                <select value={timer.subject} onChange={(e) => setTimerSubject(e.target.value)} className="px-6 py-3 bg-background-tertiary border border-white/10 rounded-xl text-lg">
                    {subjects.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <div className="relative w-[300px] h-[300px]">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <circle cx="100" cy="100" r="90" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round" strokeDasharray="565.48" strokeDashoffset={565.48 - progress} className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center"><span className="text-6xl font-bold tabular-nums">{formatTime(timer.timeLeft)}</span></div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={resetTimer} className="w-14 h-14 rounded-full bg-background-tertiary border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"><RotateCcw className="w-6 h-6" /></button>
                    <button onClick={timer.isRunning ? pauseTimer : startTimer} className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white shadow-lg animate-glow">
                        {timer.isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>
                    <button onClick={() => { if (confirm("Skip? No XP.")) resetTimer(); }} className="w-14 h-14 rounded-full bg-background-tertiary border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"><SkipForward className="w-6 h-6" /></button>
                </div>
                <div className="flex gap-3">{presets.map((p) => <button key={p.value} onClick={() => setTimerDuration(p.value)} className={`px-6 py-3 rounded-xl font-medium ${timer.duration === p.value * 60 ? "bg-primary text-white" : "bg-background-tertiary text-gray-400"}`}>{p.label}</button>)}</div>
            </div>
            {showCelebration && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-background-secondary border border-white/10 rounded-2xl p-8 text-center max-w-sm">
                        <div className="text-6xl mb-4">🎉</div><h3 className="text-2xl font-bold mb-2">Session Complete!</h3>
                        <p className="text-3xl font-bold text-primary mb-4">+{(timer.duration / 60) * 2} XP</p>
                        <button onClick={() => { setShowCelebration(false); resetTimer(); }} className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-semibold animate-glow">Awesome!</button>
                    </div>
                </div>
            )}
        </>
    );
}
