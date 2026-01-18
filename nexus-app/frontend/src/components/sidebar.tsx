"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Clock, CheckSquare, Sparkles, BarChart3, ShoppingBag, Bot, LogOut, User } from "lucide-react";
import { useAuth } from "./auth-context";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/focus", label: "Focus Timer", icon: Clock },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/habits", label: "Habits", icon: Sparkles },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/ai", label: "AI Coach", icon: Bot },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <aside className="fixed left-0 top-0 w-64 h-screen bg-background-secondary border-r border-white/10 flex flex-col z-50">
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-white">
                            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold gradient-text">Nexus</span>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}>
                            <Icon className="w-5 h-5" /><span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User section */}
            {user && (
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Log out</span>
                    </button>
                </div>
            )}
        </aside>
    );
}
