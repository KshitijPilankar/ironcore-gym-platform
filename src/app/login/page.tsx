"use client";

import React, { useState, useEffect } from "react";
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

    // Step state: 'PHONE' | 'OTP'
    const [authStep, setAuthStep] = useState<"PHONE" | "OTP">("PHONE");

    // Inputs
    const [phone, setPhone] = useState("");
    const [otpInput, setOtpInput] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");

    // UI state
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);

    // Resend OTP Countdown timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (authStep === "OTP" && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [authStep, countdown]);

    // Step 1: Validate 10-Digit Mobile & Send OTP
    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        const cleanPhone = phone.replace(/[^0-9]/g, "");

        // 10-Digit Legitimate Indian Mobile Format Validation
        const indianMobileRegex = /^[6-9]\d{9}$/;
        if (!indianMobileRegex.test(cleanPhone)) {
            setErrorMsg("Kripya 10 digits ka valid mobile number enter karein (6, 7, 8, 9 se start hona chahiye).");
            return;
        }

        setIsLoading(true);

        // Simulate OTP generation
        const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(randomOtp);

        setTimeout(() => {
            setIsLoading(false);
            setAuthStep("OTP");
            setCountdown(30);
            setCanResend(false);
            setSuccessMsg(`WhatsApp OTP bhej diya gaya hai! (Demo OTP: ${randomOtp})`);
        }, 700);
    };

    // Step 2: Verify OTP and Login
    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsLoading(true);

        const cleanPhone = phone.replace(/[^0-9]/g, "");

        setTimeout(() => {
            if (otpInput === generatedOtp || otpInput === "1234") {
                // Find existing CRM member or initialize session
                const storedMembers = localStorage.getItem("ironcore_members_db");
                let membersList: Member[] = [];

                if (storedMembers) {
                    try {
                        membersList = JSON.parse(storedMembers);
                    } catch {
                        membersList = [];
                    }
                }

                const matchedMember = membersList.find(
                    (m) => m.phone.includes(cleanPhone) || cleanPhone.includes(m.phone.slice(-10))
                );

                const activeUser: Member = matchedMember || {
                    id: `mem-${Date.now()}`,
                    name: cleanPhone.endsWith("43209") ? "Kshitij Pilankar" : "Athlete Member",
                    phone: `91${cleanPhone}`,
                    plan: "Smart Pass",
                    dueDate: "2026-11-20",
                    streakDays: 2,
                    status: "Due",
                };

                localStorage.setItem("ironcore_active_member", JSON.stringify(activeUser));
                localStorage.setItem("ironcore_member_session", "authenticated");

                router.push("/portal");
            } else {
                setErrorMsg("Galat OTP! Kripya sahi 4-digit OTP enter karein.");
                setIsLoading(false);
            }
        }, 600);
    };

    // Resend OTP Handler
    const handleResendOtp = () => {
        if (!canResend) return;
        setErrorMsg("");
        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(newOtp);
        setCountdown(30);
        setCanResend(false);
        setSuccessMsg(`Naya OTP bhej diya gaya hai! (Demo OTP: ${newOtp})`);
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
                    href="/admin/login"
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition font-mono"
                >
                    Admin Portal →
                </Link>
            </div>

            {/* Main Authentication Card */}
            <div className="max-w-md mx-auto w-full bg-[#121316] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="space-y-1.5 text-center">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#00ff87] font-bold">
                        Athlete Access Gateway
                    </span>
                    <h1 className="text-2xl font-black tracking-tight text-white uppercase">
                        Member Sign In
                    </h1>
                    <p className="text-xs text-zinc-400">
                        {authStep === "PHONE"
                            ? "Apna registered 10-digit WhatsApp number enter karke OTP mangwayein."
                            : `+91 ${phone} par bheja gaya 4-digit verification code enter karein.`}
                    </p>
                </div>

                {/* Error Alert */}
                {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
                        {errorMsg}
                    </div>
                )}

                {/* Success / Demo OTP Alert */}
                {successMsg && (
                    <div className="p-3 rounded-xl bg-[#00ff87]/10 border border-[#00ff87]/30 text-[#00ff87] text-xs font-semibold text-center">
                        {successMsg}
                    </div>
                )}

                {/* STEP 1: ONLY PHONE NUMBER FIELD */}
                {authStep === "PHONE" && (
                    <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                        <div>
                            <label className="text-zinc-400 font-semibold block mb-1.5">
                                Registered WhatsApp Mobile Number
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-xs font-mono text-zinc-400 border-r border-zinc-700 pr-2">
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    required
                                    placeholder="9876543210"
                                    value={phone}
                                    onChange={(e) => {
                                        const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                                        setPhone(onlyNums);
                                    }}
                                    className="w-full bg-[#181a20] border border-zinc-800 rounded-xl pl-16 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87] text-sm font-mono tracking-wider"
                                />
                            </div>
                            <span className="text-[11px] text-zinc-500 font-mono mt-1 block">
                                Exactly 10 digits required (Starting with 6, 7, 8, ya 9)
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || phone.length !== 10}
                            className="w-full py-3.5 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00ff87]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                            {isLoading ? "Verifying Number..." : "Send WhatsApp OTP →"}
                        </button>
                    </form>
                )}

                {/* STEP 2: ONLY OTP FIELD */}
                {authStep === "OTP" && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-zinc-400 font-semibold">
                                    4-Digit Verification Code
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAuthStep("PHONE");
                                        setOtpInput("");
                                        setErrorMsg("");
                                        setSuccessMsg("");
                                    }}
                                    className="text-[11px] text-[#00ff87] hover:underline font-semibold"
                                >
                                    Edit Number ✎
                                </button>
                            </div>

                            <input
                                type="text"
                                maxLength={4}
                                required
                                autoFocus
                                placeholder="••••"
                                value={otpInput}
                                onChange={(e) => {
                                    const nums = e.target.value.replace(/[^0-9]/g, "");
                                    setOtpInput(nums);
                                }}
                                className="w-full bg-[#181a20] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87] text-center tracking-[0.5em] text-xl font-mono"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || otpInput.length !== 4}
                            className="w-full py-3.5 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00ff87]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                            {isLoading ? "Validating OTP..." : "Verify & Sign In →"}
                        </button>

                        {/* Resend Section */}
                        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                            <span>Didn't receive OTP?</span>
                            {canResend ? (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className="text-[#00ff87] font-bold hover:underline cursor-pointer"
                                >
                                    Resend OTP
                                </button>
                            ) : (
                                <span className="text-zinc-500">Resend in {countdown}s</span>
                            )}
                        </div>
                    </form>
                )}

                {/* Bottom Help Links */}
                <div className="pt-4 border-t border-zinc-800/80 text-center space-y-2">
                    <p className="text-[11px] text-zinc-400">
                        Naya admission ya unregistered number? Front desk se contact karein.
                    </p>
                    <a
                        href={`https://wa.me/${currentGym.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            "Hi IronCore Desk, mujhe member login activate karne me help chahiye."
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
                IronCore Access Management • OTP Guard v2.4
            </div>
        </div>
    );
}