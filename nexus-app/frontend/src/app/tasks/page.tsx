"use client";

import { useState } from "react";
import { useAppStore, Task } from "@/store/app-store";
import { Header } from "@/components/header";
import { Plus, Play, Trash2, Check, X } from "lucide-react";
import { showToast } from "@/components/toast-provider";
import Link from "next/link";

export default function TasksPage() {
    const { tasks, addTask, toggleTask, deleteTask, setTimerSubject } = useAppStore();
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
    const [showModal, setShowModal] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", subject: "Math", priority: "medium" as Task["priority"] });

    const filteredTasks = tasks.filter((t) => {
        if (filter === "active") return !t.completed;
        if (filter === "completed") return t.completed;
        return true;
    });

    const handleAddTask = () => {
        if (!newTask.title.trim()) {
            showToast("Please enter a task title", "warning");
            return;
        }
        addTask(newTask);
        setShowModal(false);
        setNewTask({ title: "", subject: "Math", priority: "medium" });
        showToast("Task added! 📝", "success");
    };

    const handleToggle = (id: string) => {
        const task = tasks.find((t) => t.id === id);
        toggleTask(id);
        if (task && !task.completed) {
            showToast("Task completed! +10 XP 🎉", "success");
        }
    };

    const subjects = [
        { value: "Math", label: "📐 Math" },
        { value: "Science", label: "🔬 Science" },
        { value: "History", label: "📚 History" },
        { value: "Languages", label: "🌍 Languages" },
        { value: "Computer Science", label: "💻 Computer Science" },
        { value: "Other", label: "📝 Other" },
    ];

    const subjectIcons: Record<string, string> = {
        Math: "📐", Science: "🔬", History: "📚", Languages: "🌍", "Computer Science": "💻", Other: "📝",
    };

    return (
        <>
            <Header title="Tasks" subtitle="Organize your work and stay productive." />
            <div className="p-6">
                <div className="bg-background-secondary border border-white/10 rounded-2xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">To-Do List</h3>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Task
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-6">
                        {(["all", "active", "completed"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl font-medium transition-all ${filter === f
                                        ? "bg-primary text-white"
                                        : "bg-background-tertiary text-gray-400 hover:text-white"
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-3">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`flex items-center gap-4 p-4 bg-background-tertiary rounded-xl transition-all ${task.completed ? "opacity-50" : ""
                                        }`}
                                >
                                    <span
                                        className={`w-3 h-3 rounded-full ${task.priority === "high"
                                                ? "bg-red-500"
                                                : task.priority === "medium"
                                                    ? "bg-yellow-500"
                                                    : "bg-green-500"
                                            }`}
                                    />
                                    <button
                                        onClick={() => handleToggle(task.id)}
                                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${task.completed
                                                ? "bg-primary border-primary text-white"
                                                : "border-gray-500 hover:border-primary"
                                            }`}
                                    >
                                        {task.completed && <Check className="w-4 h-4" />}
                                    </button>
                                    <div className="flex-1">
                                        <p className={`font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</p>
                                        <p className="text-sm text-gray-400">
                                            {subjectIcons[task.subject]} {task.subject}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href="/focus"
                                            onClick={() => setTimerSubject(task.subject)}
                                            className="w-10 h-10 rounded-lg bg-background-secondary flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
                                        >
                                            <Play className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => {
                                                deleteTask(task.id);
                                                showToast("Task deleted", "info");
                                            }}
                                            className="w-10 h-10 rounded-lg bg-background-secondary flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-12">
                                No tasks yet. Add your first task!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Task Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-background-secondary border border-white/10 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold">Add New Task</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Task Title</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="What do you need to do?"
                                    className="w-full px-4 py-3 bg-background-tertiary border border-white/10 rounded-xl focus:outline-none focus:border-primary"
                                    onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                                <select
                                    value={newTask.subject}
                                    onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                                    className="w-full px-4 py-3 bg-background-tertiary border border-white/10 rounded-xl"
                                >
                                    {subjects.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })}
                                    className="w-full px-4 py-3 bg-background-tertiary border border-white/10 rounded-xl"
                                >
                                    <option value="low">🟢 Low</option>
                                    <option value="medium">🟡 Medium</option>
                                    <option value="high">🔴 High</option>
                                </select>
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
                                onClick={handleAddTask}
                                className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium"
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
