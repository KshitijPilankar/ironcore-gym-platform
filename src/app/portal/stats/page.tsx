"use client";

import React, { useState } from "react";
import Link from "next/link";

interface MuscleVolume {
    id: string;
    name: string;
    weeklySets: number;
    targetSets: number;
    status: "Optimal" | "Underworked" | "Recovering";
}

const INITIAL_MUSCLE_DATA: MuscleVolume[] = [
    { id: "chest", name: "Chest / Pectorals", weeklySets: 14, targetSets: 16, status: "Optimal" },
    { id: "lats", name: "Lats & Upper Back", weeklySets: 16, targetSets: 18, status: "Optimal" },
    { id: "shoulders", name: "Deltoids / Shoulders", weeklySets: 12, targetSets: 14, status: "Optimal" },
    { id: "biceps", name: "Biceps", weeklySets: 10, targetSets: 12, status: "Optimal" },
    { id: "triceps", name: "Triceps", weeklySets: 11, targetSets: 12, status: "Optimal" },
    { id: "quads", name: "Quadriceps", weeklySets: 18, targetSets: 18, status: "Optimal" },
    { id: "hamstrings", name: "Hamstrings", weeklySets: 12, targetSets: 14, status: "Optimal" },
    { id: "calves", name: "Calves", weeklySets: 6, targetSets: 10, status: "Underworked" },
    { id: "core", name: "Abs & Core", weeklySets: 8, targetSets: 10, status: "Underworked" },
];

