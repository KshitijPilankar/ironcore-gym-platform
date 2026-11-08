"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { currentGym } from "@/gymConfig";

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

interface Member {
    id: string;
    name: string;
    phone: string;
    plan: string;
    dueDate: string;
    streakDays: number;
    status: "Due" | "Paid" | "Overdue";
}

const DEFAULT_MEMBER: Member = {
    id: "mem-kshitij",
    name: "Kshitij Pilankar",
    phone: "919004884885",
    plan: "Smart Pass",
    dueDate: "2026-11-20",
    streakDays: 2,
    status: "Due",
};

export default function AthleteSupportFullPage() {
    const [member, setMember] = useState<Member>(DEFAULT_MEMBER);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let activeMember: Member = DEFAULT_MEMBER;

        try {
            const storedActive = localStorage.getItem("ironcore_active_member");
            if (storedActive) {
                const parsed = JSON.parse(storedActive);
                if (parsed && typeof parsed === "object" && parsed.name) {
                    activeMember = { ...DEFAULT_MEMBER, ...parsed };
                }
            } else {
                const storedMembers = localStorage.getItem("ironcore_members_db");
                if (storedMembers) {
                    const membersList: Member[] = JSON.parse(storedMembers);
                    if (Array.isArray(membersList) && membersList.length > 0) {
                        activeMember = { ...DEFAULT_MEMBER, ...membersList[0] };
                    }
                }
            }
        } catch (e) {
            console.error("Failed to load member profile", e);
        }

        setMember(activeMember);

        const memberName = activeMember ? activeMember.name : "Athlete";
        const savedRoster = localStorage.getItem("ironcore_crm_chat_roster");

        if (savedRoster) {
            try {
                const roster: ChatMember[] = JSON.parse(savedRoster);
                const matching = roster.find(
                    (m) => m.name.toLowerCase() === memberName.toLowerCase()
                );
                if (matching && matching.messages && matching.messages.length > 0) {
                    setMessages(matching.messages);
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
        setMessages(initialMsgs);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (textToSend?: string) => {
        const content = textToSend || inputText;
        if (!content.trim() || !member) return;

        const timeStr = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: "member",
            text: content.trim(),
            timestamp: timeStr,
            status: "delivered",
        };

        const updatedMessages = [...messages, newMsg];
        setMessages(updatedMessages);
        setInputText("");

        // Sync with CRM roster
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
                        lastMessage: content.trim(),
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

        // Instant automated desk acknowledgment
        setTimeout(() => {
            const replyMsg: ChatMessage = {
                id: `reply-${Date.now()}`,
                sender: "admin",
                text: "Thanks for reaching out! A coach or desk manager has received your message and will respond shortly. You can also tap 'Direct WhatsApp' above for urgent inquiries.",
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                status: "read",
            };
            setMessages((prev) => [...prev, replyMsg]);
        }, 1200);
    };

    const directWhatsAppUrl = `https://wa.me/${currentGym.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hi ${currentGym.name} Coach, this is ${member.name} (${member.plan}). I need assistance with my workout plan & desk support.`
    )}`;

    return (
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] pt-8 sm:pt-10 pb-20 px-4 sm:px-8 font-sans selection:bg-[#00ff87]/30">
            <div className="max-w-4xl mx-auto space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
                    <div>
                        <Link
                            href="/portal"
                            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 mb-2"
                        >
                            ← Back to Athlete Hub
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            COACH & DESK <span className="text-[#00ff87]">LIVE SUPPORT</span>
                        </h1>
                        <p className="text-xs text-zinc-400 mt-1">
                            Direct two-way channel with IronCore coaches, trainers, and front-desk staff.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-[#141518] border border-zinc-800 px-3.5 py-2 rounded-xl flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff87] animate-pulse" />
                            <span className="text-xs font-mono font-bold text-zinc-200">
                                Desk Online • Reply &lt; 5m
                            </span>
                        </div>

                        <a
                            href={directWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#00ff87] hover:bg-[#00e57a] text-black font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-[#00ff87]/20 flex items-center gap-1.5"
                        >
                            <span>📱</span> Direct WhatsApp
                        </a>
                    </div>
                </div>

                {/* Quick Inquiry Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 whitespace-nowrap">
                        Quick Inquiries:
                    </span>
                    {[
                        "❄️ Freeze Membership for 1 Week",
                        "🥗 Need advice on my daily protein intake",
                        "💳 When does my Smart Pass renew?",
                        "🏋️ Form feedback for Squat / Deadlift",
                    ].map((pill, i) => (
                        <button
                            key={i}
                            onClick={() => handleSendMessage(pill)}
                            className="px-3 py-1.5 rounded-lg bg-[#141518] hover:bg-[#1b1c20] text-zinc-300 hover:text-[#00ff87] border border-zinc-800 text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer"
                        >
                            {pill}
                        </button>
                    ))}
                </div>

                {/* Main Full-Screen Conversation Window */}
                <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl shadow-xl flex flex-col h-[580px] overflow-hidden">
                    {/* Channel Info Strip */}
                    <div className="bg-[#181a20] px-5 py-3 border-b border-zinc-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#00ff87]/15 border border-[#00ff87]/40 flex items-center justify-center text-sm font-black text-[#00ff87]">
                                IC
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                    IronCore Head Coach & Desk
                                    <span className="text-[9px] bg-zinc-800 text-[#00ff87] px-1.5 py-0.5 rounded font-mono">
                                        VERIFIED
                                    </span>
                                </h3>
                                <span className="text-[10px] font-mono text-zinc-400">
                                    {member.name} ({member.plan} • {member.phone})
                                </span>
                            </div>
                        </div>

                        <span className="text-[10px] font-mono text-zinc-500 bg-[#121418] px-2.5 py-1 rounded-lg border border-zinc-800">
                            Meta Cloud API Synchronized
                        </span>
                    </div>

                    {/* Scrollable Message Thread */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-[#0e0e10]/60">
                        <div className="text-center my-2">
                            <span className="text-[10px] font-mono text-zinc-500 bg-[#141518] px-3 py-1 rounded-full border border-zinc-800/80">
                                Official Athlete Communication Gateway
                            </span>
                        </div>

                        {messages.map((msg) => {
                            const isMe = msg.sender === "member";
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${isMe ? "items-end" : "items-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[78%] sm:max-w-[65%] rounded-2xl p-3.5 text-xs shadow-md space-y-1.5 ${isMe
                                                ? "bg-[#0b3b24] text-white border border-[#00ff87]/40 rounded-tr-xs"
                                                : "bg-[#181a20] text-zinc-200 border border-zinc-800 rounded-tl-xs"
                                            }`}
                                    >
                                        <p className="leading-relaxed whitespace-pre-wrap">
                                            {msg.text}
                                        </p>
                                        <div
                                            className={`flex items-center gap-1.5 text-[9px] font-mono ${isMe
                                                    ? "text-[#00ff87] justify-end"
                                                    : "text-zinc-500 justify-start"
                                                }`}
                                        >
                                            <span>{msg.timestamp}</span>
                                            {isMe && <span className="font-bold">✓✓</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Bottom Message Input Bar */}
                    <div className="p-3.5 bg-[#181a20] border-t border-zinc-800/80">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="text"
                                placeholder="Type your message to coach or front desk..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="flex-1 bg-[#121418] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87]"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="bg-[#00ff87] disabled:bg-zinc-800 disabled:text-zinc-600 hover:bg-[#00e57a] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#00ff87]/20 flex items-center gap-1.5 cursor-pointer"
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