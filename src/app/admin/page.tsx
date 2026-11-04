"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Member {
    id: string;
    name: string;
    phone: string;
    plan: string;
    dueDate: string;
    streakDays: number;
    status: "Due" | "Paid" | "Overdue";
}

const DEFAULT_MEMBERS: Member[] = [
    {
        id: "0",
        name: "Kshitij Pilankar",
        phone: "919004884885",
        plan: "Smart Pass",
        dueDate: "2026-11-12",
        streakDays: 12,
        status: "Due",
    },
    {
        id: "1",
        name: "Sneha Pilankar",
        phone: "919087799948",
        plan: "Smart Pass",
        dueDate: "2026-11-28",
        streakDays: 20,
        status: "Due",
    },
    {
        id: "2",
        name: "Sachin Pilankar",
        phone: "919876543210",
        plan: "Smart Pass",
        dueDate: "2026-11-05",
        streakDays: 18,
        status: "Due",
    },
    {
        id: "3",
        name: "Aman Sharma",
        phone: "919876543211",
        plan: "Smart Pass",
        dueDate: "2026-11-04",
        streakDays: 24,
        status: "Due",
    },
    {
        id: "4",
        name: "Rohan Verma",
        phone: "919876543212",
        plan: "Standard",
        dueDate: "2026-11-02",
        streakDays: 14,
        status: "Due",
    },
    {
        id: "5",
        name: "Sneha Patel",
        phone: "919876543213",
        plan: "Smart Pass",
        dueDate: "2026-11-20",
        streakDays: 31,
        status: "Paid",
    },
    {
        id: "6",
        name: "Vikram Malhotra",
        phone: "919876543214",
        plan: "Smart Pass",
        dueDate: "2026-10-28",
        streakDays: 9,
        status: "Overdue",
    },
];

