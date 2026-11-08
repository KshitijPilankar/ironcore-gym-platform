"use client";

import React, { useState } from "react";
import Link from "next/link";
import bodyPathsData from "@/lib/body-paths.js";

const INERT_PARTS = [
    "head",
    "hair",
    "neck",
    "hands",
    "feet",
    "knees",
    "ankles",
];

const MUSCLE_GROUPS = [
    "chest",
    "upper-back",
    "deltoids",
    "trapezius",
    "biceps",
    "triceps",
    "forearm",
    "abs",
    "obliques",
    "lower-back",
    "gluteal",
    "quadriceps",
    "hamstring",
    "calves",
    "adductors",
    "tibialis",
];

const MUSCLE_META: Record<
    string,
    { label: string; category: "Upper Body" | "Core" | "Lower Body" | "Arms"; anterior: boolean }
> = {
    chest: { label: "Chest / Pectorals", category: "Upper Body", anterior: true },
    "upper-back": { label: "Lats & Upper Back", category: "Upper Body", anterior: false },
    deltoids: { label: "Deltoids / Shoulders", category: "Upper Body", anterior: true },
    trapezius: { label: "Trapezius / Traps", category: "Upper Body", anterior: false },
    biceps: { label: "Biceps", category: "Arms", anterior: true },
    triceps: { label: "Triceps", category: "Arms", anterior: false },
    forearm: { label: "Forearms", category: "Arms", anterior: true },
    abs: { label: "Abs & Core", category: "Core", anterior: true },
    obliques: { label: "Obliques", category: "Core", anterior: true },
    "lower-back": { label: "Lower Back", category: "Core", anterior: false },
    gluteal: { label: "Glutes", category: "Lower Body", anterior: false },
    quadriceps: { label: "Quadriceps", category: "Lower Body", anterior: true },
    hamstring: { label: "Hamstrings", category: "Lower Body", anterior: false },
    calves: { label: "Calves", category: "Lower Body", anterior: false },
    adductors: { label: "Adductors / Inner Thigh", category: "Lower Body", anterior: true },
    tibialis: { label: "Tibialis / Shins", category: "Lower Body", anterior: true },
};

const RECOMMENDED_EXERCISES: Record<string, string[]> = {
    chest: ["Bench Press", "Incline Dumbbell Press", "Chest Dips"],
    "upper-back": ["Barbell Rows", "Pull-Ups", "Lat Pulldown"],
    deltoids: ["Overhead Press", "Lateral Raises", "Face Pulls"],
    trapezius: ["Barbell Shrugs", "Rack Pulls", "Farmer's Walks"],
    biceps: ["Barbell Curls", "Hammer Curls", "Incline Dumbbell Curls"],
    triceps: ["Skull Crushers", "Rope Pushdowns", "Close-Grip Bench Press"],
    forearm: ["Wrist Curls", "Dead Hangs", "Reverse Curls"],
    abs: ["Hanging Leg Raises", "Cable Crunches", "Ab Wheel Rollouts"],
    obliques: ["Side Planks", "Russian Twists", "Cable Woodchoppers"],
    "lower-back": ["Hyperextensions", "Good Mornings", "RDLs"],
    gluteal: ["Barbell Hip Thrust", "Bulgarian Split Squats", "Romanian Deadlift"],
    quadriceps: ["Barbell Back Squat", "Leg Press", "Walking Lunges"],
    hamstring: ["Lying Leg Curls", "Stiff-Legged Deadlift", "Nordic Curls"],
    calves: ["Standing Calf Raises", "Seated Calf Raises"],
    adductors: ["Cable Adductions", "Copenhagen Planks"],
    tibialis: ["Tibialis Raises", "Heel Walks"],
};

const DEFAULT_VOLUME: Record<string, number> = {
    chest: 14,
    "upper-back": 16,
    deltoids: 12,
    trapezius: 8,
    biceps: 10,
    triceps: 11,
    forearm: 6,
    abs: 8,
    obliques: 6,
    "lower-back": 8,
    gluteal: 12,
    quadriceps: 18,
    hamstring: 12,
    calves: 6,
    adductors: 6,
    tibialis: 4,
};

