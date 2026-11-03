"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface WeightEntry {
    date: string;
    weightKg: number;
}

interface Member {
    id: string;
    name: string;
    phone: string;
    plan: string;
    dueDate: string;
    streakDays: number;
    status: "Due" | "Paid" | "Overdue";
    targetWeightKg?: number;
    weightHistory?: WeightEntry[];
}

export default function MemberPortalDashboard() {
    const [member, setMember] = useState<Member | null>(null);
    const [targetWeight, setTargetWeight] = useState<number>(70);
    const [loggedWeight, setLoggedWeight] = useState<string>("");
    const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(false);
    const [weightLogs, setWeightLogs] = useState<WeightEntry[]>([]);
    const [isMounted, setIsMounted] = useState<boolean>(false);

    // 1. Load active member session or first member from CRM db
    useEffect(() => {
        setIsMounted(true);
        const storedMembers = localStorage.getItem("ironcore_members_db");
        if (storedMembers) {
            try {
                const membersList: Member[] = JSON.parse(storedMembers);
                if (membersList.length > 0) {
                    // Default to first member or 'Sachin Pilankar'
                    const active = membersList[0];
                    setMember(active);
                    setTargetWeight(active.targetWeightKg || 70);

                    const defaultLogs: WeightEntry[] = active.weightHistory || [
                        { date: "2026-10-25", weightKg: 73.2 },
                        { date: "2026-10-28", weightKg: 72.4 },
                        { date: "2026-11-01", weightKg: 71.8 },
                    ];
                    setWeightLogs(defaultLogs);
                }
            } catch (e) {
                console.error("Failed to load member profile", e);
            }
        }

        // Check-in status check for today
        const checkinDate = localStorage.getItem("ironcore_last_checkin_date");
        const today = new Date().toISOString().split("T")[0];
        if (checkinDate === today) {
            setHasCheckedInToday(true);
        }
    }, []);

    // 2. Daily Check-in Handler (Syncs streak to localStorage & Admin CRM)
    const handleDailyCheckIn = () => {
        if (!member) return;

        const today = new Date().toISOString().split("T")[0];
        const newStreak = member.streakDays + 1;

        const updatedMember: Member = {
            ...member,
            streakDays: newStreak,
        };

        setMember(updatedMember);
        setHasCheckedInToday(true);
        localStorage.setItem("ironcore_last_checkin_date", today);

        // Sync with CRM storage so admin sees the updated streak
        const storedMembers = localStorage.getItem("ironcore_members_db");
        if (storedMembers) {
            try {
                const membersList: Member[] = JSON.parse(storedMembers);
                const updatedList = membersList.map((m) =>
                    m.id === member.id ? { ...m, streakDays: newStreak } : m
                );
                localStorage.setItem("ironcore_members_db", JSON.stringify(updatedList));
            } catch (err) {
                console.error("Failed to sync check-in with CRM", err);
            }
        }

        alert(`🔥 Checked in successfully! Current streak boosted to ${newStreak} Days.`);
    };

    // 3. Log Body Weight Handler
    const handleAddWeightLog = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(loggedWeight);
        if (isNaN(val) || val <= 0) return;

        const today = new Date().toISOString().split("T")[0];
        const newEntry: WeightEntry = { date: today, weightKg: val };
        const updatedLogs = [newEntry, ...weightLogs];

        setWeightLogs(updatedLogs);
        setLoggedWeight("");

        if (member) {
            const updatedMember = { ...member, weightHistory: updatedLogs };
            setMember(updatedMember);

            const storedMembers = localStorage.getItem("ironcore_members_db");
            if (storedMembers) {
                try {
                    const membersList: Member[] = JSON.parse(storedMembers);
                    const updatedList = membersList.map((m) =>
                        m.id === member.id ? { ...m, weightHistory: updatedLogs } : m
                    );
                    localStorage.setItem("ironcore_members_db", JSON.stringify(updatedList));
                } catch (err) {
                    console.error("Failed to update weight in storage", err);
                }
            }
        }
    };

    // 4. Save Target Weight Goal
    const handleSaveGoal = () => {
        if (member) {
            const updatedMember = { ...member, targetWeightKg: targetWeight };
            setMember(updatedMember);

            const storedMembers = localStorage.getItem("ironcore_members_db");
            if (storedMembers) {
                try {
                    const membersList: Member[] = JSON.parse(storedMembers);
                    const updatedList = membersList.map((m) =>
                        m.id === member.id ? { ...m, targetWeightKg: targetWeight } : m
                    );
                    localStorage.setItem("ironcore_members_db", JSON.stringify(updatedList));
                } catch (err) {
                    console.error("Failed to update target weight", err);
                }
            }
        }
        alert(`🎯 Target Weight updated to ${targetWeight} kg!`);
    };

    if (!isMounted || !member) {
        return (
            <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center text-zinc-400 text-sm">
                Loading Athlete Portal...
            </div>
        );
    }

    const latestWeight = weightLogs.length > 0 ? weightLogs[0].weightKg : 72;
    const weightDifference = (latestWeight - targetWeight).toFixed(1);

    return (
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] p-6 lg:p-10 font-sans selection:bg-[#00ff87]/30">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Top Navbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
                    <div>
                        <span className="text-[10px] font-bold tracking-widest text-[#00ff87] uppercase">
                            Athlete Performance Hub
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                            Hi, <span className="text-white">{member.name}</span> 👋
                        </h1>
                        <p className="text-xs text-zinc-400 mt-1">
                            Active Plan: <span className="text-zinc-200 font-semibold">{member.plan}</span> • Due Date:{" "}
                            <span className="font-mono text-zinc-300">{member.dueDate}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin"
                            className="bg-[#1b1c20] hover:bg-[#23252a] text-zinc-300 font-medium text-xs px-3.5 py-2.5 rounded-lg border border-zinc-800 transition-all flex items-center gap-1.5"
                        >
                            ⚙️ Switch to Admin CRM
                        </Link>
                    </div>
                </div>

                {/* Hero Check-in & Streak Card (openGym /home Style) */}
                <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                    <div className="space-y-2 text-center md:text-left z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            🔥 SNAPCHAT-STYLE STREAK
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                            {member.streakDays}{" "}
                            <span className="text-lg sm:text-xl font-normal text-zinc-400">Days Unbroken</span>
                        </h2>
                        <p className="text-xs text-zinc-400 max-w-md">
                            Maintain your streak by checking in every gym day. Top 3 athletes receive Whey Protein & Merchandise rewards.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto z-10">
                        <button
                            onClick={handleDailyCheckIn}
                            disabled={hasCheckedInToday}
                            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                                hasCheckedInToday
                                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
                                    : "bg-[#00ff87] hover:bg-[#00e57a] text-black shadow-[#00ff87]/20 active:scale-95 cursor-pointer"
                            }`}
                        >
                            <span>{hasCheckedInToday ? "✓" : "⚡"}</span>
                            <span>{hasCheckedInToday ? "Checked In Today" : "Check In At Gym"}</span>
                        </button>
                    </div>
                </div>

                {/* openGym Metric Modules: Target Weight & Log Weight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Target Weight Goal Module */}
                    <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <span>🎯</span> Target Weight Goal
                                </h3>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    Set and manage your target physique weight
                                </p>
                            </div>
                            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-md bg-[#1b1c20] border border-zinc-800 text-[#00ff87]">
                                Current: {latestWeight} kg
                            </span>
                        </div>

                        <div className="bg-[#1b1c20] border border-zinc-800/90 rounded-xl p-5 text-center space-y-3">
                            <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                Goal Physique Weight
                            </span>
                            <div className="text-4xl font-black text-white font-mono">
                                {targetWeight} <span className="text-lg font-normal text-zinc-500">kg</span>
                            </div>
                            <input
                                type="range"
                                min="45"
                                max="120"
                                step="0.5"
                                value={targetWeight}
                                onChange={(e) => setTargetWeight(parseFloat(e.target.value))}
                                className="w-full accent-[#00ff87] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                                <span>45 kg</span>
                                <span>Delta: {weightDifference} kg to goal</span>
                                <span>120 kg</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveGoal}
                            className="w-full bg-[#1b1c20] hover:bg-[#25272e] border border-zinc-800 text-zinc-200 font-semibold text-xs py-2.5 rounded-xl transition-all"
                        >
                            Save Target Goal
                        </button>
                    </div>

                    {/* Daily Body Weight Logger */}
                    <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-6 space-y-5">
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span>⚖️</span> Log Daily Body Weight
                            </h3>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Track morning weigh-ins for consistent body composition
                            </p>
                        </div>

                        <form onSubmit={handleAddWeightLog} className="flex gap-2">
                            <input
                                type="number"
                                step="0.1"
                                required
                                placeholder="Enter today's weight (kg)..."
                                value={loggedWeight}
                                onChange={(e) => setLoggedWeight(e.target.value)}
                                className="flex-1 bg-[#1b1c20] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87]"
                            />
                            <button
                                type="submit"
                                className="bg-[#00ff87] hover:bg-[#00e57a] text-black font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#00ff87]/20"
                            >
                                Log Entry
                            </button>
                        </form>

                        {/* Recent Log History List */}
                        <div className="space-y-2 pt-1">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                                Recent Weigh-ins
                            </span>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {weightLogs.map((log, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between bg-[#1b1c20]/70 border border-zinc-800/60 rounded-lg px-3.5 py-2 text-xs"
                                    >
                                        <span className="font-mono text-zinc-400">{log.date}</span>
                                        <span className="font-bold text-zinc-200 font-mono">
                                            {log.weightKg.toFixed(1)} kg
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Hub Navigation: Muscle Heatmap, Exercises & Workout History */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 flex items-center justify-between hover:border-[#00ff87]/40 transition-all group">
                        <div>
                            <span className="text-xl">🧬</span>
                            <h4 className="text-sm font-bold text-white mt-1 group-hover:text-[#00ff87] transition-colors">
                                3D Muscle Volume Heatmap
                            </h4>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Weekly sets load mapped across full-body muscle anatomy.
                            </p>
                        </div>
                        <Link
                            href="/portal/stats"
                            className="bg-[#1b1c20] group-hover:bg-[#00ff87] group-hover:text-black border border-zinc-800 text-zinc-300 font-semibold text-xs px-3.5 py-2 rounded-lg transition-all"
                        >
                            View Stats →
                        </Link>
                    </div>

                    <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 flex items-center justify-between hover:border-[#00ff87]/40 transition-all group">
                        <div>
                            <span className="text-xl">🏋️</span>
                            <h4 className="text-sm font-bold text-white mt-1 group-hover:text-[#00ff87] transition-colors">
                                5,600+ Exercise Engine
                            </h4>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Filter by equipment, barbell, dumbbell, and calisthenics.
                            </p>
                        </div>
                        <Link
                            href="/portal/exercises"
                            className="bg-[#1b1c20] group-hover:bg-[#00ff87] group-hover:text-black border border-zinc-800 text-zinc-300 font-semibold text-xs px-3.5 py-2 rounded-lg transition-all"
                        >
                            Explore →
                        </Link>
                    </div>

                    <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 flex items-center justify-between hover:border-[#00ff87]/40 transition-all group">
                        <div>
                            <span className="text-xl">📄</span>
                            <h4 className="text-sm font-bold text-white mt-1 group-hover:text-[#00ff87] transition-colors">
                                Workout History & PDF Reports
                            </h4>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Review past sessions, progressive volume overload, and print performance reports.
                            </p>
                        </div>
                        <Link
                            href="/portal/history"
                            className="bg-[#1b1c20] group-hover:bg-[#00ff87] group-hover:text-black border border-zinc-800 text-zinc-300 font-semibold text-xs px-3.5 py-2 rounded-lg transition-all"
                        >
                            History →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
