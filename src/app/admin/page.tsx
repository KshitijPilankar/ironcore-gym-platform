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
        id: "1",
        name: "Sachin Pilankar",
        phone: "919876543210",
        plan: "Smart Pass",
        dueDate: "2026-11-05",
        streakDays: 18,
        status: "Due",
    },
    {
        id: "2",
        name: "Aman Sharma",
        phone: "919876543211",
        plan: "Smart Pass",
        dueDate: "2026-11-04",
        streakDays: 24,
        status: "Due",
    },
    {
        id: "3",
        name: "Rohan Verma",
        phone: "919876543212",
        plan: "Standard",
        dueDate: "2026-11-02",
        streakDays: 14,
        status: "Due",
    },
    {
        id: "4",
        name: "Sneha Patel",
        phone: "919876543213",
        plan: "Smart Pass",
        dueDate: "2026-11-20",
        streakDays: 31,
        status: "Paid",
    },
    {
        id: "5",
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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Form State
    const [newMember, setNewMember] = useState({
        name: "",
        phone: "",
        plan: "Smart Pass",
        dueDate: "",
        streakDays: 1,
    });

    // 1. LocalStorage se saved members load karo (Refresh persistence)
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

    // 2. State + LocalStorage dono me data save karne ka helper
    const updateMembersState = (updatedList: Member[]) => {
        setMembers(updatedList);
        localStorage.setItem("ironcore_members_db", JSON.stringify(updatedList));
    };

    // 3. New Member Add Handler
    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMember.name || !newMember.phone || !newMember.dueDate) {
            alert("Kripya sabhi zaroori fields bharein!");
            return;
        }

        const memberToAdd: Member = {
            id: Date.now().toString(),
            name: newMember.name.trim(),
            phone: newMember.phone.trim(),
            plan: newMember.plan,
            dueDate: newMember.dueDate,
            streakDays: Number(newMember.streakDays) || 1,
            status: "Due",
        };

        const updated = [memberToAdd, ...members];
        updateMembersState(updated);

        // Reset & close modal
        setNewMember({
            name: "",
            phone: "",
            plan: "Smart Pass",
            dueDate: "",
            streakDays: 1,
        });
        setIsAddModalOpen(false);
    };

    // 4. Meta Cloud API Send Reminder Trigger
    const sendWhatsAppReminder = async (member: Member) => {
        setSendingId(member.id);

        try {
            const res = await fetch("/api/send-reminder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: member.phone,
                    memberName: member.name,
                    dueDate: member.dueDate,
                    plan: member.plan,
                    streakDays: member.streakDays,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                alert(`✅ Meta Cloud API: Reminder successfully sent to ${member.name}!`);
            } else {
                alert(`❌ Send failed: ${data.error || "Unknown API Error"}`);
            }
        } catch (err: any) {
            console.error(err);
            alert("⚠️ Request failed. Server check karo.");
        } finally {
            setSendingId(null);
        }
    };

    // Search filter
    const filteredMembers = members.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
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

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-[#00ff87] hover:bg-[#00e57a] text-black font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-[#00ff87]/20 active:scale-95"
                            >
                                <span>+</span> Add Member
                            </button>
                            <button className="bg-[#1b1c20] hover:bg-[#23252a] text-zinc-300 font-medium text-xs px-3.5 py-2.5 rounded-lg border border-zinc-800 transition-all flex items-center gap-1.5">
                                openGym Engine 🚀
                            </button>
                        </div>
                    </div>
                </div>

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
                                placeholder="Search member name..."
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
                                {filteredMembers.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-[#1a1b1f]/60 transition-colors"
                                    >
                                        <td className="py-3.5 font-semibold text-zinc-100">
                                            {member.name}
                                        </td>
                                        <td className="py-3.5 text-zinc-400">{member.plan}</td>
                                        <td className="py-3.5 text-zinc-400 font-mono">
                                            {member.dueDate}
                                        </td>
                                        <td className="py-3.5">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                🔥 {member.streakDays}d
                                            </span>
                                        </td>
                                        <td className="py-3.5">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${member.status === "Paid"
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
                                            <button
                                                onClick={() => sendWhatsAppReminder(member)}
                                                disabled={sendingId === member.id}
                                                className="bg-[#00ff87]/10 hover:bg-[#00ff87]/20 border border-[#00ff87]/30 text-[#00ff87] disabled:opacity-50 text-[11px] font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all active:scale-95"
                                            >
                                                {sendingId === member.id ? (
                                                    <>
                                                        <span className="animate-spin text-xs">🌀</span>
                                                        <span>Sending...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>💬</span>
                                                        <span>Send Reminder</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
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
                            <span className="text-xs font-bold text-amber-400">🔥 31d</span>
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
                            <span className="text-xs font-bold text-amber-400">🔥 24d</span>
                        </div>

                        <div className="bg-[#1b1c20] border border-zinc-800/80 rounded-lg p-3.5 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                                    Rank #3
                                </span>
                                <span className="text-xs font-semibold text-zinc-200 mt-0.5 block">
                                    Rohan Verma
                                </span>
                            </div>
                            <span className="text-xs font-bold text-amber-400">🔥 14d</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                    <div className="bg-[#141518] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <span>➕</span> Add New Member
                            </h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-zinc-500 hover:text-white text-sm"
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
                                    placeholder="e.g. 919876543210"
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
                                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-[#00ff87] hover:bg-[#00e57a] text-black font-semibold transition-colors shadow-lg shadow-[#00ff87]/20"
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