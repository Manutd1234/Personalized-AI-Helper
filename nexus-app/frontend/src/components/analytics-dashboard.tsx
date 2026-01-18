"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

type Period = "day" | "week" | "month";

export function AnalyticsDashboard() {
    const [period, setPeriod] = useState<Period>("week");
    const { sessions, getWeeklyStats, getSubjectDistribution } = useAppStore();

    const filterSessions = (p: Period) => {
        const now = new Date();
        return sessions.filter((s) => {
            const sessionDate = new Date(s.timestamp);
            if (p === "day") return sessionDate.toDateString() === now.toDateString();
            if (p === "week") {
                const weekAgo = new Date(now);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return sessionDate >= weekAgo;
            }
            if (p === "month") {
                const monthAgo = new Date(now);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return sessionDate >= monthAgo;
            }
            return true;
        });
    };

    const filteredSessions = filterSessions(period);
    const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalSessions = filteredSessions.length;
    const avgLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    const totalXp = filteredSessions.reduce((acc, s) => acc + s.xpEarned, 0);

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    // Weekly Stats Chart
    const weeklyStats = getWeeklyStats();
    const weeklyChartData = {
        labels: weeklyStats.map((w) => `Week ${w.weekNumber}`),
        datasets: [
            {
                label: "Focus Hours",
                data: weeklyStats.map((w) => Math.round((w.totalMinutes / 60) * 10) / 10),
                borderColor: "#8b5cf6",
                backgroundColor: "rgba(139, 92, 246, 0.1)",
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#8b5cf6",
            },
        ],
    };

    // Subject Distribution Chart
    const subjectDist = getSubjectDistribution();
    const subjectColors = [
        "rgba(139, 92, 246, 0.8)",
        "rgba(6, 182, 212, 0.8)",
        "rgba(16, 185, 129, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(239, 68, 68, 0.8)",
        "rgba(236, 72, 153, 0.8)",
    ];
    const subjectIcons: Record<string, string> = {
        Math: "📐",
        Science: "🔬",
        History: "📚",
        Languages: "🌍",
        "Computer Science": "💻",
        Other: "📝",
    };
    const subjectChartData = {
        labels: Object.keys(subjectDist).map((s) => `${subjectIcons[s] || "📝"} ${s}`),
        datasets: [
            {
                data: Object.values(subjectDist),
                backgroundColor: subjectColors.slice(0, Object.keys(subjectDist).length),
                borderWidth: 0,
            },
        ],
    };

    // Daily Bar Chart
    const getDailyData = () => {
        const now = new Date();
        const days = period === "month" ? 30 : period === "week" ? 7 : 1;
        const labels: string[] = [];
        const data: number[] = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(
                date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).split(",")[0]
            );
            const dayMinutes = sessions
                .filter((s) => new Date(s.timestamp).toDateString() === date.toDateString())
                .reduce((acc, s) => acc + s.durationMinutes, 0);
            data.push(dayMinutes);
        }

        return { labels, data };
    };

    const dailyData = getDailyData();
    const dailyChartData = {
        labels: dailyData.labels,
        datasets: [
            {
                label: "Focus Minutes",
                data: dailyData.data,
                backgroundColor: "rgba(139, 92, 246, 0.6)",
                borderColor: "#8b5cf6",
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    return (
        <div className="space-y-6">
            {/* Period Filter */}
            <div className="flex gap-2">
                {(["day", "week", "month"] as Period[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${period === p
                                ? "bg-gradient-to-r from-primary to-secondary text-white"
                                : "bg-background-secondary text-gray-400 hover:text-white"
                            }`}
                    >
                        {p === "day" ? "Today" : p === "week" ? "This Week" : "This Month"}
                    </button>
                ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6">
                    <p className="text-gray-400 text-sm mb-1">Total Focus</p>
                    <p className="text-3xl font-bold">{formatDuration(totalMinutes)}</p>
                </div>
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6">
                    <p className="text-gray-400 text-sm mb-1">Sessions</p>
                    <p className="text-3xl font-bold">{totalSessions}</p>
                </div>
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6">
                    <p className="text-gray-400 text-sm mb-1">Avg Length</p>
                    <p className="text-3xl font-bold">{avgLength}m</p>
                </div>
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6">
                    <p className="text-gray-400 text-sm mb-1">XP Earned</p>
                    <p className="text-3xl font-bold text-primary">{totalXp}</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-2 gap-6">
                {/* Weekly Growth Chart */}
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Weekly Growth</h3>
                    <div className="h-64">
                        <Line
                            data={weeklyChartData}
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

                {/* Subject Distribution */}
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Time by Subject</h3>
                    <div className="h-64">
                        {Object.keys(subjectDist).length > 0 ? (
                            <Doughnut
                                data={subjectChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: "bottom",
                                            labels: { color: "#a0a0b0", padding: 15 },
                                        },
                                    },
                                }}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                Complete some sessions to see data
                            </div>
                        )}
                    </div>
                </div>

                {/* Daily Focus Trend */}
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Focus Trend</h3>
                    <div className="h-64">
                        <Bar
                            data={dailyChartData}
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

                {/* Recent Sessions */}
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {filteredSessions.length > 0 ? (
                            filteredSessions.slice(-10).reverse().map((s) => (
                                <div key={s.id} className="flex items-center gap-3 p-3 bg-background-tertiary rounded-xl">
                                    <span className="text-2xl">{subjectIcons[s.subject] || "📝"}</span>
                                    <div className="flex-1">
                                        <p className="font-medium">{s.subject}</p>
                                        <p className="text-sm text-gray-400">
                                            {new Date(s.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className="text-primary font-semibold">{s.durationMinutes}m</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                No sessions in this period
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
