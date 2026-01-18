"use client";

import { useState } from "react";
import { useAppStore, Habit } from "@/store/app-store";
import { Header } from "@/components/header";
import { Plus, Check, X } from "lucide-react";
import { showToast } from "@/components/toast-provider";

export default function HabitsPage() {
    const { habits, addHabit, toggleHabit } = useAppStore();
    const [showModal, setShowModal] = useState(false);
    const [newHabit, setNewHabit] = useState({ name: "", icon: "📚" });

    const today = new Date().toDateString();

    const handleAddHabit = () => {
        if (!newHabit.name.trim()) {
            showToast("Please enter a habit name", "warning");
            return;
        }
        addHabit(newHabit);
        setShowModal(false);
        setNewHabit({ name: "", icon: "📚" });
        showToast("Habit added! Start building your streak 🔥", "success");
    };

    const handleToggle = (id: string) => {
        const habit = habits.find((h) => h.id === id);
        if (habit && !habit.completedDates.includes(today)) {
            showToast(`Habit completed! +15 XP 🔥 ${habit.streak + 1} day streak!`, "success");
        }
        toggleHabit(id);
    };

    const icons = ["📚", "💪", "🧘", "💧", "🏃", "✍️", "🎯", "🌟", "🎵", "🧠"];

    // Calendar for last 28 days
    const getCalendarDays = () => {
        const days = [];
        const now = new Date();
        for (let i = 27; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            days.push(date);
        }
        return days;
    };

    const calendarDays = getCalendarDays();

    return (
        <>
            <Header title="Habits" subtitle="Build consistency, one day at a time." />
            <div className="p-6 grid grid-cols-2 gap-6">
                {/* Habits List */}
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Daily Habits</h3>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Habit
                        </button>
                    </div>

                    <div className="space-y-3">
                        {habits.length > 0 ? (
                            habits.map((habit) => {
                                const todayCompleted = habit.completedDates.includes(today);
                                return (
                                    <div key={habit.id} className="flex items-center gap-4 p-4 bg-background-tertiary rounded-xl">
                                        <span className="text-3xl">{habit.icon}</span>
                                        <div className="flex-1">
                                            <p className="font-medium">{habit.name}</p>
                                            <p className="text-sm text-orange-400">🔥 {habit.streak} day streak</p>
                                        </div>
                                        <button
                                            onClick={() => handleToggle(habit.id)}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${todayCompleted
                                                    ? "bg-tertiary text-white"
                                                    : "bg-background-secondary border border-white/20 hover:border-tertiary"
                                                }`}
                                        >
                                            <Check className="w-6 h-6" />
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-gray-400 py-12">
                                No habits yet. Start building good habits!
                            </div>
                        )}
                    </div>
                </div>

                {/* Habit Streaks Calendar */}
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-6">Habit Streaks</h3>
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((date, i) => {
                            const dateStr = date.toDateString();
                            const isToday = dateStr === today;
                            const anyCompleted = habits.some((h) => h.completedDates.includes(dateStr));
                            return (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${anyCompleted
                                            ? "bg-tertiary text-white"
                                            : isToday
                                                ? "bg-primary/20 text-primary border border-primary/50"
                                                : "bg-background-tertiary text-gray-400"
                                        }`}
                                >
                                    {date.getDate()}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-tertiary" />
                            <span className="text-gray-400">Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-background-tertiary" />
                            <span className="text-gray-400">Incomplete</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Habit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-background-secondary border border-white/10 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold">Add New Habit</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Habit Name</label>
                                <input
                                    type="text"
                                    value={newHabit.name}
                                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                                    placeholder="e.g., Read 20 pages"
                                    className="w-full px-4 py-3 bg-background-tertiary border border-white/10 rounded-xl focus:outline-none focus:border-primary"
                                    onKeyPress={(e) => e.key === "Enter" && handleAddHabit()}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
                                <div className="flex flex-wrap gap-2">
                                    {icons.map((icon) => (
                                        <button
                                            key={icon}
                                            onClick={() => setNewHabit({ ...newHabit, icon })}
                                            className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${newHabit.icon === icon
                                                    ? "bg-primary"
                                                    : "bg-background-tertiary hover:bg-white/10"
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-4 border-t border-white/10">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 bg-background-tertiary rounded-xl font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddHabit}
                                className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium"
                            >
                                Add Habit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
