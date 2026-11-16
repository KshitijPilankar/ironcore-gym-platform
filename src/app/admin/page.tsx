"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Member {
    id: string;
    name: string;
    phone: string;
    plan: string;
    dueDate: string;
    streakDays: number;
    status: "Due" | "Paid" | "Overdue";
}

interface PaymentTx {
    id: string;
    paymentId: string;
    orderId?: string;
    amount: number;
    planName: string;
    memberPhone?: string;
    memberName?: string;
    date: string;
    time: string;
    status: string;
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
    const router = useRouter();
    const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
    const [payments, setPayments] = useState<PaymentTx[]>([]);
    const [activeTab, setActiveTab] = useState<"members" | "payments">("members");
    const [searchQuery, setSearchQuery] = useState("");
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [sentId, setSentId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Edit Member Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    // Cash / Desk Payment Modal State
    const [isCashModalOpen, setIsCashModalOpen] = useState(false);
    const [cashForm, setCashForm] = useState({
        memberId: "",
        name: "",
        phone: "",
        plan: "Smart Athlete Pass",
        amount: "1999",
        mode: "Cash at Desk",
        notes: "",
    });

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

        // 1. Load CRM Members from storage
        let initialMembers = DEFAULT_MEMBERS;
        const saved = localStorage.getItem("ironcore_members_db");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    initialMembers = parsed;
                }
            } catch (err) {
                console.error("Failed to parse stored members:", err);
            }
        }

        // 2. Load payments from local storage
        let localPayments: PaymentTx[] = [];
        try {
            const savedPayments = localStorage.getItem("ironcore_payments_db");
            if (savedPayments) {
                const parsed = JSON.parse(savedPayments);
                if (Array.isArray(parsed)) {
                    localPayments = parsed;
                }
            }
        } catch (err) {
            console.error("Failed to parse stored payments:", err);
        }

        // 3. Fetch server/Supabase synced members
        fetch("/api/members")
            .then((r) => r.json())
            .then((data) => {
                if (data?.members && Array.isArray(data.members) && data.members.length > 0) {
                    const phoneMap = new Map<string, Member>();
                    data.members.forEach((m: Member) => {
                        const key = m.phone.replace(/[^0-9]/g, "").slice(-10);
                        phoneMap.set(key, m);
                    });
                    initialMembers.forEach((m) => {
                        const key = m.phone.replace(/[^0-9]/g, "").slice(-10);
                        if (!phoneMap.has(key)) phoneMap.set(key, m);
                    });
                    const synced = Array.from(phoneMap.values());
                    initialMembers = synced;
                    setMembers(synced);
                    localStorage.setItem("ironcore_members_db", JSON.stringify(synced));
                }
            })
            .catch(() => {});

        // 4. Fetch server-logged transactions and merge
        fetch("/api/payment/transactions")
            .then((r) => r.json())
            .then((data) => {
                const serverPayments: PaymentTx[] = data?.transactions || [];
                const map = new Map<string, PaymentTx>();
                [...localPayments, ...serverPayments].forEach((p) => {
                    if (p.paymentId) map.set(p.paymentId, p);
                });
                const merged = Array.from(map.values());
                setPayments(merged);

                // Auto-sync: If member has a captured payment, mark them as Paid
                const updatedMembers = initialMembers.map((m) => {
                    const cleanPhone = m.phone.replace(/[^0-9]/g, "");
                    const hasPaid = merged.some(
                        (p) =>
                            p.memberPhone &&
                            (p.memberPhone.includes(cleanPhone) ||
                                cleanPhone.includes(p.memberPhone.slice(-10)))
                    );
                    if (hasPaid && m.status !== "Paid") {
                        return { ...m, status: "Paid" as const };
                    }
                    return m;
                });
                setMembers(updatedMembers);
                localStorage.setItem("ironcore_members_db", JSON.stringify(updatedMembers));
            })
            .catch(() => {
                setPayments(localPayments);
                setMembers(initialMembers);
            });
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

        // Sync with backend DB
        fetch("/api/members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(memberToAdd),
        }).catch(() => {});

        setNewMember({
            name: "",
            phone: "",
            plan: "Smart Pass",
            dueDate: "",
            streakDays: 1,
        });
        setIsAddModalOpen(false);
    };

    const handleAdminLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {
            console.error("Admin logout error:", e);
        }
        if (typeof window !== "undefined") {
            localStorage.removeItem("ironcore_admin_session");
        }
        router.push("/admin/login");
    };

    const handleOpenEdit = (member: Member) => {
        setEditingMember({ ...member });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;

        const updated = members.map((m) =>
            m.id === editingMember.id ? editingMember : m
        );
        updateMembersState(updated);

        // Sync with backend DB
        fetch("/api/members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingMember),
        }).catch(() => {});

        setIsEditModalOpen(false);
        setFeedbackToast({
            type: "success",
            text: `✓ Member "${editingMember.name}" details updated successfully.`,
        });
    };

    const handleDeleteMember = (member: Member) => {
        const confirmed = window.confirm(
            `Are you sure you want to remove member "${member.name}" (+${member.phone}) from active roster?\nThis action cannot be undone.`
        );
        if (!confirmed) return;

        const updated = members.filter((m) => m.id !== member.id);
        updateMembersState(updated);

        // Sync deletion with backend DB
        fetch(`/api/members?id=${encodeURIComponent(member.id)}`, {
            method: "DELETE",
        }).catch(() => {});

        setFeedbackToast({
            type: "success",
            text: `✓ Member "${member.name}" removed from active roster.`,
        });
    };

    const handleOpenCashModal = (member?: Member) => {
        if (member) {
            setCashForm({
                memberId: member.id,
                name: member.name,
                phone: member.phone,
                plan: member.plan,
                amount: member.plan.toLowerCase().includes("smart") ? "1999" : "1499",
                mode: "Cash at Desk",
                notes: "",
            });
        } else {
            setCashForm({
                memberId: "",
                name: "",
                phone: "",
                plan: "Smart Athlete Pass",
                amount: "1999",
                mode: "Cash at Desk",
                notes: "",
            });
        }
        setIsCashModalOpen(true);
    };

    const handleRecordCashPayment = async (e: React.FormEvent) => {
        e.preventDefault();

        const clean = cashForm.phone.replace(/[^0-9]/g, "");
        const rawTen = clean.length > 10 ? clean.slice(-10) : clean;
        const recipientPhone = `91${rawTen}`;
        const cleanAmount = parseFloat(cashForm.amount) || 0;
        const now = new Date();
        const dueDate30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        // 1. Create Cash Payment Transaction
        const cashTx: PaymentTx = {
            id: `cash_${Date.now()}`,
            paymentId: `CASH_${Date.now().toString().slice(-6)}`,
            orderId: `desk_${Date.now().toString().slice(-6)}`,
            amount: cleanAmount,
            planName: `${cashForm.plan} (${cashForm.mode})`,
            memberPhone: recipientPhone,
            memberName: cashForm.name.trim(),
            date: now.toISOString().split("T")[0],
            time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: `Captured (${cashForm.mode})`,
        };

        // 2. Append to payments list and save in localStorage
        const updatedPayments = [cashTx, ...payments];
        setPayments(updatedPayments);
        if (typeof window !== "undefined") {
            localStorage.setItem("ironcore_payments_db", JSON.stringify(updatedPayments));
        }

        // 3. Post to backend record API for server-side store
        fetch("/api/payment/record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cashTx),
        }).catch(() => {});

        // 4. Upsert/Update Member to Paid with 30-day dueDate
        let updatedMembersList = [...members];
        const matchIdx = updatedMembersList.findIndex(
            (m) =>
                (cashForm.memberId && m.id === cashForm.memberId) ||
                (m.phone && (m.phone.includes(rawTen) || rawTen.includes(m.phone.replace(/[^0-9]/g, "").slice(-10))))
        );

        if (matchIdx >= 0) {
            updatedMembersList[matchIdx] = {
                ...updatedMembersList[matchIdx],
                name: cashForm.name.trim() || updatedMembersList[matchIdx].name,
                plan: cashForm.plan,
                status: "Paid",
                dueDate: dueDate30Days,
            };
        } else {
            const newMemberRecord: Member = {
                id: `mem-${Date.now()}`,
                name: cashForm.name.trim(),
                phone: recipientPhone,
                plan: cashForm.plan,
                dueDate: dueDate30Days,
                streakDays: 1,
                status: "Paid",
            };
            updatedMembersList.unshift(newMemberRecord);
        }

        updateMembersState(updatedMembersList);

        setIsCashModalOpen(false);
        setFeedbackToast({
            type: "success",
            text: `✓ Recorded ₹${cleanAmount.toLocaleString("en-IN")} via ${cashForm.mode} for ${cashForm.name}. Membership marked Paid for 30 days!`,
        });
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

    const filteredPayments = payments.filter(
        (p) =>
            p.paymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.memberPhone && p.memberPhone.includes(searchQuery)) ||
            (p.planName && p.planName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.memberName && p.memberName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalOnlineRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

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
                                className="bg-[#1b1c20] hover:bg-[#23252a] text-[#00ff87] border border-[#00ff87]/40 hover:border-[#00ff87] font-bold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                            >
                                <span>💬</span> Member Live Chat
                            </Link>

                            <button
                                onClick={() => handleOpenCashModal()}
                                className="bg-[#1b1c20] hover:bg-[#252830] text-amber-400 border border-amber-500/40 hover:border-amber-400 font-bold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                            >
                                <span>💵</span> Record Cash / Desk
                            </button>

                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-[#00ff87] hover:bg-[#00e57a] text-black font-semibold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-[#00ff87]/20 active:scale-95 cursor-pointer"
                            >
                                <span>+</span> Add Member
                            </button>

                            <button
                                onClick={handleAdminLogout}
                                className="bg-[#1b1c20] hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 text-zinc-400 font-semibold text-xs px-3.5 py-2.5 rounded-lg border border-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                                title="Sign out of Owner CRM"
                            >
                                <span>🚪</span> Sign Out
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

                {/* Top Metric Cards: 4-Column Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            Renewals Due
                        </span>
                        <div className="text-3xl font-extrabold text-white mt-1">
                            {members.filter((m) => m.status === "Due" || m.status === "Overdue").length}
                        </div>
                    </div>

                    <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 shadow-sm">
                        <span className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">
                            Smart Pass Ratio
                        </span>
                        <div className="text-3xl font-extrabold text-white mt-1">
                            {members.filter((m) => m.plan.includes("Smart")).length + 65}
                        </div>
                    </div>

                    <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold tracking-wider text-[#00ff87] uppercase">
                                Razorpay Revenue
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-mono text-[#00ff87] bg-[#00ff87]/10 px-2 py-0.5 rounded-full border border-[#00ff87]/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff87] animate-pulse" /> Live
                            </span>
                        </div>
                        <div className="text-3xl font-extrabold text-white mt-1 font-mono">
                            ₹{totalOnlineRevenue.toLocaleString("en-IN")}
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-0.5 block font-mono">
                            {payments.length} verified transactions
                        </span>
                    </div>
                </div>

                {/* Operations & Revenue Table Container */}
                <div className="bg-[#141518] border border-zinc-800/80 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
                    {/* View Mode Tabs & Search Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveTab("members")}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                    activeTab === "members"
                                        ? "bg-[#1b1c20] text-[#00ff87] border border-[#00ff87]/40 shadow-sm"
                                        : "text-zinc-400 hover:text-white"
                                }`}
                            >
                                <span>🛡️ Member Renewals ({filteredMembers.length})</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("payments")}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                    activeTab === "payments"
                                        ? "bg-[#1b1c20] text-[#00ff87] border border-[#00ff87]/40 shadow-sm"
                                        : "text-zinc-400 hover:text-white"
                                }`}
                            >
                                <span>💳 Razorpay Collections ({payments.length})</span>
                                <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <span className="absolute left-3 top-2.5 text-zinc-500 text-xs">
                                🔍
                            </span>
                            <input
                                type="text"
                                placeholder={
                                    activeTab === "members"
                                        ? "Search member name or phone..."
                                        : "Search payment ID, phone, plan..."
                                }
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#1b1c20] border border-zinc-800/90 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87]/60"
                            />
                        </div>
                    </div>

                    {/* Active Tab View: Members Renewal Table */}
                    {activeTab === "members" ? (
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
                                                        {/* Quick Cash Record for this member */}
                                                        <button
                                                            onClick={() => handleOpenCashModal(member)}
                                                            className="p-1.5 rounded-lg bg-[#181a20] hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 border border-zinc-800 hover:border-amber-500/30 transition-colors text-xs font-semibold cursor-pointer"
                                                            title="Record Cash / Desk Payment for this member"
                                                        >
                                                            💵
                                                        </button>

                                                        {/* Edit Member Details */}
                                                        <button
                                                            onClick={() => handleOpenEdit(member)}
                                                            className="p-1.5 rounded-lg bg-[#181a20] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors text-xs font-semibold cursor-pointer"
                                                            title="Edit Member Details"
                                                        >
                                                            ✏️
                                                        </button>

                                                        {/* Delete Member */}
                                                        <button
                                                            onClick={() => handleDeleteMember(member)}
                                                            className="p-1.5 rounded-lg bg-[#181a20] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 transition-colors text-xs font-semibold cursor-pointer"
                                                            title="Remove Member from Roster"
                                                        >
                                                            🗑️
                                                        </button>

                                                        {/* Primary 1-Click Action: Smart API Dispatch with auto-fallback */}
                                                        <button
                                                            onClick={() => handleSmartReminderDispatch(member)}
                                                            disabled={isSending}
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all shadow-sm active:scale-95 cursor-pointer ${isSent
                                                                    ? "bg-[#00ff87]/20 border border-[#00ff87] text-[#00ff87]"
                                                                    : isSending
                                                                        ? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
                                                                        : "bg-[#00ff87]/10 hover:bg-[#00ff87]/20 border border-[#00ff87]/30 text-[#00ff87]"
                                                                }`}
                                                        >
                                                            {isSending ? (
                                                                <>
                                                                    <span className="animate-spin text-xs">🌀</span>
                                                                    <span className="hidden md:inline">Sending...</span>
                                                                </>
                                                            ) : isSent ? (
                                                                <>
                                                                    <span>✓</span>
                                                                    <span className="hidden md:inline">Dispatched</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span>💬</span>
                                                                    <span className="hidden md:inline">Remind</span>
                                                                </>
                                                            )}
                                                        </button>

                                                        {/* Direct 1-Click WhatsApp Web Trigger */}
                                                        <a
                                                            href={buildPersonalizedWhatsAppUrl(member)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-2 py-1.5 rounded-lg bg-[#181a20] hover:bg-[#252830] text-zinc-400 hover:text-[#00ff87] border border-zinc-800 transition-colors text-xs font-semibold flex items-center gap-1"
                                                            title="Direct WhatsApp Web"
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
                    ) : (
                        /* Active Tab View: Razorpay Online Collections Table */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="text-zinc-500 border-b border-zinc-800/80 pb-2">
                                        <th className="py-3 font-medium">Payment ID</th>
                                        <th className="py-3 font-medium">Plan Activated</th>
                                        <th className="py-3 font-medium">Amount</th>
                                        <th className="py-3 font-medium">Member Phone</th>
                                        <th className="py-3 font-medium">Timestamp</th>
                                        <th className="py-3 font-medium">Gateway Status</th>
                                        <th className="py-3 font-medium text-right">Verification</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {filteredPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono">
                                                No online payments matching search query.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPayments.map((p) => (
                                            <tr
                                                key={p.paymentId || p.id}
                                                className="hover:bg-[#1a1b1f]/60 transition-colors"
                                            >
                                                <td className="py-3.5 font-mono text-zinc-200 font-medium">
                                                    {p.paymentId}
                                                </td>
                                                <td className="py-3.5 text-zinc-300 font-semibold">
                                                    {p.planName}
                                                </td>
                                                <td className="py-3.5 font-mono text-[#00ff87] font-bold text-sm">
                                                    ₹{Number(p.amount).toLocaleString("en-IN")}
                                                </td>
                                                <td className="py-3.5 font-mono text-zinc-400">
                                                    {p.memberPhone
                                                        ? `+${p.memberPhone}`
                                                        : p.memberName || "Guest Member"}
                                                </td>
                                                <td className="py-3.5 font-mono text-zinc-500 text-[11px]">
                                                    {p.date} • {p.time}
                                                </td>
                                                <td className="py-3.5">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-[#00ff87] border border-emerald-500/20 font-mono">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff87]" />
                                                        Captured
                                                    </span>
                                                </td>
                                                <td className="py-3.5 text-right">
                                                    <a
                                                        href={`https://dashboard.razorpay.com/app/payments/${p.paymentId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[11px] font-semibold text-zinc-400 hover:text-white bg-[#1b1c20] hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-lg transition-all"
                                                    >
                                                        Verify ↗
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
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

            {/* Edit Member Modal */}
            {isEditModalOpen && editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div className="bg-[#141518] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <span>✏️</span> Edit Member Details
                            </h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-zinc-500 hover:text-white text-sm cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block text-zinc-400 mb-1 font-medium">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editingMember.name}
                                    onChange={(e) =>
                                        setEditingMember({ ...editingMember, name: e.target.value })
                                    }
                                    className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                />
                            </div>

                            <div>
                                <label className="block text-zinc-400 mb-1 font-medium">
                                    WhatsApp Phone
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editingMember.phone}
                                    onChange={(e) =>
                                        setEditingMember({ ...editingMember, phone: e.target.value })
                                    }
                                    className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87] font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-zinc-400 mb-1 font-medium">
                                        Plan
                                    </label>
                                    <select
                                        value={editingMember.plan}
                                        onChange={(e) =>
                                            setEditingMember({ ...editingMember, plan: e.target.value })
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
                                        Membership Status
                                    </label>
                                    <select
                                        value={editingMember.status}
                                        onChange={(e) =>
                                            setEditingMember({
                                                ...editingMember,
                                                status: e.target.value as "Due" | "Paid" | "Overdue",
                                            })
                                        }
                                        className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Due">Due</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-zinc-400 mb-1 font-medium">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={editingMember.dueDate}
                                        onChange={(e) =>
                                            setEditingMember({ ...editingMember, dueDate: e.target.value })
                                        }
                                        className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-400 mb-1 font-medium">
                                        Streak (Days)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editingMember.streakDays}
                                        onChange={(e) =>
                                            setEditingMember({
                                                ...editingMember,
                                                streakDays: Number(e.target.value),
                                            })
                                        }
                                        className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-[#00ff87] hover:bg-[#00e57a] text-black font-semibold transition-colors shadow-lg shadow-[#00ff87]/20 cursor-pointer"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Record Cash / Desk Payment Modal */}
            {isCashModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div className="bg-[#141518] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <span>💵</span> Record Cash / Desk Payment
                                </h3>
                                <p className="text-[11px] text-zinc-400 mt-0.5">
                                    Record counter collection & immediately activate membership for 30 days.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCashModalOpen(false)}
                                className="text-zinc-500 hover:text-white text-sm cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleRecordCashPayment} className="space-y-3.5 text-xs">
                            {/* Member Selection Shortcut */}
                            <div>
                                <label className="block text-zinc-400 mb-1 font-medium">
                                    Select Existing Member (or type below for new walk-in)
                                </label>
                                <select
                                    value={cashForm.memberId}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        if (!selectedId) {
                                            setCashForm({
                                                ...cashForm,
                                                memberId: "",
                                            });
                                            return;
                                        }
                                        const found = members.find((m) => m.id === selectedId);
                                        if (found) {
                                            setCashForm({
                                                ...cashForm,
                                                memberId: found.id,
                                                name: found.name,
                                                phone: found.phone,
                                                plan: found.plan.includes("Smart") ? "Smart Athlete Pass" : "Standard Gym Plan",
                                                amount: found.plan.includes("Smart") ? "1999" : "1499",
                                            });
                                        }
                                    }}
                                    className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                >
                                    <option value="">➕ New Walk-in Member (Type details below)</option>
                                    {members.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} (+{m.phone}) — {m.plan} [{m.status}]
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-zinc-400 mb-1 font-medium">
                                        Member Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Kshitij Pilankar"
                                        value={cashForm.name}
                                        onChange={(e) => setCashForm({ ...cashForm, name: e.target.value })}
                                        className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-zinc-400 mb-1 font-medium">
                                        WhatsApp Phone
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="9004884885"
                                        value={cashForm.phone}
                                        onChange={(e) => setCashForm({ ...cashForm, phone: e.target.value })}
                                        className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87] font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-zinc-400 mb-1 font-medium">
                                        Plan Tier
                                    </label>
                                    <select
                                        value={cashForm.plan}
                                        onChange={(e) => {
                                            const p = e.target.value;
                                            setCashForm({
                                                ...cashForm,
                                                plan: p,
                                                amount: p.includes("Smart") ? "1999" : "1499",
                                            });
                                        }}
                                        className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                    >
                                        <option value="Smart Athlete Pass">Smart Athlete Pass</option>
                                        <option value="Standard Gym Plan">Standard Gym Plan</option>
                                        <option value="Elite VIP Pass">Elite VIP Pass</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-zinc-400 mb-1 font-medium">
                                        Payment Method
                                    </label>
                                    <select
                                        value={cashForm.mode}
                                        onChange={(e) => setCashForm({ ...cashForm, mode: e.target.value })}
                                        className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                    >
                                        <option value="Cash at Desk">Cash at Desk</option>
                                        <option value="Desk UPI / QR">Desk UPI / QR</option>
                                        <option value="Desk Card POS">Desk Card POS</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-zinc-400 mb-1 font-medium">
                                        Amount Received (₹)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={cashForm.amount}
                                        onChange={(e) => setCashForm({ ...cashForm, amount: e.target.value })}
                                        className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87] font-mono font-bold text-amber-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-zinc-400 mb-1 font-medium">
                                    Desk Notes (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Received cash at morning shift by front desk"
                                    value={cashForm.notes}
                                    onChange={(e) => setCashForm({ ...cashForm, notes: e.target.value })}
                                    className="w-full bg-[#1b1c20] border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCashModalOpen(false)}
                                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 rounded-lg bg-[#00ff87] hover:bg-[#00e57a] text-black font-extrabold transition-colors shadow-lg shadow-[#00ff87]/20 flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span>✓</span>
                                    <span>Confirm Collection & Activate (30 Days)</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}