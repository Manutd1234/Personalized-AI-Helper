"use client";

import { useAppStore } from "@/store/app-store";
import { Header } from "@/components/header";
import { useState } from "react";
import { showToast } from "@/components/toast-provider";
import { Star, X } from "lucide-react";

const shopItems = [
    { id: "dark_mode", name: "Dark Mode Pro", description: "Enhanced dark theme with deep blacks", icon: "🌙", cost: 100, category: "themes" },
    { id: "gradient_theme", name: "Gradient Theme", description: "Beautiful gradient accents throughout the app", icon: "🌈", cost: 150, category: "themes" },
    { id: "lofi_music", name: "Lo-Fi Radio", description: "Unlock ambient lo-fi music for focus sessions", icon: "🎵", cost: 200, category: "features" },
    { id: "advanced_analytics", name: "Advanced Analytics", description: "Detailed charts and trend analysis", icon: "📊", cost: 250, category: "features" },
    { id: "custom_sounds", name: "Custom Sounds Pack", description: "Additional ambient sounds library", icon: "🔊", cost: 175, category: "features" },
    { id: "streak_freeze", name: "Streak Freeze", description: "Protect your streak for one day", icon: "❄️", cost: 50, category: "boosts" },
    { id: "double_xp", name: "Double XP (1 hour)", description: "Earn double XP for the next hour", icon: "⚡", cost: 75, category: "boosts" },
    { id: "motivation_pack", name: "Motivation Pack", description: "Unlock motivational quotes and tips", icon: "💪", cost: 100, category: "features" },
    { id: "nature_theme", name: "Nature Theme", description: "Calming nature-inspired color palette", icon: "🌿", cost: 125, category: "themes" },
    { id: "focus_badge", name: "Focus Master Badge", description: "Show off your dedication", icon: "🏆", cost: 300, category: "features" },
];

export default function ShopPage() {
    const { user, spendXP } = useAppStore();
    const [category, setCategory] = useState("all");
    const [purchaseModal, setPurchaseModal] = useState<typeof shopItems[0] | null>(null);
    const [ownedItems, setOwnedItems] = useState<string[]>(user.unlockedFeatures);

    const filteredItems = category === "all" ? shopItems : shopItems.filter((i) => i.category === category);

    const handlePurchase = () => {
        if (!purchaseModal) return;
        if (spendXP(purchaseModal.cost)) {
            setOwnedItems([...ownedItems, purchaseModal.id]);
            showToast(`🎉 You unlocked ${purchaseModal.name}!`, "success");
        } else {
            showToast("Not enough XP!", "error");
        }
        setPurchaseModal(null);
    };

    return (
        <>
            <Header title="XP Shop" subtitle="Spend your hard-earned XP!" />
            <div className="p-6">
                {/* XP Display */}
                <div className="mb-6 inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-2xl">
                    <Star className="w-6 h-6 text-primary" />
                    <span className="text-gray-400">Your XP</span>
                    <span className="text-2xl font-bold text-primary">{user.xp}</span>
                </div>

                {/* Categories */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: "all", label: "All Items" },
                        { id: "themes", label: "🎨 Themes" },
                        { id: "features", label: "⚡ Features" },
                        { id: "boosts", label: "🚀 Boosts" },
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${category === cat.id
                                    ? "bg-gradient-to-r from-primary to-secondary text-white"
                                    : "bg-background-secondary text-gray-400 hover:text-white"
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Shop Grid */}
                <div className="grid grid-cols-4 gap-4">
                    {filteredItems.map((item) => {
                        const owned = ownedItems.includes(item.id);
                        const canAfford = user.xp >= item.cost;
                        return (
                            <div
                                key={item.id}
                                className={`bg-background-secondary border rounded-2xl p-6 transition-all ${owned ? "border-tertiary/50 opacity-75" : "border-white/10 hover:border-white/20"
                                    }`}
                            >
                                <span className="text-4xl block mb-3">{item.icon}</span>
                                <h4 className="font-semibold mb-1">{item.name}</h4>
                                <p className="text-sm text-gray-400 mb-4">{item.description}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-primary" />
                                        <span className="font-semibold">{item.cost}</span>
                                    </div>
                                    {owned ? (
                                        <span className="px-3 py-1 bg-tertiary/20 text-tertiary rounded-full text-sm font-medium">
                                            Owned
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => setPurchaseModal(item)}
                                            disabled={!canAfford}
                                            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${canAfford
                                                    ? "bg-gradient-to-r from-primary to-secondary text-white"
                                                    : "bg-background-tertiary text-gray-500 cursor-not-allowed"
                                                }`}
                                        >
                                            {canAfford ? "Buy Now" : "Need More XP"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Purchase Modal */}
            {purchaseModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-background-secondary border border-white/10 rounded-2xl w-full max-w-sm">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold">Confirm Purchase</h3>
                            <button onClick={() => setPurchaseModal(null)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 text-center">
                            <span className="text-6xl block mb-4">{purchaseModal.icon}</span>
                            <h4 className="text-xl font-semibold mb-2">{purchaseModal.name}</h4>
                            <p className="text-gray-400 mb-4">{purchaseModal.description}</p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full">
                                <Star className="w-5 h-5 text-primary" />
                                <span className="font-bold text-primary">{purchaseModal.cost} XP</span>
                            </div>
                        </div>
                        <div className="flex gap-3 p-4 border-t border-white/10">
                            <button
                                onClick={() => setPurchaseModal(null)}
                                className="flex-1 py-3 bg-background-tertiary rounded-xl font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePurchase}
                                className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
