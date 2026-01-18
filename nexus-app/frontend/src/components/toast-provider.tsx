"use client";
import { create } from "zustand";
import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

interface Toast { id: string; message: string; type: "success" | "error" | "warning" | "info"; }
interface ToastStore { toasts: Toast[]; addToast: (msg: string, type?: Toast["type"]) => void; removeToast: (id: string) => void; }

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message, type = "info") => {
        const id = Date.now().toString();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000);
    },
    removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const icons = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };
const colors = {
    success: "bg-green-500/20 border-green-500/50 text-green-400",
    error: "bg-red-500/20 border-red-500/50 text-red-400",
    warning: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
    info: "bg-blue-500/20 border-blue-500/50 text-blue-400",
};

export function ToastProvider() {
    const { toasts, removeToast } = useToastStore();
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => {
                const Icon = icons[toast.type];
                return (
                    <div key={toast.id} onClick={() => removeToast(toast.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm ${colors[toast.type]}`}>
                        <Icon className="w-5 h-5" /><span className="font-medium">{toast.message}</span>
                    </div>
                );
            })}
        </div>
    );
}

export const showToast = (message: string, type?: Toast["type"]) => useToastStore.getState().addToast(message, type);
