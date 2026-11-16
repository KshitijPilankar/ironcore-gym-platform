"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[IronCore Global Error Caught]:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] flex items-center justify-center p-6 selection:bg-[#00ff87]/30">
            <div className="max-w-md w-full bg-[#141518] border border-red-500/30 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-red-500/10 blur-3xl pointer-events-none" />

                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-2xl font-black shadow-lg shadow-red-500/10">
                    <AlertTriangle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full inline-block">
                        SYSTEM FAULT RECOVERED
                    </span>
                    <h1 className="text-2xl font-black text-white tracking-tight uppercase mt-1">
                        Something Went Wrong
                    </h1>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                        An unexpected application runtime error occurred. Your athlete credentials and logged sets remain safe in your session.
                    </p>
                </div>

                <div className="space-y-2.5 pt-2">
                    <button
                        onClick={() => reset()}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00ff87]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Try Again (Reset View)</span>
                    </button>

                    <Link
                        href="/portal"
                        className="w-full py-3 px-4 rounded-xl bg-[#181a20] hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-all border border-zinc-800 flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        <span>Return to Athlete Hub</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
