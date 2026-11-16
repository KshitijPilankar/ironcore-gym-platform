"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dumbbell, LayoutDashboard, Dumbbell as ExerciseIcon, History, CreditCard, User, LogOut } from "lucide-react";
import { currentGym } from "@/gymConfig";

interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [memberName, setMemberName] = useState<string>("Athlete");

    useEffect(() => {
        try {
            const stored = localStorage.getItem("ironcore_active_member");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed?.name) setMemberName(parsed.name);
            }
        } catch {
            // fallback
        }
    }, [pathname]);

    const handleSignOut = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {
            console.error("Sign out error", e);
        }
        if (typeof window !== "undefined") {
            localStorage.removeItem("ironcore_active_member");
            localStorage.removeItem("ironcore_member_session");
        }
        router.push("/login");
    };

    const navItems: NavItem[] = [
        {
            name: "Hub",
            href: "/portal",
            icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
            name: "Exercises",
            href: "/portal/exercises",
            icon: <ExerciseIcon className="w-4 h-4" />,
        },
        {
            name: "History",
            href: "/portal/history",
            icon: <History className="w-4 h-4" />,
        },
        {
            name: "Billing",
            href: "/portal/billing",
            icon: <CreditCard className="w-4 h-4" />,
        },
        {
            name: "Profile",
            href: "/portal/profile",
            icon: <User className="w-4 h-4" />,
        },
    ];

    return (
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] flex flex-col font-sans selection:bg-[#00ff87]/30">
            {/* Persistent Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-[#121316]/90 backdrop-blur-md border-b border-zinc-800/80">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    {/* Brand */}
                    <Link href="/portal" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-[#00ff87] text-black font-black flex items-center justify-center shadow-md shadow-[#00ff87]/20 group-hover:scale-105 transition-transform">
                            <Dumbbell className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-black text-sm tracking-tight uppercase text-white block leading-none">
                                {currentGym.shortName}
                            </span>
                            <span className="text-[10px] font-mono font-bold tracking-widest text-[#00ff87] uppercase leading-none">
                                ATHLETE PORTAL
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-1 bg-[#181a20] p-1 rounded-xl border border-zinc-800">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        isActive
                                            ? "bg-[#00ff87] text-black shadow-sm font-bold"
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                                    }`}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right User Actions */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
                            <span className="font-semibold text-zinc-300">
                                {memberName}
                            </span>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="bg-[#181a20] hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 text-zinc-400 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                            title="Sign out of Athlete Portal"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 pb-20 md:pb-10">
                {children}
            </main>

            {/* Mobile Bottom Tab Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121316]/95 backdrop-blur-xl border-t border-zinc-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                                isActive
                                    ? "text-[#00ff87] font-bold scale-105"
                                    : "text-zinc-500 hover:text-zinc-300 font-medium"
                            }`}
                        >
                            <div className={`p-1 rounded-lg ${isActive ? "bg-[#00ff87]/15" : ""}`}>
                                {item.icon}
                            </div>
                            <span className="text-[10px] mt-0.5 tracking-tight">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
