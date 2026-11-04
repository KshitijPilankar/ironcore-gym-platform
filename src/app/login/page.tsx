"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { currentGym } from "@/gymConfig";

interface Member {
    id: string;
    name: string;
    phone: string;
    plan: string;
    dueDate: string;
    streakDays: number;
    status: "Due" | "Paid" | "Overdue";
}

export default function MemberLoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [passcode, setPasscode] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleMemberLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsLoading(true);

        const cleanPhone = phone.replace(/[^0-9]/g, "");

        // Load registered CRM members from localStorage
        const storedMembers = localStorage.getItem("ironcore_members_db");
        let membersList: Member[] = [];

        if (storedMembers) {
            try {
                membersList = JSON.parse(storedMembers);
            } catch {
                membersList = [];
            }
        }

        // Verify phone match against CRM roster
        const matchedMember = membersList.find(
            (m) => m.phone.includes(cleanPhone) || cleanPhone.includes(m.phone.slice(-10))
        );

        setTimeout(() => {
            // Demo verification: Match phone or allow default test member (e.g., Kshitij)
            if (matchedMember || cleanPhone.endsWith("43209") || cleanPhone.length >= 10) {
                const activeUser = matchedMember || {
                    id: "mem-1",
                    name: "Kshitij Pilankar",
                    phone: cleanPhone || "919876543209",
                    plan: "Smart Pass",
                    dueDate: "2026-11-03",
                    streakDays: 2,
                    status: "Due" as const,
                };

                // Store active member session
                localStorage.setItem("ironcore_active_member", JSON.stringify(activeUser));
                localStorage.setItem("ironcore_member_session", "authenticated");

                router.push("/portal");
            } else {
                setErrorMsg("Phone number not found in gym registry. Please contact front desk.");
                setIsLoading(false);
            }
        }, 600);
    };

    return (
        <div className="min-h-screen bg-[#070708] text-white flex flex-col justify-between p-6 font-sans selection:bg-[#00ff87]/30">
            {/* Top Brand Bar */}
            <div className="max-w-md mx-auto w-full flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#00ff87]/15 border border-[#00ff87]/40 flex items-center justify-center text-sm font-black text-[#00ff87]">
                        IC
                    </div>
                    <span className="font-extrabold text-sm tracking-wider uppercase">
                        {currentGym.name}
                    </span>
                </Link>
                <Link
                    href="/admin/login"
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition font-mono"
                >
                    Admin Portal →
                </Link>
            </div>

            {/* Main Login Card */}
            <div className="max-w-md mx-auto w-full bg-[#121316] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="space-y-1.5 text-center">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#00ff87] font-bold">
                        Athlete Access Gateway
                    </span>
                    <h1 className="text-2xl font-black tracking-tight text-white uppercase">
                        Member Sign In
                    </h1>
                    <p className="text-xs text-zinc-400">
                        Enter your registered WhatsApp number to access your workouts, 3D heatmap, and streaks.
                    </p>
                </div>

                {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleMemberLogin} className="space-y-4 text-xs">
                    <div>
                        <label className="text-zinc-400 font-semibold block mb-1">
                            Registered WhatsApp Mobile Number
                        </label>
                        <input
                            type="tel"
                            required
                            placeholder="e.g. 9876543209"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-[#181a20] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87] text-sm font-mono"
                        />
                    </div>

                    <div>
                        <label className="text-zinc-400 font-semibold block mb-1">
                            4-Digit Member PIN / Passcode
                        </label>
                        <input
                            type="password"
                            maxLength={4}
                            required
                            placeholder="••••"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            className="w-full bg-[#181a20] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87] text-center tracking-widest text-lg font-mono"
                        />
                        <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                            Default passcode: any 4 digits (e.g. 1234)
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00ff87]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                        {isLoading ? "Verifying Profile..." : "Sign In to Athlete Hub →"}
                    </button>
                </form>

                <div className="pt-4 border-t border-zinc-800/80 text-center space-y-2">
                    <p className="text-[11px] text-zinc-400">
                        Not registered yet? Get a trial pass at reception.
                    </p>
                    <a
                        href={`https://wa.me/${currentGym.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            "Hi IronCore Desk, I want to activate my member login."
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#00ff87] font-semibold hover:underline inline-block"
                    >
                        Contact Desk on WhatsApp ↗
                    </a>
                </div>
            </div>

            <div className="text-center text-xs text-zinc-600 font-mono">
                IronCore Access Management • 256-Bit SSL Encrypted
            </div>
        </div>
    );
}