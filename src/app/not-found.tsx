import React from "react";
import Link from "next/link";
import { Dumbbell, ArrowLeft, Home, LayoutDashboard } from "lucide-react";
import { currentGym } from "@/gymConfig";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] flex items-center justify-center p-6 selection:bg-[#00ff87]/30">
            <div className="max-w-md w-full bg-[#141518] border border-zinc-800 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#00ff87]/10 blur-3xl pointer-events-none" />

                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00ff87]/10 border border-[#00ff87]/30 text-[#00ff87] text-2xl font-black shadow-lg shadow-[#00ff87]/10">
                    <Dumbbell className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#00ff87] font-bold bg-[#00ff87]/10 border border-[#00ff87]/20 px-3 py-1 rounded-full inline-block">
                        ERROR 404
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase mt-1">
                        Station Not Found
                    </h1>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                        The exercise, portal route, or page you are looking for has been moved or doesn't exist in the {currentGym.name} platform.
                    </p>
                </div>

                <div className="space-y-2.5 pt-2">
                    <Link
                        href="/portal"
                        className="w-full py-3.5 px-4 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00ff87]/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Go to Athlete Dashboard</span>
                    </Link>

                    <Link
                        href="/"
                        className="w-full py-3 px-4 rounded-xl bg-[#181a20] hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-all border border-zinc-800 flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        <span>Return to Main Site</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
