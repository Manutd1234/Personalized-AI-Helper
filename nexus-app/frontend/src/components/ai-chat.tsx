"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore, WeeklyStats } from "@/store/app-store";
import { Send, Sparkles, Target, Lightbulb, TrendingUp } from "lucide-react";
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

// Simulated AI responses (in production, this would call the FastAPI backend)
function getAIResponse(message: string, stats: { weeklyStats: WeeklyStats[]; todayStats: { sessions: number; minutes: number; xp: number }; subjectDist: Record<string, number> }): { content: string; chartData?: WeeklyStats[] } {
    const lower = message.toLowerCase();

    const totalMinutes = stats.weeklyStats.reduce((acc, w) => acc + w.totalMinutes, 0);
    const totalSessions = stats.weeklyStats.reduce((acc, w) => acc + w.sessionCount, 0);
    const avgMinutesPerWeek = Math.round(totalMinutes / Math.max(1, stats.weeklyStats.filter(w => w.totalMinutes > 0).length));

    // Last week vs this week comparison
    const thisWeek = stats.weeklyStats[stats.weeklyStats.length - 1]?.totalMinutes || 0;
    const lastWeek = stats.weeklyStats[stats.weeklyStats.length - 2]?.totalMinutes || 0;
    const growthPercent = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;

    const topSubject = Object.entries(stats.subjectDist).sort((a, b) => b[1] - a[1])[0];

    if (lower.includes("productive") || lower.includes("how was") || lower.includes("week")) {
        return {
            content: `📊 **Your Weekly Productivity Summary**\n\n` +
                `This week you've focused for **${thisWeek} minutes** across your sessions.\n\n` +
                `${thisWeek > lastWeek ? "📈" : "📉"} That's **${Math.abs(growthPercent)}%** ${thisWeek > lastWeek ? "more" : "less"} than last week (${lastWeek} min).\n\n` +
                `🎯 Your most studied subject: **${topSubject ? topSubject[0] : "None yet"}**\n\n` +
                `Today: ${stats.todayStats.sessions} sessions, ${stats.todayStats.minutes} minutes, +${stats.todayStats.xp} XP`,
            chartData: stats.weeklyStats,
        };
    }

    if (lower.includes("growth") || lower.includes("progress") || lower.includes("trend")) {
        return {
            content: `📈 **Your Growth Over Time**\n\n` +
                `Here's your productivity trend over the past ${stats.weeklyStats.length} weeks:\n\n` +
                `• Total focus time: **${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m**\n` +
                `• Total sessions: **${totalSessions}**\n` +
                `• Average per week: **${avgMinutesPerWeek} minutes**\n\n` +
                `${growthPercent > 0 ? "🚀 You're on an upward trend! Keep it up!" : growthPercent === 0 ? "📊 Staying consistent - that's great!" : "💪 Let's work on getting back on track!"}`,
            chartData: stats.weeklyStats,
        };
    }

    if (lower.includes("improving") || lower.includes("am i getting better")) {
        const improving = growthPercent > 0;
        return {
            content: improving
                ? `✨ **Yes, you're improving!**\n\nYour focus time increased by **${growthPercent}%** compared to last week. That's excellent progress!\n\n🎯 Keep up this momentum by:\n1. Maintaining your current study schedule\n2. Trying to add one more session per day\n3. Using the Pomodoro technique consistently`
                : `💪 **Let's get back on track!**\n\nYour focus time decreased by **${Math.abs(growthPercent)}%** this week. That's okay - we all have ups and downs!\n\n🎯 Quick tips to improve:\n1. Start with just a 25-minute session\n2. Set a specific goal for each session\n3. Remove distractions before starting`,
        };
    }

    if (lower.includes("best day") || lower.includes("peak")) {
        return {
            content: `⏰ **Peak Productivity Analysis**\n\nBased on your session history, here are some insights:\n\n` +
                `📊 Your average session length is ${totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 25} minutes.\n\n` +
                `💡 **Tip**: The best time to study is when you feel most alert. For most people, that's:\n• Morning: 9-11 AM\n• Afternoon: 2-4 PM\n\nTry experimenting with different times to find your peak!`,
        };
    }

    if (lower.includes("plan") || lower.includes("exam") || lower.includes("schedule")) {
        return {
            content: `📋 **Personalized Study Plan**\n\nBased on your productivity patterns, here's a suggested plan:\n\n` +
                `**Week 1:** Foundation building\n• Day 1-2: Review fundamentals (2 sessions/day)\n• Day 3-4: Practice problems (3 sessions/day)\n• Day 5: Self-assessment\n\n` +
                `**Week 2:** Deep dive\n• Focus on weak areas identified\n• Daily practice sessions\n• Add one extra session for review\n\n` +
                `💡 Based on your history, aim for ${avgMinutesPerWeek + 30} minutes this week to beat your average!`,
        };
    }

    if (lower.includes("motivation") || lower.includes("unmotivated") || lower.includes("can't focus")) {
        return {
            content: `💪 **You've got this!**\n\nRemember: Every expert was once a beginner. The fact that you're here shows you care about your growth.\n\n` +
                `🎯 Quick motivation tips:\n1. Start with just 5 minutes - that's it!\n2. Celebrate small wins (you've earned ${stats.todayStats.xp} XP today!)\n3. Your future self will thank you\n\n` +
                `"The secret of getting ahead is getting started." - Mark Twain`,
        };
    }

    if (lower.includes("tip") || lower.includes("advice")) {
        const tips = [
            "**💡 Active Recall**: After studying, close your notes and try to write down everything you remember. This can boost retention by up to 50%!",
            "**💡 Spaced Repetition**: Review material at increasing intervals: 1 day, 3 days, 1 week, 2 weeks. This fights the forgetting curve!",
            "**💡 Pomodoro Power**: Work for 25 minutes, then take a 5-minute break. After 4 sessions, take a longer 15-30 minute break.",
            "**💡 Environment Matters**: Find a quiet spot, use headphones, and keep your phone in another room during focus sessions.",
        ];
        return { content: tips[Math.floor(Math.random() * tips.length)] };
    }

    return {
        content: `I understand! Tell me more about what you're studying and I can help create a personalized plan.\n\n` +
            `Try asking me:\n• "How productive was I this week?"\n• "Show me my growth trend"\n• "Am I improving?"\n• "Create a study plan for my exam"\n• "I need motivation"`,
    };
}

