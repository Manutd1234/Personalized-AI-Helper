import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { ToastProvider } from "@/components/toast-provider";
import { AuthProvider } from "@/components/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Nexus - AI-Powered Student Companion",
    description: "Your personalized study companion with Pomodoro timer, gamification, and AI coaching",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-background-primary text-white min-h-screen`}>
                <AuthProvider>
                    <div className="flex">
                        <Sidebar />
                        <main className="flex-1 ml-64 min-h-screen">
                            {children}
                        </main>
                    </div>
                    <ToastProvider />
                </AuthProvider>
            </body>
        </html>
    );
}