export default function GymAdminDashboard() {
    const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
    const [searchQuery, setSearchQuery] = useState("");
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [sentId, setSentId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [feedbackToast, setFeedbackToast] = useState<{
        type: "success" | "warning" | "error";
        text: string;
        actionUrl?: string;
    } | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Form State
    const [newMember, setNewMember] = useState({
        name: "",
        phone: "",
        plan: "Smart Pass",
        dueDate: "",
        streakDays: 1,
    });

    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem("ironcore_members_db");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMembers(parsed);
                }
            } catch (err) {
                console.error("Failed to parse stored members:", err);
            }
        }
    }, []);

    const updateMembersState = (updatedList: Member[]) => {
        setMembers(updatedList);
        localStorage.setItem("ironcore_members_db", JSON.stringify(updatedList));
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMember.name || !newMember.phone || !newMember.dueDate) {
            alert("Kripya sabhi zaroori fields bharein!");
            return;
        }

        const cleanPhone = newMember.phone.replace(/[^0-9]/g, "");
        const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

        const memberToAdd: Member = {
            id: Date.now().toString(),
            name: newMember.name.trim(),
            phone: formattedPhone,
            plan: newMember.plan,
            dueDate: newMember.dueDate,
            streakDays: Number(newMember.streakDays) || 1,
            status: "Due",
        };

        const updated = [memberToAdd, ...members];
        updateMembersState(updated);

        setNewMember({
            name: "",
            phone: "",
            plan: "Smart Pass",
            dueDate: "",
            streakDays: 1,
        });
        setIsAddModalOpen(false);
    };

    // Helper: Formats 100% personalized message url for WhatsApp Web
    const buildPersonalizedWhatsAppUrl = (m: Member) => {
        const renewalPrice = m.plan === "Smart Pass" ? "1,999" : "1,499";
        const message =
            `🏋️ *IronCore Fitness • Membership Renewal Alert*\n\n` +
            `Hi *${m.name}*! 👋\n\n` +
            `Aapka *${m.plan}* subscription *${m.dueDate}* ko renew hone wala hai.\n\n` +
            `🔥 *Workout Streak:* *${m.streakDays} Days Unbroken!*\n` +
            `Top 3 consistency leaderboard me bane rehne aur monthly rewards ke liye apna pass time par renew karein.\n\n` +
            `💳 *Renewal Amount:* ₹${renewalPrice}/month\n` +
            `⚡ *Payment:* Gym front desk par UPI scan karein ya online renew karein.\n\n` +
            `Stay Strong! 💪`;
        return `https://wa.me/${m.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
    };

    // Smart Dispatch Handler: Meta Cloud API -> Auto-fallback to WhatsApp Web on sandbox whitelist error
    const handleSmartReminderDispatch = async (member: Member) => {
        setSendingId(member.id);
        setFeedbackToast(null);

        const fallbackUrl = buildPersonalizedWhatsAppUrl(member);

        try {
            const res = await fetch("/api/whatsapp/send-reminder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: member.name,
                    phone: member.phone,
                    plan: member.plan,
                    dueDate: member.dueDate,
                    streakDays: member.streakDays,
                    amount: member.plan === "Smart Pass" ? "1,999" : "1,499",
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Success directly through Meta Cloud API
                setSentId(member.id);
                setFeedbackToast({
                    type: "success",
                    text: `✓ Meta Cloud API: Personalized reminder WhatsApp par successfully deliver ho gaya to ${member.name} (+${member.phone})`,
                });
                setTimeout(() => setSentId(null), 4000);
            } else {
                // Auto Fallback: Check if it's the Meta Sandbox #131030 error
                const isSandboxError =
                    typeof data.error === "string" &&
                    (data.error.includes("131030") || data.error.includes("allowed list"));

                if (isSandboxError) {
                    // Open WhatsApp Web immediately in a new tab without requiring sandbox whitelist
                    window.open(fallbackUrl, "_blank");

                    setSentId(member.id);
                    setFeedbackToast({
                        type: "warning",
                        text: `⚡ Meta Sandbox restriction bypassed: WhatsApp Web auto-launch ho gaya hai with pre-filled message for ${member.name}!`,
                        actionUrl: fallbackUrl,
                    });
                    setTimeout(() => setSentId(null), 4000);
                } else {
                    setFeedbackToast({
                        type: "error",
                        text: `API Error: ${data.error || "Failed to dispatch"}. Direct WhatsApp Web use karein.`,
                        actionUrl: fallbackUrl,
                    });
                }
            }
        } catch {
            // Network fallback
            window.open(fallbackUrl, "_blank");
            setFeedbackToast({
                type: "warning",
                text: `Network unreachable: WhatsApp Web auto-launch ho gaya hai for ${member.name}.`,
                actionUrl: fallbackUrl,
            });
        } finally {
            setSendingId(null);
        }
    };

    const filteredMembers = members.filter(
        (m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.phone.includes(searchQuery)
    );

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] p-6 lg:p-10 font-sans selection:bg-[#00ff87]/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Navigation & Header */}
                <div>
                    <Link
                        href="/"
                        className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 mb-3"
                    >
                        ← Back to IronCore Site
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                IRONCORE CRM &{" "}
                                <span className="text-[#00ff87]">WHATSAPP BILLING</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                                Manage memberships, collect renewals, and track top gym streaks.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                            <Link
                                href="/admin/chat"
                                className="bg-[#1b1c20] hover:bg-[#23252a] text-[#00ff87] border border-[#00ff87]/40 hover:border-[#00ff87] font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                            >
                                <span>💬</span> Member Live Chat
                            </Link>

                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-[#00ff87] hover:bg-[#00e57a] text-black font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-[#00ff87]/20 active:scale-95 cursor-pointer"
                            >
                                <span>+</span> Add Member
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feedback Toast Notification Banner */}
                {feedbackToast && (
                    <div
                        className={`p-4 rounded-2xl text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl ${feedbackToast.type === "success"
                                ? "bg-[#00ff87]/10 border border-[#00ff87]/40 text-[#00ff87]"
                                : feedbackToast.type === "warning"
                                    ? "bg-amber-500/10 border border-amber-500/40 text-amber-300"
                                    : "bg-red-500/10 border border-red-500/40 text-red-400"
                            }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="text-sm">
                                {feedbackToast.type === "success"
                                    ? "✓"
                                    : feedbackToast.type === "warning"
                                        ? "⚡"
                                        : "⚠️"}
                            </span>
                            <span className="leading-relaxed">{feedbackToast.text}</span>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            {feedbackToast.actionUrl && (
                                <a
                                    href={feedbackToast.actionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#00ff87] hover:bg-[#00e57a] text-black px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap"
                                >
                                    <span>Open WhatsApp Web</span>
                                    <span>↗</span>
                                </a>
                            )}
                            <button
                                onClick={() => setFeedbackToast(null)}
                                className="text-zinc-400 hover:text-white px-2 py-1 text-xs cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Top Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 shadow-sm">
                        <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                            Active Members
                        </span>
                        <div className="text-3xl font-extrabold text-white mt-1">
                            {145 + members.length}
                        </div>
                    </div>

                    <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 shadow-sm">
                        <span className="text-[11px] font-semibold tracking-wider text-amber-500 uppercase">
                            Renewals Due This Week
                        </span>
                        <div className="text-3xl font-extrabold text-white mt-1">13</div>
                    </div>

                    <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 shadow-sm">
                        <span className="text-[11px] font-semibold tracking-wider text-[#00ff87] uppercase">
                            Smart Pass Subscriptions
                        </span>
                        <div className="text-3xl font-extrabold text-white mt-1">65</div>
                    </div>
                </div>

                {/* Renewal Management Table Container */}
                <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-amber-500 text-base">🛡️</span>
                            <h2 className="text-sm font-bold tracking-wide text-zinc-200">
                                Renewal Management
                            </h2>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <span className="absolute left-3 top-2.5 text-zinc-500 text-xs">
                                🔍
                            </span>
                            <input
                                type="text"
                                placeholder="Search member name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#1b1c20] border border-zinc-800/90 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87]/60"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="text-zinc-500 border-b border-zinc-800/80 pb-2">
                                    <th className="py-3 font-medium">Member</th>
                                    <th className="py-3 font-medium">Plan</th>
                                    <th className="py-3 font-medium">Due Date</th>
                                    <th className="py-3 font-medium">Streak</th>
                                    <th className="py-3 font-medium">Status</th>
                                    <th className="py-3 font-medium text-right">Quick Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {filteredMembers.map((member) => {
                                    const isSending = sendingId === member.id;
                                    const isSent = sentId === member.id;

                                    return (
                                        <tr
                                            key={member.id}
                                            className="hover:bg-[#1a1b1f]/60 transition-colors"
                                        >
                                            <td className="py-3.5 font-semibold text-zinc-100">
                                                <div>{member.name}</div>
                                                <div className="text-[10px] font-mono font-normal text-zinc-500">
                                                    +{member.phone}
                                                </div>
                                            </td>
                                            <td className="py-3.5 text-zinc-400 font-mono">{member.plan}</td>
                                            <td className="py-3.5 text-zinc-400 font-mono">
                                                {member.dueDate}
                                            </td>
                                            <td className="py-3.5">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                                                    🔥 {member.streakDays}d
                                                </span>
                                            </td>
                                            <td className="py-3.5">
                                                <span
                                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${member.status === "Paid"
                                                            ? "bg-[#00ff87]/10 text-[#00ff87]"
                                                            : member.status === "Overdue"
                                                                ? "bg-red-500/10 text-red-400"
                                                                : "bg-amber-500/10 text-amber-400"
                                                        }`}
                                                >
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Primary 1-Click Action: Smart API Dispatch with auto-fallback */}
                                                    <button
                                                        onClick={() => handleSmartReminderDispatch(member)}
                                                        disabled={isSending}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all shadow-sm active:scale-95 cursor-pointer ${isSent
                                                                ? "bg-[#00ff87]/20 border border-[#00ff87] text-[#00ff87]"
                                                                : isSending
                                                                    ? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
                                                                    : "bg-[#00ff87]/10 hover:bg-[#00ff87]/20 border border-[#00ff87]/30 text-[#00ff87]"
                                                            }`}
                                                    >
                                                        {isSending ? (
                                                            <>
                                                                <span className="animate-spin text-xs">🌀</span>
                                                                <span>Sending...</span>
                                                            </>
                                                        ) : isSent ? (
                                                            <>
                                                                <span>✓</span>
                                                                <span>Dispatched</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>💬</span>
                                                                <span>Send Reminder</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    {/* Direct 1-Click WhatsApp Web Trigger */}
                                                    <a
                                                        href={buildPersonalizedWhatsAppUrl(member)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-2.5 py-1.5 rounded-lg bg-[#181a20] hover:bg-[#252830] text-zinc-400 hover:text-[#00ff87] border border-zinc-800 transition-colors text-xs font-semibold flex items-center gap-1"
                                                        title="Direct WhatsApp Web (No Meta sandbox restrictions)"
                                                    >
                                                        <span>📱</span>
                                                        <span className="hidden sm:inline text-[10px]">WA</span>
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Monthly Streak Cup Banner */}
                <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[#00ff87] text-base">🎗️</span>
                                <h3 className="text-sm font-bold text-zinc-200">
                                    Monthly Streak Cup (November 2026)
                                </h3>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Top consistent members eligible for Whey Protein & Gym
                                Merchandise rewards.
                            </p>
                        </div>
                        <div className="self-start sm:self-auto bg-[#1e2025] border border-zinc-800 text-zinc-300 text-[10px] font-semibold px-3 py-1 rounded-full">
                            Reward: 1x Isolate Whey Tub
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="bg-[#1b1c20] border border-zinc-800/80 rounded-lg p-3.5 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-[#00ff87] uppercase tracking-wider block">
                                    Rank #1
                                </span>
                                <span className="text-xs font-semibold text-zinc-200 mt-0.5 block">
                                    Sneha Patel
                                </span>
                            </div>
                            <span className="text-xs font-bold text-amber-400 font-mono">🔥 31d</span>
                        </div>

                        <div className="bg-[#1b1c20] border border-zinc-800/80 rounded-lg p-3.5 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                                    Rank #2
                                </span>
                                <span className="text-xs font-semibold text-zinc-200 mt-0.5 block">
                                    Aman Sharma
                                </span>
                            </div>
                            <span className="text-xs font-bold text-amber-400 font-mono">🔥 24d</span>
                        </div>

                        <div className="bg-[#1b1c20] border border-zinc-800/80 rounded-lg p-3.5 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                                    Rank #3
                                </span>
                                <span className="text-xs font-semibold text-zinc-200 mt-0.5 block">
                                    Sachin Pilankar
                                </span>
                            </div>
                            <span className="text-xs font-bold text-amber-400 font-mono">🔥 18d</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div className="bg-[#141518] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <span>➕</span> Add New Member
                            </h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-zinc-500 hover:text-white text-sm cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddMember} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block text-zinc-400 mb-1 font-medium">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Rahul Sharma"
                                    value={newMember.name}
                                    onChange={(e) =>
                                        setNewMember({ ...newMember, name: e.target.value })
                                    }
                                    className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                />
                            </div>

                            <div>
                                <label className="block text-zinc-400 mb-1 font-medium">
                                    WhatsApp Phone (with Country Code)
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 919004884885"
                                    value={newMember.phone}
                                    onChange={(e) =>
                                        setNewMember({ ...newMember, phone: e.target.value })
                                    }
                                    className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-zinc-400 mb-1 font-medium">
                                        Plan
                                    </label>
                                    <select
                                        value={newMember.plan}
                                        onChange={(e) =>
                                            setNewMember({ ...newMember, plan: e.target.value })
                                        }
                                        className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                    >
                                        <option value="Smart Pass">Smart Pass</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Elite VIP">Elite VIP</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-zinc-400 mb-1 font-medium">
                                        Current Streak (Days)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newMember.streakDays}
                                        onChange={(e) =>
                                            setNewMember({
                                                ...newMember,
                                                streakDays: Number(e.target.value),
                                            })
                                        }
                                        className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-zinc-400 mb-1 font-medium">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={newMember.dueDate}
                                    onChange={(e) =>
                                        setNewMember({ ...newMember, dueDate: e.target.value })
                                    }
                                    className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-[#00ff87] hover:bg-[#00e57a] text-black font-semibold transition-colors shadow-lg shadow-[#00ff87]/20 cursor-pointer"
                                >
                                    Save Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}