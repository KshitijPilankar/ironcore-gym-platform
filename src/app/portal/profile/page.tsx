"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, Shield, Target, Phone, Calendar, Flame, Check, AlertCircle } from "lucide-react";

interface MemberProfile {
    id: string;
    name: string;
    phone: string;
    plan: string;
    dueDate: string;
    streakDays: number;
    status: "Due" | "Paid" | "Overdue";
    age?: number;
    heightCm?: number;
    targetWeightKg?: number;
    fitnessGoal?: string;
    emergencyContact?: string;
}

const DEFAULT_PROFILE: MemberProfile = {
    id: "mem_kshitij",
    name: "Kshitij Pilankar",
    phone: "919004884885",
    plan: "Smart Athlete Pass",
    dueDate: "2026-11-20",
    streakDays: 14,
    status: "Due",
    age: 26,
    heightCm: 178,
    targetWeightKg: 70,
    fitnessGoal: "Hypertrophy & Muscle Gain",
    emergencyContact: "+91 9087799948 (Sneha)",
};

export default function MemberProfilePage() {
    const [profile, setProfile] = useState<MemberProfile>(DEFAULT_PROFILE);
    const [savedToast, setSavedToast] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("ironcore_active_member");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed === "object") {
                    setProfile((prev) => ({
                        ...prev,
                        ...parsed,
                    }));
                }
            }
        } catch (e) {
            console.warn("Failed to load active member", e);
        }
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // 1. Update active member in localStorage
            localStorage.setItem("ironcore_active_member", JSON.stringify(profile));

            // 2. Update member in members roster
            const storedMembers = localStorage.getItem("ironcore_members_db");
            if (storedMembers) {
                try {
                    const membersList = JSON.parse(storedMembers);
                    if (Array.isArray(membersList)) {
                        const cleanPhone = profile.phone.replace(/[^0-9]/g, "");
                        const updated = membersList.map((m: any) => {
                            if (m.phone && (m.phone.includes(cleanPhone) || cleanPhone.includes(m.phone.slice(-10)))) {
                                return { ...m, ...profile };
                            }
                            return m;
                        });
                        localStorage.setItem("ironcore_members_db", JSON.stringify(updated));
                    }
                } catch {
                    // ignore
                }
            }

            // 3. Post to backend DB service for cross-device sync
            fetch("/api/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            }).catch(() => {});

            setSavedToast(true);
            setTimeout(() => setSavedToast(false), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#00ff87] uppercase font-mono">
                        ACCOUNT & ATHLETE SETTINGS
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                        Athlete Profile
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        Manage your training metrics, target physique weight, and contact credentials.
                    </p>
                </div>

                <Link
                    href="/portal"
                    className="self-start sm:self-auto text-xs font-semibold text-zinc-400 hover:text-white bg-[#181a20] border border-zinc-800 px-3.5 py-2 rounded-xl transition-all"
                >
                    ← Back to Hub
                </Link>
            </div>

            {/* Saved Toast */}
            {savedToast && (
                <div className="bg-[#00ff87]/15 border border-[#00ff87]/40 text-[#00ff87] p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Check className="w-4 h-4" />
                    <span>Profile settings and body weight goals updated successfully across IronCore!</span>
                </div>
            )}

            {/* Read-Only Verified Membership Card */}
            <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#00ff87]/10 border border-[#00ff87]/20 flex items-center justify-center text-xl text-[#00ff87]">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                                Membership Credential
                            </span>
                            <span className="text-base font-extrabold text-white">
                                {profile.plan}
                            </span>
                        </div>
                    </div>

                    <span className={`text-xs px-3 py-1 rounded-full font-mono font-bold uppercase ${
                        profile.status === "Paid"
                            ? "bg-[#00ff87]/15 text-[#00ff87] border border-[#00ff87]/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    }`}>
                        {profile.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-zinc-800/80">
                    <div className="bg-[#181a20] p-3 rounded-xl border border-zinc-800/60 flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-zinc-400" />
                        <div>
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">WhatsApp ID</span>
                            <span className="font-mono text-zinc-200 font-semibold">+{profile.phone}</span>
                        </div>
                    </div>

                    <div className="bg-[#181a20] p-3 rounded-xl border border-zinc-800/60 flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        <div>
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Valid Until</span>
                            <span className="font-mono text-zinc-200 font-semibold">{profile.dueDate}</span>
                        </div>
                    </div>

                    <div className="bg-[#181a20] p-3 rounded-xl border border-zinc-800/60 flex items-center gap-2.5">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <div>
                            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Unbroken Streak</span>
                            <span className="font-mono text-amber-400 font-bold">{profile.streakDays} Days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Editable Profile & Biometrics Form */}
            <form onSubmit={handleSave} className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-5 sm:p-7 space-y-6">
                <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                        <User className="w-4 h-4 text-[#00ff87]" /> Biometrics & Training Goals
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Keep these up-to-date so your workout volume and caloric targets calibrate accurately.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                        <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[#181a20] border border-zinc-800 text-sm focus:outline-none focus:border-[#00ff87] text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                            Primary Fitness Goal
                        </label>
                        <select
                            value={profile.fitnessGoal || "Hypertrophy & Muscle Gain"}
                            onChange={(e) => setProfile({ ...profile, fitnessGoal: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[#181a20] border border-zinc-800 text-sm focus:outline-none focus:border-[#00ff87] text-white"
                        >
                            <option value="Hypertrophy & Muscle Gain">Hypertrophy & Muscle Gain</option>
                            <option value="Fat Loss & Conditioning">Fat Loss & Conditioning</option>
                            <option value="Strength & Powerlifting">Strength & Powerlifting</option>
                            <option value="Athletic Performance">Athletic Performance</option>
                            <option value="General Health & Longevity">General Health & Longevity</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                            Age (Years)
                        </label>
                        <input
                            type="number"
                            min="14"
                            max="90"
                            placeholder="e.g. 26"
                            value={profile.age || ""}
                            onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                            className="w-full px-4 py-3 rounded-xl bg-[#181a20] border border-zinc-800 text-sm focus:outline-none focus:border-[#00ff87] text-white font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                            Height (cm)
                        </label>
                        <input
                            type="number"
                            min="120"
                            max="230"
                            placeholder="e.g. 178"
                            value={profile.heightCm || ""}
                            onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                            className="w-full px-4 py-3 rounded-xl bg-[#181a20] border border-zinc-800 text-sm focus:outline-none focus:border-[#00ff87] text-white font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                            Target Physique Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.5"
                            min="40"
                            max="150"
                            required
                            placeholder="e.g. 70"
                            value={profile.targetWeightKg || 70}
                            onChange={(e) => setProfile({ ...profile, targetWeightKg: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 rounded-xl bg-[#181a20] border border-zinc-800 text-sm focus:outline-none focus:border-[#00ff87] text-white font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                            Emergency Contact (Name & Phone)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. +91 9087799948 (Sneha)"
                            value={profile.emergencyContact || ""}
                            onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[#181a20] border border-zinc-800 text-sm focus:outline-none focus:border-[#00ff87] text-white"
                        />
                    </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00ff87]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                        <span>{isSaving ? "Saving..." : "Save Profile & Goals"}</span>
                        <span>→</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
