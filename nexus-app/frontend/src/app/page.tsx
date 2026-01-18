"use client";

import { useAppStore } from "@/store/app-store";
import { Clock, CheckSquare, Zap, Star, Play, Bot } from "lucide-react";
import Link from "next/link";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
    const { user, timer, tasks, sessions, studyPlan, setTimerSubject } = useAppStore();

    const getTodayStats = () => {
        const today = new Date().toDateString();
        const todaySessions = sessions.filter((s) => new Date(s.timestamp).toDateString() === today);
        return {
            sessions: todaySessions.length,
            minutes: todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0),
        };
    };

    const todayStats = getTodayStats();
    const completedTasks = tasks.filter((t) => t.completed).length;

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Weekly chart data
    const getWeeklyData = () => {
        const today = new Date();
        const labels: string[] = [];
        const data: number[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));
            const dayMinutes = sessions
                .filter((s) => new Date(s.timestamp).toDateString() === date.toDateString())
                .reduce((acc, s) => acc + s.durationMinutes, 0);
            data.push(Math.round((dayMinutes / 60) * 10) / 10);
        }
        return { labels, data };
    };

    const weeklyData = getWeeklyData();

    const subjects = [
        { value: "Math", label: "📐 Math" },
        { value: "Science", label: "🔬 Science" },
        { value: "History", label: "📚 History" },
        { value: "Languages", label: "🌍 Languages" },
        { value: "Computer Science", label: "💻 Computer Science" },
        { value: "Other", label: "📝 Other" },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:transform hover:-translate-y-1 hover:shadow-lg transition-all">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{formatDuration(todayStats.minutes)}</p>
                        <p className="text-sm text-gray-400">Focus Today</p>
                    </div>
                </div>

                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:transform hover:-translate-y-1 hover:shadow-lg transition-all">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-tertiary to-secondary flex items-center justify-center">
                        <CheckSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{completedTasks}/{tasks.length}</p>
                        <p className="text-sm text-gray-400">Tasks Done</p>
                    </div>
                </div>

                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:transform hover:-translate-y-1 hover:shadow-lg transition-all">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{user.streak} days</p>
                        <p className="text-sm text-gray-400">Current Streak</p>
                    </div>
                </div>

                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6 flex items-center gap-4 hover:transform hover:-translate-y-1 hover:shadow-lg transition-all">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-primary flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{todayStats.sessions}</p>
                        <p className="text-sm text-gray-400">Sessions Today</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Quick Focus */}
                <div className="col-span-6 bg-background-secondary border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Quick Focus</h3>
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">Start Session</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="w-32 h-32 rounded-full border-4 border-primary flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                            <span className="text-3xl font-bold tabular-nums">{formatTime(timer.timeLeft)}</span>
                        </div>
                        <div className="flex-1 space-y-4">
                            <select
                                value={timer.subject}
                                onChange={(e) => setTimerSubject(e.target.value)}
                                className="w-full px-4 py-3 bg-background-tertiary border border-white/10 rounded-xl"
                            >
                                {subjects.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            <Link
                                href="/focus"
                                className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-semibold flex items-center justify-center gap-2 animate-glow"
                            >
                                <Play className="w-5 h-5" />
                                Start Focus
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Today's Tasks Preview */}
                <div className="col-span-6 bg-background-secondary border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Today's Tasks</h3>
                        <Link href="/tasks" className="text-sm text-gray-400 hover:text-white">View All</Link>
                    </div>
                    <div className="space-y-3">
                        {tasks.filter((t) => !t.completed).slice(0, 3).length > 0 ? (
                            tasks.filter((t) => !t.completed).slice(0, 3).map((task) => (
                                <div key={task.id} className="flex items-center gap-3 p-3 bg-background-tertiary rounded-xl">
                                    <span className={`w-2 h-2 rounded-full ${task.priority === "high" ? "bg-red-500" : task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                                        }`} />
                                    <span className="flex-1 truncate">{task.title}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                No active tasks. Well done! 🎉
                            </div>
                        )}
                    </div>
                </div>

                {/* Study Plan Preview */}
                <div className="col-span-5 bg-background-secondary border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Your Study Plan</h3>
                        <Link href="/ai" className="text-sm text-gray-400 hover:text-white">Update Plan</Link>
                    </div>
                    {studyPlan.length > 0 ? (
                        <div className="space-y-3">
                            {studyPlan.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm text-gray-400">{item.duration}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Bot className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 mb-4">Chat with AI to create your personalized study plan</p>
                            <Link href="/ai" className="px-4 py-2 bg-background-tertiary rounded-xl text-sm hover:bg-white/10">
                                Start Planning
                            </Link>
                        </div>
                    )}
                </div>

                {/* Weekly Progress Chart */}
                <div className="col-span-7 bg-background-secondary border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Weekly Progress</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="w-3 h-3 rounded-full bg-primary" />
                            Focus Hours
                        </div>
                    </div>
                    <div className="h-48">
                        <Line
                            data={{
                                labels: weeklyData.labels,
                                datasets: [
                                    {
                                        label: "Focus Hours",
                                        data: weeklyData.data,
                                        borderColor: "#8b5cf6",
                                        backgroundColor: "rgba(139, 92, 246, 0.1)",
                                        fill: true,
                                        tension: 0.4,
                                        pointBackgroundColor: "#8b5cf6",
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: "rgba(255,255,255,0.05)" },
                                        ticks: { color: "#a0a0b0" },
                                    },
                                    x: {
                                        grid: { display: false },
                                        ticks: { color: "#a0a0b0" },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
