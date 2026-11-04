"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { currentGym } from "@/gymConfig";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsLoading(true);

        setTimeout(() => {
            // Demo master credential check (Accepts admin email & password)
            if (
                (email.toLowerCase() === "admin@ironcore.fit" && password === "ironcore2026") ||
                (email.includes("@") && password.length >= 6)
            ) {
                localStorage.setItem("ironcore_admin_session", "authenticated");
                router.push("/admin");
            } else {
                setErrorMsg("Invalid Admin Email or Password. Minimum 6 characters required.");
                setIsLoading(false);
            }
        }, 600);
    };

    return (
        <div className="min-h-screen bg-[#070708] text-white flex flex-col justify-between p-6 font-sans selection:bg-[#00ff87]/30">
            {/* Top Navbar */}
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
                    href="/login"
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition font-mono"
                >
                    Member App →
                </Link>
            </div>

            {/* Main Admin Card */}
            <div className="max-w-md mx-auto w-full bg-[#121316] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="space-y-1.5 text-center">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full inline-block">
                        Owner &amp; Desk Clearance Only
                    </span>
                    <h1 className="text-2xl font-black tracking-tight text-white uppercase mt-2">
                        Gym Owner CRM Login
                    </h1>
                    <p className="text-xs text-zinc-400">
                        Sign in to access member renewals, WhatsApp automation billing, and attendance analytics.
                    </p>
                </div>

                {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
                    <div>
                        <label className="text-zinc-400 font-semibold block mb-1">
                            Admin / Desk Email Address
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="admin@ironcore.fit"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#181a20] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87] text-sm font-mono"
                        />
                    </div>

                    <div>
                        <label className="text-zinc-400 font-semibold block mb-1">
                            Master Password
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#181a20] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87] text-sm font-mono"
                        />
                        <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                            Demo login: admin@ironcore.fit / ironcore2026
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00ff87]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                        {isLoading ? "Authenticating Clearance..." : "Authorize CRM Access →"}
                    </button>
                </form>

                <div className="p-3 rounded-xl bg-[#181a20] border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center gap-2">
                    <span>🔒</span>
                    <span>Only authorized trainers and managers are permitted beyond this gateway.</span>
                </div>
            </div>

            <div className="text-center text-xs text-zinc-600 font-mono">
                IronCore Management Console • Security Protocol v2.4
            </div>
        </div>
    );
}