export default function MuscleHeatmapPage() {
    const [selectedMuscle, setSelectedMuscle] = useState<MuscleVolume>(INITIAL_MUSCLE_DATA[0]);
    const [viewMode, setViewMode] = useState<"front" | "back">("front");

    const totalWeeklySets = INITIAL_MUSCLE_DATA.reduce((acc, curr) => acc + curr.weeklySets, 0);

    return (
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] p-6 lg:p-10 font-sans selection:bg-[#00ff87]/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Top Breadcrumb & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
                    <div>
                        <Link
                            href="/portal"
                            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 mb-2"
                        >
                            ← Back to Athlete Hub
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            3D MUSCLE <span className="text-[#00ff87]">VOLUME HEATMAP</span>
                        </h1>
                        <p className="text-xs text-zinc-400 mt-1">
                            Real-time weekly training volume load mapped across anatomical muscle groups.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-[#141518] border border-zinc-800 rounded-xl px-4 py-2 text-right">
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Total Volume</span>
                            <span className="text-lg font-black text-[#00ff87] font-mono">{totalWeeklySets} Sets</span>
                        </div>
                    </div>
                </div>

                {/* Heatmap Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Anatomical Vector Model & View Toggle */}
                    <div className="lg:col-span-5 bg-[#141518] border border-zinc-800/80 rounded-2xl p-6 flex flex-col items-center space-y-6">
                        {/* Front / Back Toggle Buttons */}
                        <div className="flex items-center bg-[#1b1c20] p-1 rounded-xl border border-zinc-800 w-full max-w-xs">
                            <button
                                onClick={() => setViewMode("front")}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === "front"
                                        ? "bg-[#00ff87] text-black shadow-md shadow-[#00ff87]/20"
                                        : "text-zinc-400 hover:text-white"
                                    }`}
                            >
                                Front View
                            </button>
                            <button
                                onClick={() => setViewMode("back")}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === "back"
                                        ? "bg-[#00ff87] text-black shadow-md shadow-[#00ff87]/20"
                                        : "text-zinc-400 hover:text-white"
                                    }`}
                            >
                                Back View
                            </button>
                        </div>

                        {/* Stylized Dark Silhouette Anatomy Canvas */}
                        <div className="relative w-64 h-96 bg-[#18191d] rounded-2xl border border-zinc-800/80 flex flex-col items-center justify-center p-6 shadow-inner overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(#00ff87_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

                            {/* Vector Silhouette Representation */}
                            <div className="relative z-10 flex flex-col items-center space-y-3 w-full">
                                {/* Head */}
                                <div className="w-10 h-12 rounded-full border-2 border-zinc-700 bg-zinc-900/80" />

                                {/* Torso / Core */}
                                <div className="w-28 h-32 rounded-2xl border-2 border-zinc-700 bg-zinc-900/80 p-2 flex flex-col items-center justify-between">
                                    {viewMode === "front" ? (
                                        <>
                                            <div
                                                onClick={() =>
                                                    setSelectedMuscle(
                                                        INITIAL_MUSCLE_DATA.find((m) => m.id === "chest") || INITIAL_MUSCLE_DATA[0]
                                                    )
                                                }
                                                className="w-full h-10 rounded-lg bg-[#00ff87]/20 border border-[#00ff87]/50 flex items-center justify-center text-[10px] font-bold text-[#00ff87] cursor-pointer hover:bg-[#00ff87]/30 transition-all"
                                            >
                                                Chest (14s)
                                            </div>
                                            <div
                                                onClick={() =>
                                                    setSelectedMuscle(
                                                        INITIAL_MUSCLE_DATA.find((m) => m.id === "core") || INITIAL_MUSCLE_DATA[0]
                                                    )
                                                }
                                                className="w-16 h-12 rounded-md bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-[10px] font-bold text-amber-400 cursor-pointer hover:bg-amber-500/30 transition-all"
                                            >
                                                Abs (8s)
                                            </div>
                                        </>
                                    ) : (
                                        <div
                                            onClick={() =>
                                                setSelectedMuscle(
                                                    INITIAL_MUSCLE_DATA.find((m) => m.id === "lats") || INITIAL_MUSCLE_DATA[0]
                                                )
                                            }
                                            className="w-full h-24 rounded-xl bg-[#00ff87]/20 border border-[#00ff87]/50 flex items-center justify-center text-[10px] font-bold text-[#00ff87] cursor-pointer hover:bg-[#00ff87]/30 transition-all"
                                        >
                                            Lats & Back (16s)
                                        </div>
                                    )}
                                </div>

                                {/* Legs */}
                                <div className="flex gap-4">
                                    <div
                                        onClick={() =>
                                            setSelectedMuscle(
                                                INITIAL_MUSCLE_DATA.find((m) =>
                                                    viewMode === "front" ? m.id === "quads" : m.id === "hamstrings"
                                                ) || INITIAL_MUSCLE_DATA[0]
                                            )
                                        }
                                        className="w-10 h-32 rounded-xl bg-[#00ff87]/20 border border-[#00ff87]/50 flex items-center justify-center text-[9px] font-bold text-[#00ff87] cursor-pointer hover:bg-[#00ff87]/30 transition-all"
                                    >
                                        {viewMode === "front" ? "Quads" : "Hamstring"}
                                    </div>
                                    <div
                                        onClick={() =>
                                            setSelectedMuscle(
                                                INITIAL_MUSCLE_DATA.find((m) =>
                                                    viewMode === "front" ? m.id === "quads" : m.id === "hamstrings"
                                                ) || INITIAL_MUSCLE_DATA[0]
                                            )
                                        }
                                        className="w-10 h-32 rounded-xl bg-[#00ff87]/20 border border-[#00ff87]/50 flex items-center justify-center text-[9px] font-bold text-[#00ff87] cursor-pointer hover:bg-[#00ff87]/30 transition-all"
                                    >
                                        {viewMode === "front" ? "Quads" : "Hamstring"}
                                    </div>
                                </div>
                            </div>

                            <span className="text-[10px] text-zinc-500 mt-4 z-10 font-mono">
                                Click any region to inspect load
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Interactive Volume Breakdown List */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Selected Muscle Deep Dive Card */}
                        <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                                        Focused Muscle Group
                                    </span>
                                    <h3 className="text-xl font-bold text-white mt-0.5">{selectedMuscle.name}</h3>
                                </div>
                                <span
                                    className={`text-xs font-bold px-3 py-1 rounded-full border ${selectedMuscle.status === "Optimal"
                                            ? "bg-[#00ff87]/10 text-[#00ff87] border-[#00ff87]/30"
                                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                        }`}
                                >
                                    {selectedMuscle.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-5">
                                <div className="bg-[#1b1c20] p-4 rounded-xl border border-zinc-800">
                                    <span className="text-[11px] text-zinc-400 block font-medium">Logged Sets (This Week)</span>
                                    <span className="text-2xl font-black text-white font-mono mt-1 block">
                                        {selectedMuscle.weeklySets}{" "}
                                        <span className="text-xs font-normal text-zinc-500">sets</span>
                                    </span>
                                </div>
                                <div className="bg-[#1b1c20] p-4 rounded-xl border border-zinc-800">
                                    <span className="text-[11px] text-zinc-400 block font-medium">Weekly Target</span>
                                    <span className="text-2xl font-black text-zinc-300 font-mono mt-1 block">
                                        {selectedMuscle.targetSets}{" "}
                                        <span className="text-xs font-normal text-zinc-500">sets</span>
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-5 space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-zinc-400">Target Completion</span>
                                    <span className="text-[#00ff87] font-mono">
                                        {Math.round((selectedMuscle.weeklySets / selectedMuscle.targetSets) * 100)}%
                                    </span>
                                </div>
                                <div className="w-full bg-[#1b1c20] h-2.5 rounded-full overflow-hidden border border-zinc-800">
                                    <div
                                        className="bg-[#00ff87] h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                (selectedMuscle.weeklySets / selectedMuscle.targetSets) * 100
                                            )}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* All Muscles Volume Roster Table */}
                        <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-6">
                            <h4 className="text-sm font-bold text-white mb-4">Weekly Sets by Anatomy</h4>
                            <div className="space-y-3">
                                {INITIAL_MUSCLE_DATA.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedMuscle(item)}
                                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${selectedMuscle.id === item.id
                                                ? "bg-[#1b1c20] border-[#00ff87]/50"
                                                : "bg-[#16171b]/60 border-zinc-800/60 hover:bg-[#1b1c20]"
                                            }`}
                                    >
                                        <div>
                                            <span className="text-xs font-semibold text-zinc-200 block">{item.name}</span>
                                            <span className="text-[10px] text-zinc-500 font-mono">
                                                {item.weeklySets} / {item.targetSets} sets completed
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-24 bg-zinc-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                                <div
                                                    className="bg-[#00ff87] h-full rounded-full"
                                                    style={{
                                                        width: `${Math.min(100, (item.weeklySets / item.targetSets) * 100)}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-white font-mono">{item.weeklySets}s</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}