const TARGET_VOLUME: Record<string, number> = {
    chest: 16,
    "upper-back": 18,
    deltoids: 14,
    trapezius: 10,
    biceps: 12,
    triceps: 12,
    forearm: 8,
    abs: 10,
    obliques: 8,
    "lower-back": 10,
    gluteal: 14,
    quadriceps: 18,
    hamstring: 14,
    calves: 10,
    adductors: 8,
    tibialis: 6,
};

export default function MuscleHeatmapPage() {
    const [selectedMuscle, setSelectedMuscle] = useState<string>("abs");
    const [viewMode, setViewMode] = useState<"front" | "back">("front");
    const [gender, setGender] = useState<"male" | "female">("male");
    const [filterCategory, setFilterCategory] = useState<string>("All");

    const totalWeeklySets = Object.values(DEFAULT_VOLUME).reduce(
        (acc, curr) => acc + curr,
        0
    );

    // 5-Tier High Contrast Heatmap Color Scale
    const getHeatColor = (slug: string) => {
        const sets = DEFAULT_VOLUME[slug] || 0;
        const target = TARGET_VOLUME[slug] || 12;
        const ratio = sets / target;

        if (sets === 0) return "#18191d"; // Muted Slate (Untrained)
        if (ratio < 0.45) return "#0b3b24"; // Level 1: Deep Pine
        if (ratio < 0.70) return "#0e6138"; // Level 2: Forest Green
        if (ratio < 0.90) return "#00a855"; // Level 3: Jade Green
        return "#00ff87"; // Level 4: Electric Neon Peak
    };

    const getHeatBorderColor = (slug: string) => {
        const isSelected = selectedMuscle === slug;
        if (isSelected) return "#ffffff";
        return "#0e0e10";
    };

    // Safe Geometry Access
    const genderModel = (bodyPathsData as any)[gender] || (bodyPathsData as any).male;
    const currentView = viewMode === "front" ? genderModel.front : genderModel.back;

    const currentMeta = MUSCLE_META[selectedMuscle] || {
        label: selectedMuscle,
        category: "Upper Body",
        anterior: true,
    };

    const currentSets = DEFAULT_VOLUME[selectedMuscle] || 0;
    const currentTarget = TARGET_VOLUME[selectedMuscle] || 12;
    const completionPercentage = Math.round((currentSets / currentTarget) * 100);

    const autoAlignView = () => {
        if (currentMeta.anterior && viewMode !== "front") {
            setViewMode("front");
        } else if (!currentMeta.anterior && viewMode !== "back") {
            setViewMode("back");
        }
    };

    const filteredSlugs = MUSCLE_GROUPS.filter((slug) => {
        if (filterCategory === "All") return true;
        return MUSCLE_META[slug]?.category === filterCategory;
    });

    return (
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] pt-8 sm:pt-10 pb-28 px-4 sm:px-8 font-sans selection:bg-[#00ff87]/30">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Navigation & Header with Clear Spacing */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
                    <div>
                        <Link
                            href="/portal"
                            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 mb-2"
                        >
                            ← Back to Athlete Hub
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            ANATOMICAL{" "}
                            <span className="text-[#00ff87]">VOLUME HEATMAP</span>
                        </h1>
                        <p className="text-xs text-zinc-400 mt-1">
                            High-precision vector silhouette powered by openGym geometry. Inspect training volume load, target sets, and structural balance in real time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-[#141518] border border-zinc-800 rounded-xl px-4 py-2.5 text-right shadow-sm">
                            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                                Total Volume
                            </span>
                            <span className="text-xl font-black text-[#00ff87] font-mono">
                                {totalWeeklySets} Sets
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Grid: Body Model + Dynamic Inspector */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Authentic Vector Silhouette */}
                    <div className="lg:col-span-5 bg-[#141518] border border-zinc-800/80 rounded-2xl p-5 flex flex-col items-center space-y-5 shadow-xl">
                        {/* Perspective & Gender Toggle Controls */}
                        <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center bg-[#1b1c20] p-1 rounded-xl border border-zinc-800 flex-1">
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

                            <div className="flex items-center bg-[#1b1c20] p-1 rounded-xl border border-zinc-800">
                                <button
                                    onClick={() => setGender("male")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${gender === "male"
                                            ? "bg-zinc-700 text-white"
                                            : "text-zinc-400 hover:text-white"
                                        }`}
                                >
                                    Male
                                </button>
                                <button
                                    onClick={() => setGender("female")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${gender === "female"
                                            ? "bg-zinc-700 text-white"
                                            : "text-zinc-400 hover:text-white"
                                        }`}
                                >
                                    Female
                                </button>
                            </div>
                        </div>

                        {/* SVG Canvas with Grid Background */}
                        <div className="relative w-full max-w-[320px] h-[480px] bg-[#0c0d0f] rounded-2xl border border-zinc-800/90 flex flex-col items-center justify-center p-3 overflow-hidden shadow-inner">
                            <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

                            <svg
                                viewBox={currentView.vb}
                                className="w-full h-full drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] cursor-pointer select-none z-10"
                            >
                                {/* 1. Inert Silhouette Bones/Head/Hands/Feet */}
                                {INERT_PARTS.map((part) =>
                                    (currentView.p[part] || []).map((d: string, idx: number) => (
                                        <path
                                            key={`inert-${part}-${idx}`}
                                            d={d}
                                            fill="#202227"
                                            stroke="#0e0e10"
                                            strokeWidth={2}
                                            className="pointer-events-none"
                                        />
                                    ))
                                )}

                                {/* 2. Active Anatomical Muscles with Click & Shading */}
                                {MUSCLE_GROUPS.map((slug) => {
                                    const paths = currentView.p[slug] || [];
                                    const isSelected = selectedMuscle === slug;
                                    return paths.map((d: string, idx: number) => (
                                        <path
                                            key={`muscle-${slug}-${idx}`}
                                            d={d}
                                            fill={getHeatColor(slug)}
                                            stroke={getHeatBorderColor(slug)}
                                            strokeWidth={isSelected ? 5.5 : 2}
                                            className="cursor-pointer transition-all duration-200 hover:brightness-125"
                                            onClick={() => setSelectedMuscle(slug)}
                                        >
                                            <title>{`${MUSCLE_META[slug]?.label || slug}: ${DEFAULT_VOLUME[slug] || 0} sets`}</title>
                                        </path>
                                    ));
                                })}
                            </svg>
                        </div>

                        {/* Heatmap Legend Bar */}
                        <div className="flex items-center justify-between w-full max-w-[280px] text-[10px] text-zinc-400 font-semibold px-2">
                            <span className="uppercase tracking-wider">Training Volume</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-zinc-500">Less</span>
                                <span className="w-3 h-3 rounded-sm bg-[#18191d] border border-zinc-800" title="0 sets" />
                                <span className="w-3 h-3 rounded-sm bg-[#0b3b24]" title="Low volume" />
                                <span className="w-3 h-3 rounded-sm bg-[#0e6138]" title="Moderate volume" />
                                <span className="w-3 h-3 rounded-sm bg-[#00a855]" title="High volume" />
                                <span className="w-3 h-3 rounded-sm bg-[#00ff87]" title="Peak volume" />
                                <span className="text-[#00ff87] font-bold">More</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Muscle Inspector & Weekly Volume Roster */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Focused Muscle Card */}
                        <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase tracking-wider">
                                            {currentMeta.category}
                                        </span>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${completionPercentage >= 85
                                                    ? "bg-[#00ff87]/10 text-[#00ff87]"
                                                    : "bg-amber-500/10 text-amber-400"
                                                }`}
                                        >
                                            {completionPercentage >= 85 ? "Optimal" : "Underworked"}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white mt-1.5">
                                        {currentMeta.label}
                                    </h3>
                                </div>

                                <button
                                    onClick={autoAlignView}
                                    className="bg-[#1b1c20] hover:bg-[#23252a] text-zinc-300 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                                    title="Rotate model to best anatomical view"
                                >
                                    Auto-Align View ↺
                                </button>
                            </div>

                            {/* Metric Statistics */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-[#1b1c20] p-4 rounded-xl border border-zinc-800/80">
                                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                                        Weekly Sets
                                    </span>
                                    <span className="text-2xl font-black text-[#00ff87] font-mono mt-1 block">
                                        {currentSets}{" "}
                                        <span className="text-xs font-normal text-zinc-500">sets</span>
                                    </span>
                                </div>

                                <div className="bg-[#1b1c20] p-4 rounded-xl border border-zinc-800/80">
                                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                                        Target Load
                                    </span>
                                    <span className="text-2xl font-black text-white font-mono mt-1 block">
                                        {currentTarget}{" "}
                                        <span className="text-xs font-normal text-zinc-500">sets</span>
                                    </span>
                                </div>

                                <div className="bg-[#1b1c20] p-4 rounded-xl border border-zinc-800/80">
                                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                                        Completion
                                    </span>
                                    <span className="text-2xl font-black text-white font-mono mt-1 block">
                                        {completionPercentage}%
                                    </span>
                                </div>
                            </div>

                            {/* Progress Load Bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold text-zinc-400">
                                    <span>Weekly Target Progress</span>
                                    <span className="text-[#00ff87] font-mono">
                                        {currentSets} / {currentTarget} sets
                                    </span>
                                </div>
                                <div className="w-full bg-[#1b1c20] h-2.5 rounded-full overflow-hidden border border-zinc-800">
                                    <div
                                        className="bg-[#00ff87] h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(100, completionPercentage)}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Recommended Exercises Chips */}
                            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                                    Recommended Exercises
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {(RECOMMENDED_EXERCISES[selectedMuscle] || ["Compound Movements", "Accessory Sets"]).map((ex, i) => (
                                        <span
                                            key={i}
                                            className="px-2.5 py-1 rounded-md bg-[#1b1c20] text-zinc-300 text-xs border border-zinc-800 hover:border-[#00ff87]/40 transition-colors cursor-pointer"
                                        >
                                            • {ex}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Weekly Load List with Custom Sleek Dark Scrollbar */}
                        <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <span>Weekly Load by Anatomy ({filteredSlugs.length})</span>
                                </h4>

                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                    {["All", "Upper Body", "Core", "Lower Body", "Arms"].map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilterCategory(cat)}
                                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border ${filterCategory === cat
                                                    ? "bg-[#00ff87] text-black border-[#00ff87]"
                                                    : "bg-[#1b1c20] text-zinc-400 border-zinc-800 hover:text-white"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sleek Dark Scrollable Roster */}
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:#3f3f46_#141518] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#141518] [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
                                {filteredSlugs.map((slug) => {
                                    const meta = MUSCLE_META[slug];
                                    const sets = DEFAULT_VOLUME[slug] || 0;
                                    const target = TARGET_VOLUME[slug] || 12;
                                    const isSelected = selectedMuscle === slug;
                                    const ratio = Math.round((sets / target) * 100);

                                    return (
                                        <div
                                            key={slug}
                                            onClick={() => {
                                                setSelectedMuscle(slug);
                                                if (meta.anterior && viewMode !== "front") setViewMode("front");
                                                if (!meta.anterior && viewMode !== "back") setViewMode("back");
                                            }}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isSelected
                                                    ? "bg-[#1b1c20] border-[#00ff87]/80 shadow-md shadow-[#00ff87]/5"
                                                    : "bg-[#16171b]/70 border-zinc-800/60 hover:bg-[#1b1c20] hover:border-zinc-700"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{ backgroundColor: getHeatColor(slug) }}
                                                />
                                                <div>
                                                    <span className="text-xs font-bold text-zinc-200 block">
                                                        {meta?.label || slug}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 font-mono">
                                                        {sets} / {target} sets • {ratio}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-24 bg-zinc-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                                    <div
                                                        className="bg-[#00ff87] h-full rounded-full transition-all"
                                                        style={{ width: `${Math.min(100, ratio)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-mono font-bold text-white min-w-[32px] text-right">
                                                    {sets}s
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
