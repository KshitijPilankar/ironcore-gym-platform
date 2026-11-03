"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface ChatMessage {
    id: string;
    sender: "member" | "admin";
    text: string;
    timestamp: string;
    status: "sent" | "delivered" | "read";
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

const INITIAL_CHAT_MEMBERS: ChatMember[] = [
    {
        id: "member-kshitij",
        name: "Kshitij Pilankar",
        phone: "+91 98765 43209",
        plan: "Smart Pass",
        streakDays: 12,
        avatarBg: "bg-emerald-600",
        unreadCount: 2,
        metaWindowActive: true,
        windowHoursRemaining: 18,
        dueDate: "2026-11-12",
        lastMessage: "Can I freeze my membership for next week?",
        lastTime: "11:42 AM",
        messages: [
            {
                id: "msg-k-1",
                sender: "admin",
                text: "Hi Kshitij, hope your chest & shoulder session went well yesterday! How is the recovery?",
                timestamp: "Yesterday 10:15 AM",
                status: "read",
            },
            {
                id: "msg-k-2",
                sender: "member",
                text: "Feeling great! Quick question: is openGym 3D muscle heatmap tracking available on mobile?",
                timestamp: "Yesterday 10:45 AM",
                status: "read",
            },
            {
                id: "msg-k-3",
                sender: "admin",
                text: "Yes, absolutely! Log into /portal/stats and you can inspect both front & back anatomy real-time.",
                timestamp: "Yesterday 10:50 AM",
                status: "read",
            },
            {
                id: "msg-k-4",
                sender: "member",
                text: "Awesome, thanks! Also, can I freeze my membership for next week as I'll be traveling for work?",
                timestamp: "Today 11:40 AM",
                status: "read",
            },
            {
                id: "msg-k-5",
                sender: "member",
                text: "Can I freeze my membership for next week?",
                timestamp: "Today 11:42 AM",
                status: "read",
            },
        ],
    },
    {
        id: "member-sachin",
        name: "Sachin Pilankar",
        phone: "+91 98765 43210",
        plan: "Smart Pass",
        streakDays: 18,
        avatarBg: "bg-blue-600",
        unreadCount: 0,
        metaWindowActive: true,
        windowHoursRemaining: 6,
        dueDate: "2026-11-05",
        lastMessage: "Thanks, I will pay tomorrow evening via UPI.",
        lastTime: "Yesterday",
        messages: [
            {
                id: "msg-s-1",
                sender: "admin",
                text: "Hi Sachin, reminder from IronCore Gym that your Smart Pass renewal of ₹2,499 is due on 2026-11-05. Keep your 18-day streak going! ⚡",
                timestamp: "Yesterday 04:15 PM",
                status: "read",
                isTemplate: true,
            },
            {
                id: "msg-s-2",
                sender: "member",
                text: "Got it! Thanks for the heads up. Can I pay via UPI directly at the front desk?",
                timestamp: "Yesterday 05:30 PM",
                status: "read",
            },
            {
                id: "msg-s-3",
                sender: "admin",
                text: "Yes Sachin! You can scan the reception QR code or pay via GPay. See you tomorrow!",
                timestamp: "Yesterday 05:35 PM",
                status: "read",
            },
            {
                id: "msg-s-4",
                sender: "member",
                text: "Thanks, I will pay tomorrow evening via UPI.",
                timestamp: "Yesterday 06:10 PM",
                status: "read",
            },
        ],
    },
    {
        id: "member-aman",
        name: "Aman Sharma",
        phone: "+91 98765 43211",
        plan: "Smart Pass",
        streakDays: 24,
        avatarBg: "bg-purple-600",
        unreadCount: 1,
        metaWindowActive: true,
        windowHoursRemaining: 21,
        dueDate: "2026-11-04",
        lastMessage: "Done chest & triceps today, feeling great!",
        lastTime: "Yesterday",
        messages: [
            {
                id: "msg-a-1",
                sender: "member",
                text: "Hey coach, what is the ideal rest duration between heavy bench press sets?",
                timestamp: "Nov 1 07:15 AM",
                status: "read",
            },
            {
                id: "msg-a-2",
                sender: "admin",
                text: "Hey Aman! For heavy compound sets (3-5 reps), take 2-3 mins. Use the new circular stopwatch ring in the portal history tab!",
                timestamp: "Nov 1 07:22 AM",
                status: "read",
            },
            {
                id: "msg-a-3",
                sender: "admin",
                text: "Great job hitting 24 consecutive days! You are currently Rank #2 on the November Streak Cup leaderboard 🔥",
                timestamp: "Yesterday 06:00 PM",
                status: "read",
            },
            {
                id: "msg-a-4",
                sender: "member",
                text: "Done chest & triceps today, feeling great!",
                timestamp: "Yesterday 07:15 PM",
                status: "read",
            },
        ],
    },
    {
        id: "member-sneha",
        name: "Sneha Patel",
        phone: "+91 98765 43213",
        plan: "Smart Pass",
        streakDays: 31,
        avatarBg: "bg-rose-600",
        unreadCount: 0,
        metaWindowActive: false,
        windowHoursRemaining: 0,
        dueDate: "2026-11-20",
        lastMessage: "Is the nutrition consultation included in the plan?",
        lastTime: "Nov 2",
        messages: [
            {
                id: "msg-sn-1",
                sender: "admin",
                text: "Congratulations Sneha! 31-day streak milestone unlocked 🏆 You are currently #1 for the November Whey Tub reward.",
                timestamp: "Nov 1 09:00 AM",
                status: "read",
            },
            {
                id: "msg-sn-2",
                sender: "member",
                text: "Thank you so much! Loving the workouts and routine consistency.",
                timestamp: "Nov 2 02:14 PM",
                status: "read",
            },
            {
                id: "msg-sn-3",
                sender: "member",
                text: "Is the nutrition consultation included in the plan?",
                timestamp: "Nov 2 02:15 PM",
                status: "read",
            },
            {
                id: "msg-sn-4",
                sender: "admin",
                text: "Yes! Smart Pass includes a monthly 1-on-1 macros and body composition scan. Let's schedule it for this Saturday.",
                timestamp: "Nov 2 02:40 PM",
                status: "read",
            },
        ],
    },
    {
        id: "member-vikram",
        name: "Vikram Malhotra",
        phone: "+91 98765 43214",
        plan: "Smart Pass",
        streakDays: 9,
        avatarBg: "bg-amber-600",
        unreadCount: 0,
        metaWindowActive: false,
        windowHoursRemaining: 0,
        dueDate: "2026-10-28",
        lastMessage: "Can you send the payment QR code again?",
        lastTime: "Oct 29",
        messages: [
            {
                id: "msg-v-1",
                sender: "admin",
                text: "Hi Vikram, your Smart Pass renewal was due on 2026-10-28. Please clear dues to ensure uninterrupted biometric gym access.",
                timestamp: "Oct 28 11:00 AM",
                status: "read",
                isTemplate: true,
            },
            {
                id: "msg-v-2",
                sender: "member",
                text: "Hi, I missed the date due to sudden travel. Can you send the payment QR code again?",
                timestamp: "Oct 29 10:20 AM",
                status: "read",
            },
            {
                id: "msg-v-3",
                sender: "admin",
                text: "Sure Vikram! IronCore UPI ID is ironcoregym@icici. Once paid, share screenshot here or reply.",
                timestamp: "Oct 29 10:35 AM",
                status: "read",
            },
        ],
    },
];

