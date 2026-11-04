"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { currentGym } from "@/gymConfig";

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

interface ChatMessage {
    id: string;
    sender: "member" | "admin";
    text: string;
    timestamp: string;
    status?: "sent" | "delivered" | "read";
    isTemplate?: boolean;
}

interface ChatMember {
    id: string;
    name: string;
    phone: string;
    plan: string;
    streakDays: number;
    avatarBg: string;
    unreadCount: number;
    metaWindowActive: boolean;
    windowHoursRemaining: number;
    dueDate: string;
    lastMessage: string;
    lastTime: string;
    messages: ChatMessage[];
}

export default function MemberPortalDashboard() {
    const [member, setMember] = useState<Member | null>(null);
    const [targetWeight, setTargetWeight] = useState<number>(70);
    const [loggedWeight, setLoggedWeight] = useState<string>("");
    const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(false);
    const [weightLogs, setWeightLogs] = useState<WeightEntry[]>([]);
    const [isMounted, setIsMounted] = useState<boolean>(false);

    // Chat Drawer States
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState<string>("");
    const [hasUnreadSupport, setHasUnreadSupport] = useState<boolean>(true);
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    // 1. Load active member session or first member from CRM db
    useEffect(() => {
        setIsMounted(true);
        const storedMembers = localStorage.getItem("ironcore_members_db");
        let activeMember: Member | null = null;

        if (storedMembers) {
            try {
                const membersList: Member[] = JSON.parse(storedMembers);
                if (membersList.length > 0) {
                    activeMember = membersList[0];
                    setMember(activeMember);
                    setTargetWeight(activeMember.targetWeightKg || 70);

                    const defaultLogs: WeightEntry[] = activeMember.weightHistory || [
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

        // Load or initialize member chat thread from CRM chat roster
        const memberName = activeMember ? activeMember.name : "Athlete";
        const savedRoster = localStorage.getItem("ironcore_crm_chat_roster");

        if (savedRoster) {
            try {
                const roster: ChatMember[] = JSON.parse(savedRoster);
                const matching = roster.find(
                    (m) => m.name.toLowerCase() === memberName.toLowerCase()
                );
                if (matching && matching.messages && matching.messages.length > 0) {
                    setChatMessages(matching.messages);
                } else {
                    initDefaultChat(memberName);
                }
            } catch (err) {
                console.error("Failed to load chat roster", err);
                initDefaultChat(memberName);
            }
        } else {
            initDefaultChat(memberName);
        }
    }, []);

    const initDefaultChat = (name: string) => {
        const initialMsgs: ChatMessage[] = [
            {
                id: "msg-init-1",
                sender: "admin",
                text: `Hi ${name}! 👋 Welcome to IronCore Coach & Desk Support. How can we assist your training or membership today?`,
                timestamp: "10:00 AM",
                status: "read",
            },
        ];
        setChatMessages(initialMsgs);
    };

    // Scroll to bottom when messages change or chat drawer opens
    useEffect(() => {
        if (isChatOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setHasUnreadSupport(false);
        }
    }, [chatMessages, isChatOpen]);

    // 2. Daily Check-in Handler
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

    // 5. Member sends message via slide-up chat drawer
    const handleSendMemberMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const text = chatInput.trim();
        if (!text || !member) return;

        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: "member",
            text,
            timestamp: timeStr,
            status: "delivered",
        };

        const updatedMessages = [...chatMessages, newMsg];
        setChatMessages(updatedMessages);
        setChatInput("");

        const savedRoster = localStorage.getItem("ironcore_crm_chat_roster");
        if (savedRoster) {
            try {
                const roster: ChatMember[] = JSON.parse(savedRoster);
                const memberIndex = roster.findIndex(
                    (m) => m.name.toLowerCase() === member.name.toLowerCase()
                );

                if (memberIndex >= 0) {
                    roster[memberIndex] = {
                        ...roster[memberIndex],
                        lastMessage: text,
                        lastTime: timeStr,
                        unreadCount: (roster[memberIndex].unreadCount || 0) + 1,
                        messages: [...roster[memberIndex].messages, newMsg],
                    };
                    localStorage.setItem("ironcore_crm_chat_roster", JSON.stringify(roster));
                }
            } catch (err) {
                console.error("Failed to sync member message to CRM", err);
            }
        }

        setTimeout(() => {
            const replyMsg: ChatMessage = {
                id: `reply-${Date.now()}`,
                sender: "admin",
                text: "Thanks for reaching out! A coach or desk manager has received your message and will respond shortly. You can also tap 'Direct WhatsApp' above for urgent support.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                status: "read",
            };
            setChatMessages((prev) => [...prev, replyMsg]);
        }, 1200);
    };

    const directWhatsAppUrl = `https://wa.me/${currentGym.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hi ${currentGym.name} Coach, this is ${member ? member.name : "an athlete"} (${member ? member.plan : "Member"}). I need assistance with my workout plan & desk support.`
    )}`;

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
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] p-6 lg:p-10 font-sans selection:bg-[#00ff87]/30 relative">
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

                {/* Hero Check-in & Streak Card */}
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
                            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${hasCheckedInToday
                                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
                                    : "bg-[#00ff87] hover:bg-[#00e57a] text-black shadow-[#00ff87]/20 active:scale-95 cursor-pointer"
                                }`}
                        >
                            <span>{hasCheckedInToday ? "✓" : "⚡"}</span>
                            <span>{hasCheckedInToday ? "Checked In Today" : "Check In At Gym"}</span>
                        </button>
                    </div>
                </div>

                {/* Metric Modules: Target Weight & Log Weight */}
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
                            className="w-full bg-[#1b1c20] hover:bg-[#25272e] border border-zinc-800 text-zinc-200 font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
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
                                className="bg-[#00ff87] hover:bg-[#00e57a] text-black font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#00ff87]/20 cursor-pointer"
                            >
                                Log Entry
                            </button>
                        </form>

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

                {/* 4-Column Feature Hub Navigation: Uniform Styling across all 4 cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    {/* Card 1: 3D Muscle Volume Heatmap */}
                    <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between hover:border-[#00ff87]/40 transition-all group">
                        <div>
                            <span className="text-xl">🧬</span>
                            <h4 className="text-sm font-bold text-white mt-2 group-hover:text-[#00ff87] transition-colors">
                                3D Muscle Heatmap
                            </h4>
                            <p className="text-xs text-zinc-500 mt-1">
                                Weekly volume load mapped across full-body muscle anatomy.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Link
                                href="/portal/stats"
                                className="inline-block w-full text-center bg-[#1b1c20] group-hover:bg-[#00ff87] group-hover:text-black border border-zinc-800 text-zinc-300 font-semibold text-xs py-2 rounded-lg transition-all"
                            >
                                View Stats →
                            </Link>
                        </div>
                    </div>

                    {/* Card 2: 5,600+ Exercise Engine */}
                    <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between hover:border-[#00ff87]/40 transition-all group">
                        <div>
                            <span className="text-xl">🏋️</span>
                            <h4 className="text-sm font-bold text-white mt-2 group-hover:text-[#00ff87] transition-colors">
                                5,600+ Exercise Engine
                            </h4>
                            <p className="text-xs text-zinc-500 mt-1">
                                Filter by equipment, barbell, dumbbell, and calisthenics.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Link
                                href="/portal/exercises"
                                className="inline-block w-full text-center bg-[#1b1c20] group-hover:bg-[#00ff87] group-hover:text-black border border-zinc-800 text-zinc-300 font-semibold text-xs py-2 rounded-lg transition-all"
                            >
                                Explore →
                            </Link>
                        </div>
                    </div>

                    {/* Card 3: Workout History & PDF Reports */}
                    <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between hover:border-[#00ff87]/40 transition-all group">
                        <div>
                            <span className="text-xl">📄</span>
                            <h4 className="text-sm font-bold text-white mt-2 group-hover:text-[#00ff87] transition-colors">
                                Workout History & Logbook
                            </h4>
                            <p className="text-xs text-zinc-500 mt-1">
                                Review past sessions, progressive overload, and print PDF reports.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Link
                                href="/portal/history"
                                className="inline-block w-full text-center bg-[#1b1c20] group-hover:bg-[#00ff87] group-hover:text-black border border-zinc-800 text-zinc-300 font-semibold text-xs py-2 rounded-lg transition-all"
                            >
                                History →
                            </Link>
                        </div>
                    </div>

                    {/* Card 4: Coach & Desk Support (Consistent structure & smooth hover matching Cards 1-3) */}
                    <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between hover:border-[#00ff87]/40 transition-all group">
                        <div>
                            <span className="text-xl">💬</span>
                            <h4 className="text-sm font-bold text-white mt-2 group-hover:text-[#00ff87] transition-colors">
                                Coach & Desk Support
                            </h4>
                            <p className="text-xs text-zinc-500 mt-1">
                                Instant 24/7 direct WhatsApp desk & trainer assistance.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Link
                                href="/portal/support"
                                className="inline-block w-full text-center bg-[#1b1c20] group-hover:bg-[#00ff87] group-hover:text-black border border-zinc-800 text-zinc-300 font-semibold text-xs py-2 rounded-lg transition-all"
                            >
                                Open Chat →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* FLOATING CHAT WIDGET & MINI SLIDE-UP CHAT DRAWER                          */}
            {/* ========================================================================= */}

            {/* Mini Slide-Up Chat Drawer */}
            {isChatOpen && (
                <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] h-[520px] max-h-[82vh] bg-[#121418] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
                    {/* Drawer Header */}
                    <div className="p-4 bg-[#16181f] border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-[#00ff87]/40 flex items-center justify-center text-lg font-black text-[#00ff87]">
                                    🏋️
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00ff87] border-2 border-[#121418]" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                                    IronCore Coach & Desk
                                </h3>
                                <span className="text-[10px] text-zinc-400 font-mono block">
                                    Online • Replies in &lt; 5 mins
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href="/portal/support"
                                className="text-[10px] text-[#00ff87] hover:underline font-semibold"
                                title="Expand to full screen"
                            >
                                Full Screen ↗
                            </Link>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="w-8 h-8 rounded-xl bg-[#1f222b] hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                                title="Close chat drawer"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Direct WhatsApp Quick Launch Banner */}
                    <div className="px-4 py-2.5 bg-[#181a22] border-b border-zinc-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                            <span>⚡</span> Need instant voice or call?
                        </span>
                        <a
                            href={directWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold bg-[#00ff87] hover:bg-[#00e57a] text-black px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                        >
                            <span>WhatsApp</span>
                            <span>↗</span>
                        </a>
                    </div>

                    {/* Messages Thread Canvas */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0d0e12]">
                        <div className="flex justify-center my-1">
                            <span className="bg-[#171920] border border-zinc-800 text-zinc-500 text-[10px] font-mono px-2.5 py-0.5 rounded-full">
                                Encrypted IronCore Live Support
                            </span>
                        </div>

                        {chatMessages.map((msg) => {
                            const isMe = msg.sender === "member";
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md leading-relaxed ${isMe
                                                ? "bg-[#00ff87]/20 border border-[#00ff87]/40 text-emerald-100 rounded-tr-xs"
                                                : "bg-[#1b1d24] border border-zinc-800 text-zinc-200 rounded-tl-xs"
                                            }`}
                                    >
                                        <p>{msg.text}</p>
                                        <div
                                            className={`text-[9px] font-mono mt-1 text-right ${isMe ? "text-[#00ff87]/80" : "text-zinc-500"
                                                }`}
                                        >
                                            {msg.timestamp} {isMe && "✓✓"}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick Question Chips */}
                    <div className="px-3 py-2 bg-[#14161c] border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
                        <button
                            onClick={() => setChatInput("Can I freeze my membership next week?")}
                            className="px-2.5 py-1 rounded-lg bg-[#1e2028] hover:bg-[#272a35] text-zinc-300 border border-zinc-700/60 whitespace-nowrap cursor-pointer"
                        >
                            ❄️ Freeze Membership
                        </button>
                        <button
                            onClick={() => setChatInput("Need advice on my daily protein intake.")}
                            className="px-2.5 py-1 rounded-lg bg-[#1e2028] hover:bg-[#272a35] text-zinc-300 border border-zinc-700/60 whitespace-nowrap cursor-pointer"
                        >
                            🥗 Protein Guidance
                        </button>
                        <button
                            onClick={() => setChatInput("When does my Smart Pass renew?")}
                            className="px-2.5 py-1 rounded-lg bg-[#1e2028] hover:bg-[#272a35] text-zinc-300 border border-zinc-700/60 whitespace-nowrap cursor-pointer"
                        >
                            💳 Renewal Query
                        </button>
                    </div>

                    {/* Bottom Message Input */}
                    <div className="p-3 bg-[#16181f] border-t border-zinc-800">
                        <form onSubmit={handleSendMemberMessage} className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Message IronCore Coach & Desk..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                className="flex-1 bg-[#1d2028] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87]"
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim()}
                                className="bg-[#00ff87] hover:bg-[#00e57a] disabled:opacity-40 text-black font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                            >
                                ➤
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Neon Green Floating Action Button */}
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#00ff87] hover:bg-[#00e57a] text-black shadow-2xl shadow-[#00ff87]/30 flex items-center justify-center transition-all active:scale-95 group border-2 border-black cursor-pointer"
                title="Chat with Gym / Coach"
            >
                {/* Unread Indicator Dot */}
                {hasUnreadSupport && !isChatOpen && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-black animate-pulse" />
                )}

                {isChatOpen ? (
                    <span className="text-xl font-black">✕</span>
                ) : (
                    <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
                )}
            </button>
        </div>
    );
}