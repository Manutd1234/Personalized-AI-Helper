"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Session { id: string; subject: string; durationMinutes: number; timestamp: string; completed: boolean; xpEarned: number; }
export interface Task { id: string; title: string; subject: string; priority: "low" | "medium" | "high"; completed: boolean; createdAt: string; }
export interface Habit { id: string; name: string; icon: string; streak: number; completedDates: string[]; createdAt: string; }
export interface StudyPlanItem { title: string; duration: string; completed: boolean; }
export interface WeeklyStats { weekNumber: number; year: number; totalMinutes: number; sessionCount: number; }
interface ChatMessage { id: string; content: string; isUser: boolean; timestamp: string; chartData?: WeeklyStats[]; }

interface User { xp: number; level: number; streak: number; lastActiveDate: string | null; unlockedFeatures: string[]; }
interface TimerState { duration: number; timeLeft: number; isRunning: boolean; subject: string; }

interface AppState {
    user: User; timer: TimerState; tasks: Task[]; habits: Habit[]; sessions: Session[]; studyPlan: StudyPlanItem[]; chatMessages: ChatMessage[]; weeklyStats: WeeklyStats[];
    addXP: (amount: number) => void; spendXP: (amount: number) => boolean; updateStreak: () => void;
    setTimerDuration: (minutes: number) => void; setTimerSubject: (subject: string) => void; startTimer: () => void; pauseTimer: () => void; resetTimer: () => void; decrementTimer: () => void;
    addTask: (task: Omit<Task, "id" | "completed" | "createdAt">) => void; toggleTask: (id: string) => void; deleteTask: (id: string) => void;
    addHabit: (habit: Omit<Habit, "id" | "streak" | "completedDates" | "createdAt">) => void; toggleHabit: (id: string) => void;
    addSession: (subject: string, durationMinutes: number) => void;
    addChatMessage: (content: string, isUser: boolean, chartData?: WeeklyStats[]) => void;
    setStudyPlan: (plan: StudyPlanItem[]) => void;
    getWeeklyStats: () => WeeklyStats[]; getTodayStats: () => { sessions: number; minutes: number; xp: number }; getSubjectDistribution: () => Record<string, number>;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
const getWeekNumber = (date: Date): number => { const start = new Date(date.getFullYear(), 0, 1); return Math.ceil((((date.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7); };

export const useAppStore = create<AppState>()(persist((set, get) => ({
    user: { xp: 0, level: 1, streak: 0, lastActiveDate: null, unlockedFeatures: ["basic_theme"] },
    timer: { duration: 25 * 60, timeLeft: 25 * 60, isRunning: false, subject: "Math" },
    tasks: [], habits: [], sessions: [], studyPlan: [], chatMessages: [], weeklyStats: [],

    addXP: (amount) => set((s) => {
        let xp = s.user.xp + amount, level = s.user.level;
        if (xp >= level * 100) { level++; xp -= (level - 1) * 100; }
        return { user: { ...s.user, xp, level } };
    }),
    spendXP: (amount) => { const s = get(); if (s.user.xp >= amount) { set({ user: { ...s.user, xp: s.user.xp - amount } }); return true; } return false; },
    updateStreak: () => set((s) => {
        const today = new Date().toDateString();
        if (s.user.lastActiveDate !== today) {
            const y = new Date(); y.setDate(y.getDate() - 1);
            return { user: { ...s.user, streak: s.user.lastActiveDate === y.toDateString() ? s.user.streak + 1 : 1, lastActiveDate: today } };
        }
        return s;
    }),

    setTimerDuration: (m) => set((s) => ({ timer: { ...s.timer, duration: m * 60, timeLeft: m * 60 } })),
    setTimerSubject: (subject) => set((s) => ({ timer: { ...s.timer, subject } })),
    startTimer: () => set((s) => ({ timer: { ...s.timer, isRunning: true } })),
    pauseTimer: () => set((s) => ({ timer: { ...s.timer, isRunning: false } })),
    resetTimer: () => set((s) => ({ timer: { ...s.timer, timeLeft: s.timer.duration, isRunning: false } })),
    decrementTimer: () => set((s) => ({ timer: { ...s.timer, timeLeft: Math.max(0, s.timer.timeLeft - 1) } })),

    addTask: (t) => set((s) => ({ tasks: [{ ...t, id: generateId(), completed: false, createdAt: new Date().toISOString() }, ...s.tasks] })),
    toggleTask: (id) => set((s) => { const t = s.tasks.find((x) => x.id === id); if (t && !t.completed) get().addXP(10); return { tasks: s.tasks.map((x) => x.id === id ? { ...x, completed: !x.completed } : x) }; }),
    deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

    addHabit: (h) => set((s) => ({ habits: [{ ...h, id: generateId(), streak: 0, completedDates: [], createdAt: new Date().toISOString() }, ...s.habits] })),
    toggleHabit: (id) => set((s) => {
        const today = new Date().toDateString();
        return {
            habits: s.habits.map((h) => {
                if (h.id !== id) return h;
                const i = h.completedDates.indexOf(today);
                if (i === -1) { get().addXP(15); return { ...h, completedDates: [...h.completedDates, today], streak: h.streak + 1 }; }
                return { ...h, completedDates: h.completedDates.filter((d) => d !== today), streak: Math.max(0, h.streak - 1) };
            })
        };
    }),

    addSession: (subject, durationMinutes) => {
        const xpEarned = durationMinutes * 2;
        const session: Session = { id: generateId(), subject, durationMinutes, timestamp: new Date().toISOString(), completed: true, xpEarned };
        set((s) => {
            const wk = getWeekNumber(new Date()), yr = new Date().getFullYear();
            const idx = s.weeklyStats.findIndex((w) => w.weekNumber === wk && w.year === yr);
            let ws = [...s.weeklyStats];
            if (idx >= 0) ws[idx] = { ...ws[idx], totalMinutes: ws[idx].totalMinutes + durationMinutes, sessionCount: ws[idx].sessionCount + 1 };
            else ws.push({ weekNumber: wk, year: yr, totalMinutes: durationMinutes, sessionCount: 1 });
            return { sessions: [...s.sessions, session], weeklyStats: ws };
        });
        get().addXP(xpEarned); get().updateStreak();
    },

    addChatMessage: (content, isUser, chartData) => set((s) => ({ chatMessages: [...s.chatMessages, { id: generateId(), content, isUser, timestamp: new Date().toISOString(), chartData }] })),
    setStudyPlan: (plan) => set({ studyPlan: plan }),

    getWeeklyStats: () => {
        const s = get(), wk = getWeekNumber(new Date()), yr = new Date().getFullYear(), stats: WeeklyStats[] = [];
        for (let i = 11; i >= 0; i--) { const w = wk - i; const e = s.weeklyStats.find((x) => x.weekNumber === w && x.year === yr); stats.push(e || { weekNumber: w, year: yr, totalMinutes: 0, sessionCount: 0 }); }
        return stats;
    },
    getTodayStats: () => {
        const s = get(), today = new Date().toDateString(), ts = s.sessions.filter((x) => new Date(x.timestamp).toDateString() === today);
        return { sessions: ts.length, minutes: ts.reduce((a, x) => a + x.durationMinutes, 0), xp: ts.reduce((a, x) => a + x.xpEarned, 0) };
    },
    getSubjectDistribution: () => { const d: Record<string, number> = {}; get().sessions.forEach((s) => { d[s.subject] = (d[s.subject] || 0) + s.durationMinutes; }); return d; },
}), { name: "nexus-storage" }));