export function AIChat() {
    const { chatMessages, addChatMessage, getWeeklyStats, getTodayStats, getSubjectDistribution } = useAppStore();
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput("");
        addChatMessage(userMessage, true);
        setIsTyping(true);

        // Simulate AI thinking delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const stats = {
            weeklyStats: getWeeklyStats(),
            todayStats: getTodayStats(),
            subjectDist: getSubjectDistribution(),
        };

        const response = getAIResponse(userMessage, stats);
        addChatMessage(response.content, false, response.chartData);
        setIsTyping(false);
    };

    const quickActions = [
        { label: "💪 Need Motivation", prompt: "I'm struggling with motivation today" },
        { label: "📋 Break Down Task", prompt: "Can you break down my next task into smaller steps?" },
        { label: "🎯 What's Next?", prompt: "What should I focus on next?" },
        { label: "💡 Quick Tip", prompt: "I need a quick 5-minute study tip" },
        { label: "📈 My Progress", prompt: "Show me my weekly growth trend" },
    ];

    return (
        <div className="flex gap-6 h-[calc(100vh-150px)]">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-background-secondary border border-white/10 rounded-2xl overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Welcome message if no messages */}
                    {chatMessages.length === 0 && (
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-background-tertiary rounded-2xl rounded-tl-md p-4 max-w-[80%]">
                                <p className="mb-2">👋 Hi! I'm your AI Study Coach. I'm here to help you understand your productivity and create personalized study plans.</p>
                                <p>Ask me things like: <strong>"How productive was I this week?"</strong> or <strong>"Show me my growth over time"</strong></p>
                            </div>
                        </div>
                    )}

                    {chatMessages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.isUser ? "flex-row-reverse" : ""}`}>
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isUser
                                        ? "bg-background-tertiary"
                                        : "bg-gradient-to-r from-primary to-secondary"
                                    }`}
                            >
                                {msg.isUser ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                ) : (
                                    <Sparkles className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div
                                className={`rounded-2xl p-4 max-w-[80%] ${msg.isUser
                                        ? "bg-primary text-white rounded-tr-md"
                                        : "bg-background-tertiary rounded-tl-md"
                                    }`}
                            >
                                <div className="whitespace-pre-wrap">{msg.content.split("\n").map((line, i) => (
                                    <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                ))}</div>

                                {/* Chart if available */}
                                {msg.chartData && msg.chartData.length > 0 && (
                                    <div className="mt-4 bg-background-secondary rounded-xl p-4">
                                        <Line
                                            data={{
                                                labels: msg.chartData.map((w) => `W${w.weekNumber}`),
                                                datasets: [
                                                    {
                                                        label: "Focus Minutes",
                                                        data: msg.chartData.map((w) => w.totalMinutes),
                                                        borderColor: "#8b5cf6",
                                                        backgroundColor: "rgba(139, 92, 246, 0.1)",
                                                        fill: true,
                                                        tension: 0.4,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.05)" } },
                                                    x: { grid: { display: false } },
                                                },
                                            }}
                                            height={150}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-background-tertiary rounded-2xl rounded-tl-md p-4">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-white/10 p-4">
                    <div className="flex gap-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask me about your productivity, growth, or study tips..."
                            className="flex-1 bg-background-tertiary border border-white/10 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-primary"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center text-white hover:shadow-lg hover:shadow-primary/30 transition-all"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 space-y-4">
                {/* Quick Actions */}
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-4">
                    <h3 className="font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        {quickActions.map((action) => (
                            <button
                                key={action.prompt}
                                onClick={() => {
                                    setInput(action.prompt);
                                    setTimeout(() => handleSend(), 100);
                                }}
                                className="w-full text-left px-4 py-3 bg-background-tertiary rounded-xl text-sm hover:bg-white/10 transition-all"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Preview */}
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-4">
                    <h3 className="font-semibold mb-4">Today's Stats</h3>
                    <div className="space-y-3">
                        {(() => {
                            const today = getTodayStats();
                            return (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Sessions</span>
                                        <span className="font-semibold">{today.sessions}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Focus Time</span>
                                        <span className="font-semibold">{today.minutes}m</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">XP Earned</span>
                                        <span className="font-semibold text-primary">+{today.xp}</span>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}