function ChatSuiteInner() {
    const searchParams = useSearchParams();
    const queryMember = searchParams.get("member") || "";

    const [members, setMembers] = useState<ChatMember[]>(INITIAL_CHAT_MEMBERS);
    const [selectedMemberId, setSelectedMemberId] = useState<string>("member-kshitij");
    const [searchQuery, setSearchQuery] = useState("");
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Load persisted chat state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("ironcore_crm_chat_roster");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMembers(parsed);
                }
            } catch (err) {
                console.error("Failed to parse saved chat roster:", err);
            }
        }
    }, []);

    // Handle initial query member selection (e.g. redirected from Admin table)
    useEffect(() => {
        if (queryMember) {
            const found = members.find(
                (m) => m.name.toLowerCase() === queryMember.toLowerCase() || m.id === queryMember
            );
            if (found) {
                setSelectedMemberId(found.id);
            }
        }
    }, [queryMember, members]);

    const activeMember = members.find((m) => m.id === selectedMemberId) || members[0];

    // Scroll to bottom of active conversation
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeMember.messages]);

    // Save helper
    const saveMembers = (updated: ChatMember[]) => {
        setMembers(updated);
        localStorage.setItem("ironcore_crm_chat_roster", JSON.stringify(updated));
    };

    // Mark active member unread count as read
    const selectMember = (id: string) => {
        setSelectedMemberId(id);
        const updated = members.map((m) => {
            if (m.id === id) {
                return { ...m, unreadCount: 0 };
            }
            return m;
        });
        saveMembers(updated);
    };

    // Quick Template Handlers
    const applyTemplate = (type: "fee" | "diet" | "streak" | "checkin") => {
        if (!activeMember) return;
        let text = "";
        if (type === "fee") {
            text = `Hi ${activeMember.name}, this is a reminder from IronCore Gym that your ${activeMember.plan} renewal of ₹2,499 is due on ${activeMember.dueDate}. Please renew to maintain your gym access and your ${activeMember.streakDays}-day streak! 💳`;
        } else if (type === "diet") {
            text = `Hey ${activeMember.name}! Coach check-in from IronCore Gym 🥗 How is your nutrition, protein intake, and hydration tracking this week? Let us know if you need any adjustments.`;
        } else if (type === "streak") {
            text = `Incredible dedication, ${activeMember.name}! 🔥 You've reached an impressive ${activeMember.streakDays}-day workout streak at IronCore Gym! Keep the intensity blazing!`;
        } else if (type === "checkin") {
            text = `Hi ${activeMember.name}! Coach here — did you complete your scheduled workout session today? Remember to log your sets in the IronCore Athlete Portal.`;
        }
        setInputText(text);
    };

    // Send Message Handler
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = inputText.trim();
        if (!trimmed || !activeMember) return;

        setIsSending(true);

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: "admin",
            text: trimmed,
            timestamp: timeStr,
            status: "sent",
            isTemplate: !activeMember.metaWindowActive,
        };

        const updatedMembers = members.map((m) => {
            if (m.id === activeMember.id) {
                return {
                    ...m,
                    lastMessage: trimmed,
                    lastTime: timeStr,
                    messages: [...m.messages, newMsg],
                };
            }
            return m;
        });

        saveMembers(updatedMembers);
        setInputText("");
        setIsSending(false);

        // Flash status banner
        setNotificationBanner(`Message dispatched to ${activeMember.name} via WhatsApp Gateway!`);
        setTimeout(() => setNotificationBanner(null), 3000);

        // Simulate delivery & read receipt after 1.5 seconds
        setTimeout(() => {
            setMembers((prev) =>
                prev.map((m) => {
                    if (m.id === activeMember.id) {
                        return {
                            ...m,
                            messages: m.messages.map((msg) =>
                                msg.id === newMsg.id ? { ...msg, status: "read" } : msg
                            ),
                        };
                    }
                    return m;
                })
            );
        }, 1500);
    };

    const filteredMembers = members.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.phone.includes(searchQuery)
    );

    return (
        <div className="min-h-screen bg-[#0a0b0e] text-[#f4f4f5] flex flex-col font-sans selection:bg-[#00ff87]/30">
            {/* Top Navigation Bar */}
            <header className="h-14 border-b border-zinc-800/80 bg-[#121418] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin"
                        className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors bg-[#1a1c22] px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700"
                    >
                        <span>←</span> Back to CRM
                    </Link>
                    <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00ff87] animate-pulse" />
                        <h1 className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                            IRONCORE <span className="text-[#00ff87]">WHATSAPP LIVE CRM</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-[#181a20] border border-zinc-800 text-zinc-400">
                        <span className="text-[#00ff87]">●</span> Meta Cloud API v20.0
                    </span>
                    <a
                        href={`https://wa.me/${activeMember.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-black bg-[#00ff87] hover:bg-[#00e57a] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                        <span>⚡</span>
                        <span className="hidden sm:inline">Direct WhatsApp Web</span>
                    </a>
                </div>
            </header>

            {/* Notification Banner */}
            {notificationBanner && (
                <div className="bg-[#00ff87]/15 border-b border-[#00ff87]/30 text-[#00ff87] text-xs font-semibold px-4 py-1.5 text-center transition-all flex items-center justify-center gap-2">
                    <span>✓</span> {notificationBanner}
                </div>
            )}

            {/* Main Chat Workstation Split Pane */}
            <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto p-2 sm:p-4 gap-3">
                {/* ================================================================= */}
                {/* LEFT SIDEBAR: MEMBER ROSTER                                       */}
                {/* ================================================================= */}
                <div className="w-80 sm:w-88 flex-shrink-0 bg-[#121418] border border-zinc-800/90 rounded-2xl flex flex-col overflow-hidden shadow-xl">
                    {/* Search & Header */}
                    <div className="p-3.5 border-b border-zinc-800/80 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black tracking-wider uppercase text-zinc-400">
                                Conversations ({members.length})
                            </h2>
                            <span className="text-[10px] font-mono text-[#00ff87] font-semibold bg-[#00ff87]/10 px-2 py-0.5 rounded border border-[#00ff87]/20">
                                Live Gateway
                            </span>
                        </div>

                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-zinc-500 text-xs">🔍</span>
                            <input
                                type="text"
                                placeholder="Search member name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#181a20] border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87]/60"
                            />
                        </div>
                    </div>

                    {/* Member List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/50">
                        {filteredMembers.map((member) => {
                            const isSelected = member.id === selectedMemberId;
                            return (
                                <button
                                    key={member.id}
                                    onClick={() => selectMember(member.id)}
                                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                                        isSelected
                                            ? "bg-[#1c1f26] border-l-4 border-l-[#00ff87]"
                                            : "hover:bg-[#181a20]/70"
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`w-10 h-10 rounded-xl ${member.avatarBg} flex-shrink-0 flex items-center justify-center font-black text-white text-sm shadow-md`}
                                    >
                                        {member.name.charAt(0)}
                                    </div>

                                    {/* Conversation Preview */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="font-bold text-xs text-white truncate">
                                                {member.name}
                                            </span>
                                            <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap">
                                                {member.lastTime}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                                                {member.plan}
                                            </span>
                                            <span className="text-[10px] text-amber-400 font-bold">
                                                🔥 {member.streakDays}d
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-zinc-400 truncate mt-1">
                                            {member.lastMessage}
                                        </p>
                                    </div>

                                    {/* Unread Badge */}
                                    {member.unreadCount > 0 && (
                                        <div className="w-5 h-5 rounded-full bg-[#00ff87] text-black text-[10px] font-black flex items-center justify-center flex-shrink-0 self-center">
                                            {member.unreadCount}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ================================================================= */}
                {/* CENTER / RIGHT PANEL: CHAT WORKSTATION                            */}
                {/* ================================================================= */}
                <div className="flex-1 bg-[#121418] border border-zinc-800/90 rounded-2xl flex flex-col overflow-hidden shadow-xl">
                    {/* Active Conversation Header */}
                    <div className="p-3.5 sm:p-4 border-b border-zinc-800/80 bg-[#15171d] flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-10 h-10 rounded-xl ${activeMember.avatarBg} flex items-center justify-center font-black text-white text-sm shadow`}
                            >
                                {activeMember.name.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm text-white">{activeMember.name}</h3>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00ff87]/10 text-[#00ff87] border border-[#00ff87]/30">
                                        {activeMember.plan}
                                    </span>
                                    <span className="text-[10px] font-bold text-amber-400">
                                        🔥 {activeMember.streakDays}d Streak
                                    </span>
                                </div>
                                <span className="text-xs font-mono text-zinc-400">
                                    {activeMember.phone} • Renewal Due: {activeMember.dueDate}
                                </span>
                            </div>
                        </div>

                        {/* Meta 24-Hour Window Badge */}
                        <div className="flex items-center gap-2">
                            {activeMember.metaWindowActive ? (
                                <div className="bg-[#00ff87]/10 border border-[#00ff87]/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-[#00ff87] uppercase block tracking-wider leading-tight">
                                            Meta 24h Window Active
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-400 block leading-tight">
                                            {activeMember.windowHoursRemaining}h remaining (Freeform enabled)
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-amber-400 uppercase block tracking-wider leading-tight">
                                            Template Message Mode
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-400 block leading-tight">
                                            Meta 24h window closed
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Template Action Pills Bar */}
                    <div className="px-3.5 py-2.5 bg-[#181a20] border-b border-zinc-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap pl-1">
                            Quick Templates:
                        </span>
                        <button
                            onClick={() => applyTemplate("fee")}
                            className="px-3 py-1 rounded-lg bg-[#20232a] hover:bg-[#282c35] text-zinc-200 border border-zinc-700/80 text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5"
                        >
                            <span>📅</span> Send Fee Reminder
                        </button>
                        <button
                            onClick={() => applyTemplate("diet")}
                            className="px-3 py-1 rounded-lg bg-[#20232a] hover:bg-[#282c35] text-zinc-200 border border-zinc-700/80 text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5"
                        >
                            <span>🥗</span> Send Diet Follow-up
                        </button>
                        <button
                            onClick={() => applyTemplate("streak")}
                            className="px-3 py-1 rounded-lg bg-[#20232a] hover:bg-[#282c35] text-zinc-200 border border-zinc-700/80 text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5"
                        >
                            <span>🔥</span> Send Streak Congratulation
                        </button>
                        <button
                            onClick={() => applyTemplate("checkin")}
                            className="px-3 py-1 rounded-lg bg-[#20232a] hover:bg-[#282c35] text-zinc-200 border border-zinc-700/80 text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5"
                        >
                            <span>🏋️</span> Workout Check-in
                        </button>
                    </div>

                    {/* Messages Thread Canvas */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#0c0d11]">
                        {/* Session Date Indicator */}
                        <div className="flex justify-center my-2">
                            <span className="bg-[#181a20] border border-zinc-800 text-zinc-400 text-[10px] font-mono px-3 py-1 rounded-full uppercase tracking-wider">
                                End-to-End Encrypted via Meta WhatsApp Cloud API
                            </span>
                        </div>

                        {activeMember.messages.map((msg) => {
                            const isAdmin = msg.sender === "admin";
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-md transition-all ${
                                            isAdmin
                                                ? "bg-[#0b3823] text-emerald-50 rounded-tr-xs border border-[#00ff87]/30"
                                                : "bg-[#181a20] text-zinc-100 rounded-tl-xs border border-zinc-800"
                                        }`}
                                    >
                                        {msg.isTemplate && (
                                            <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-[#00ff87] block mb-1">
                                                ★ Verified Meta Template
                                            </span>
                                        )}
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        <div
                                            className={`flex items-center gap-1 justify-end text-[10px] font-mono mt-1 ${
                                                isAdmin ? "text-emerald-300/80" : "text-zinc-500"
                                            }`}
                                        >
                                            <span>{msg.timestamp}</span>
                                            {isAdmin && (
                                                <span className="text-[#00ff87] font-bold">
                                                    {msg.status === "read" ? "✓✓" : "✓"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Bottom Message Input Bar */}
                    <div className="p-3 sm:p-4 border-t border-zinc-800/80 bg-[#15171d]">
                        {!activeMember.metaWindowActive && (
                            <div className="mb-2 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center justify-between">
                                <span>
                                    ⚠️ Meta 24-Hour window expired. Outgoing message will be sent as a verified HSM template.
                                </span>
                                <span className="font-bold text-amber-300 text-[10px]">HSM Mode</span>
                            </div>
                        )}

                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder={
                                    activeMember.metaWindowActive
                                        ? `Reply to ${activeMember.name} (Meta 24h window active)...`
                                        : `Select a quick template above or compose template message...`
                                }
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="flex-1 bg-[#1c1f26] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87]/80"
                            />

                            <button
                                type="submit"
                                disabled={!inputText.trim() || isSending}
                                className="bg-[#00ff87] hover:bg-[#00e57a] disabled:opacity-40 disabled:hover:bg-[#00ff87] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 flex-shrink-0"
                            >
                                <span>Send</span>
                                <span>➤</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminChatPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#0a0b0e] text-white flex items-center justify-center text-xs font-mono">
                    Loading IronCore WhatsApp CRM...
                </div>
            }
        >
            <ChatSuiteInner />
        </Suspense>
    );
}
