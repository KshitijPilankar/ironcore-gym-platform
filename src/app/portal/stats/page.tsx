"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import bodyPathsData from "@/lib/body-paths.js";

// Inert body parts that form the silhouette but carry no training load
const INERT_PARTS = ["head", "hair", "neck", "hands", "feet", "knees", "ankles"];

// Canonical shadeable muscles in head-to-toe order matching openGym
const MUSCLE_SLUGS = [
    "trapezius", "deltoids", "chest", "upper-back", "serratus",
    "biceps", "triceps", "forearm", "abs", "obliques", "lower-back",
    "gluteal", "quadriceps", "hamstring", "adductors", "hip-flexors",
    "calves", "tibialis"
];

interface MuscleVolume {
    id: string;
    name: string;
    category: "Upper Body" | "Core" | "Lower Body" | "Arms";
    weeklySets: number;
    targetSets: number;
    status: "Optimal" | "Underworked" | "Recovering";
    primaryExercises: string[];
}

const INITIAL_MUSCLE_DATA: MuscleVolume[] = [
    {
        id: "chest",
        name: "Chest / Pectorals",
        category: "Upper Body",
        weeklySets: 14,
        targetSets: 16,
        status: "Optimal",
        primaryExercises: ["Barbell Bench Press", "Incline Dumbbell Press", "Cable Chest Flyes"],
    },
    {
        id: "upper-back",
        name: "Lats & Upper Back",
        category: "Upper Body",
        weeklySets: 16,
        targetSets: 18,
        status: "Optimal",
        primaryExercises: ["Weighted Pull-Ups", "Barbell Rows", "Lat Pulldown"],
    },
    {
        id: "deltoids",
        name: "Deltoids / Shoulders",
        category: "Upper Body",
        weeklySets: 12,
        targetSets: 14,
        status: "Optimal",
        primaryExercises: ["Overhead Press", "Dumbbell Lateral Raise", "Face Pulls"],
    },
    {
        id: "trapezius",
        name: "Trapezius / Traps",
        category: "Upper Body",
        weeklySets: 8,
        targetSets: 10,
        status: "Optimal",
        primaryExercises: ["Dumbbell Shrugs", "Barbell Rack Pulls", "Farmer's Walk"],
    },
    {
        id: "biceps",
        name: "Biceps",
        category: "Arms",
        weeklySets: 10,
        targetSets: 12,
        status: "Optimal",
        primaryExercises: ["Incline Dumbbell Curl", "Barbell Curl", "Hammer Curls"],
    },
    {
        id: "triceps",
        name: "Triceps",
        category: "Arms",
        weeklySets: 11,
        targetSets: 12,
        status: "Optimal",
        primaryExercises: ["Dips", "Cable Triceps Pushdown", "Skull Crushers"],
    },
    {
        id: "forearm",
        name: "Forearms",
        category: "Arms",
        weeklySets: 6,
        targetSets: 8,
        status: "Underworked",
        primaryExercises: ["Wrist Curls", "Dead Hangs", "Reverse Barbell Curls"],
    },
    {
        id: "abs",
        name: "Abs & Core",
        category: "Core",
        weeklySets: 8,
        targetSets: 10,
        status: "Underworked",
        primaryExercises: ["Hanging Leg Raises", "Cable Woodchoppers", "Ab Wheel Rollouts"],
    },
    {
        id: "obliques",
        name: "Obliques",
        category: "Core",
        weeklySets: 6,
        targetSets: 8,
        status: "Underworked",
        primaryExercises: ["Side Planks", "Russian Twists", "Bicycle Crunches"],
    },
    {
        id: "lower-back",
        name: "Lower Back / Erector",
        category: "Core",
        weeklySets: 10,
        targetSets: 12,
        status: "Optimal",
        primaryExercises: ["Conventional Deadlift", "Hyperextensions", "Good Mornings"],
    },
    {
        id: "gluteal",
        name: "Glutes",
        category: "Lower Body",
        weeklySets: 12,
        targetSets: 14,
        status: "Optimal",
        primaryExercises: ["Barbell Hip Thrust", "Bulgarian Split Squat", "Romanian Deadlift"],
    },
    {
        id: "quadriceps",
        name: "Quadriceps",
        category: "Lower Body",
        weeklySets: 18,
        targetSets: 18,
        status: "Optimal",
        primaryExercises: ["Barbell Back Squat", "Leg Press", "Walking Lunges"],
    },
    {
        id: "hamstring",
        name: "Hamstrings",
        category: "Lower Body",
        weeklySets: 12,
        targetSets: 14,
        status: "Optimal",
        primaryExercises: ["Romanian Deadlift", "Seated Leg Curl", "Nordic Hamstring Curl"],
    },
    {
        id: "calves",
        name: "Calves",
        category: "Lower Body",
        weeklySets: 6,
        targetSets: 10,
        status: "Underworked",
        primaryExercises: ["Standing Calf Raise", "Seated Calf Raise", "Donkey Calf Raise"],
    },
    {
        id: "adductors",
        name: "Adductors / Inner Thigh",
        category: "Lower Body",
        weeklySets: 5,
        targetSets: 8,
        status: "Underworked",
        primaryExercises: ["Copenhagen Plank", "Sumo Deadlift", "Cable Adduction"],
    },
    {
        id: "tibialis",
        name: "Tibialis / Shins",
        category: "Lower Body",
        weeklySets: 4,
        targetSets: 6,
        status: "Underworked",
        primaryExercises: ["Tibialis Raises", "Kettlebell Toe Lifts"],
    },
];

export default function MuscleHeatmapPage() {
    const [selectedId, setSelectedId] = useState<string>("chest");
    const [viewMode, setViewMode] = useState<"front" | "back">("front");
    const [gender, setGender] = useState<"male" | "female">("male");
    const [filterCategory, setFilterCategory] = useState<string>("All");

    // Map of weekly sets by slug
    const loadMap: Record<string, number> = useMemo(() => {
        const map: Record<string, number> = {};
        INITIAL_MUSCLE_DATA.forEach((m) => {
            map[m.id] = m.weeklySets;
        });
        return map;
    }, []);

    const maxWeeklySets = useMemo(() => {
        return Math.max(1, ...INITIAL_MUSCLE_DATA.map((m) => m.weeklySets));
    }, []);

    const totalWeeklySets = useMemo(() => {
        return INITIAL_MUSCLE_DATA.reduce((acc, curr) => acc + curr.weeklySets, 0);
    }, []);

    const selectedMuscle = useMemo(() => {
        return INITIAL_MUSCLE_DATA.find((m) => m.id === selectedId) || INITIAL_MUSCLE_DATA[0];
    }, [selectedId]);

    const filteredMuscles = useMemo(() => {
        if (filterCategory === "All") return INITIAL_MUSCLE_DATA;
        return INITIAL_MUSCLE_DATA.filter((m) => m.category === filterCategory);
    }, [filterCategory]);

    // Active SVG view model from openGym geometry data
    const activeModel = bodyPathsData[gender] || bodyPathsData.male;
    const activeView = viewMode === "front" ? activeModel.front : activeModel.back;

    // Calculate heat color ramp: Level 0 to Level 4
    const getMuscleColor = (slug: string) => {
        const val = loadMap[slug] || 0;
        if (val === 0) return "#1f2026"; // Untrained dark surface
        const ratio = val / maxWeeklySets;
        if (ratio < 0.25) return "rgba(0, 255, 135, 0.25)";
        if (ratio < 0.50) return "rgba(0, 255, 135, 0.48)";
        if (ratio < 0.75) return "rgba(0, 255, 135, 0.72)";
        return "#00ff87"; // Full peak load
    };

    return (
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] p-5 sm:p-8 lg:p-10 font-sans selection:bg-[#00ff87]/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Top Navigation & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
                    <div>
                        <Link
                            href="/portal"
                            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 mb-2 font-medium"
                        >
                            <span>←</span> Back to Athlete Hub
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            ANATOMICAL <span className="text-[#00ff87]">VOLUME HEATMAP</span>
                        </h1>
                        <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                            High-precision vector silhouette powered by openGym geometry. Inspect training volume load,
                            target sets, and structural muscle balance in real time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-[#141518] border border-zinc-800 rounded-xl px-4 py-2 text-right">
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Total Volume</span>
                            <span className="text-xl font-black text-[#00ff87] font-mono">{totalWeeklySets} Sets</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid: Heatmap Vector Left, Analytics & Roster Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Interactive Vector Silhouette */}
                    <div className="lg:col-span-5 bg-[#141518] border border-zinc-800/80 rounded-2xl p-6 flex flex-col items-center space-y-6 shadow-xl">
                        {/* Control Bar: View Perspective & Anatomy Model */}
                        <div className="w-full flex items-center justify-between gap-3">
                            {/* Front / Back Perspective Switch */}
                            <div className="flex items-center bg-[#1b1c20] p-1 rounded-xl border border-zinc-800 flex-1">
                                <button
                                    onClick={() => setViewMode("front")}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        viewMode === "front"
                                            ? "bg-[#00ff87] text-black shadow-md shadow-[#00ff87]/20"
                                            : "text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Front View
                                </button>
                                <button
                                    onClick={() => setViewMode("back")}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        viewMode === "back"
                                            ? "bg-[#00ff87] text-black shadow-md shadow-[#00ff87]/20"
                                            : "text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Back View
                                </button>
                            </div>

                            {/* Gender Switch */}
                            <div className="flex items-center bg-[#1b1c20] p-1 rounded-xl border border-zinc-800">
                                <button
                                    onClick={() => setGender("male")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        gender === "male"
                                            ? "bg-zinc-700 text-white"
                                            : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                                >
                                    Male
                                </button>
                                <button
                                    onClick={() => setGender("female")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        gender === "female"
                                            ? "bg-zinc-700 text-white"
                                            : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                                >
                                    Female
                                </button>
                            </div>
                        </div>

                        {/* Interactive SVG Canvas */}
                        <div className="relative w-full max-w-sm aspect-[727/1280] bg-[#101114] rounded-2xl border border-zinc-800/80 p-4 flex items-center justify-center overflow-hidden shadow-inner">
                            {/* Radial Grid Background Accent */}
                            <div className="absolute inset-0 bg-[radial-gradient(#00ff87_1px,transparent_1px)] [background-size:18px_18px] opacity-10 pointer-events-none" />

                            <svg
                                viewBox={activeView.vb}
                                className="w-full h-full max-h-[500px] transition-all select-none"
                                role="img"
                                aria-label="3D Muscle Volume Anatomy Map"
                            >
                                {/* 1. Inert Silhouette Body Parts (head, hands, feet, etc.) */}
                                {INERT_PARTS.map((inertSlug) =>
                                    (activeView.p[inertSlug] || []).map((pathD, idx) => (
                                        <path
                                            key={`inert-${inertSlug}-${idx}`}
                                            d={pathD}
                                            fill="#24262d"
                                            stroke="#101114"
                                            strokeWidth={2.5}
                                            strokeLinejoin="round"
                                            className="pointer-events-none"
                                        />
                                    ))
                                )}

                                {/* 2. Active Muscle Groups with Heatmap Load Shading */}
                                {MUSCLE_SLUGS.map((slug) =>
                                    (activeView.p[slug] || []).map((pathD, idx) => {
                                        const isSelected = selectedId === slug;
                                        const muscleData = INITIAL_MUSCLE_DATA.find((m) => m.id === slug);
                                        const sets = loadMap[slug] || 0;
                                        return (
                                            <path
                                                key={`muscle-${slug}-${idx}`}
                                                d={pathD}
                                                fill={getMuscleColor(slug)}
                                                stroke={isSelected ? "#ffffff" : "#101114"}
                                                strokeWidth={isSelected ? 6 : 2.5}
                                                strokeLinejoin="round"
                                                className="cursor-pointer transition-all duration-200 hover:brightness-125 focus:outline-none"
                                                onClick={() => setSelectedId(slug)}
                                                tabIndex={0}
                                                role="button"
                                                aria-label={`${muscleData?.name || slug}: ${sets} sets`}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === " ") {
                                                        e.preventDefault();
                                                        setSelectedId(slug);
                                                    }
                                                }}
                                            >
                                                <title>{`${muscleData?.name || slug}: ${sets} sets`}</title>
                                            </path>
                                        );
                                    })
                                )}
                            </svg>
                        </div>

                        {/* Heatmap Legend */}
                        <div className="w-full bg-[#1b1c20]/60 border border-zinc-800/80 rounded-xl px-4 py-3 flex items-center justify-between text-[11px] text-zinc-400">
                            <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">
                                Training Volume
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-zinc-500 mr-1">Less</span>
                                <div className="w-3.5 h-3.5 rounded bg-[#1f2026] border border-zinc-800" title="0 sets" />
                                <div className="w-3.5 h-3.5 rounded bg-[#00ff87]/25" title="1-25% volume" />
                                <div className="w-3.5 h-3.5 rounded bg-[#00ff87]/50" title="26-50% volume" />
                                <div className="w-3.5 h-3.5 rounded bg-[#00ff87]/75" title="51-75% volume" />
                                <div className="w-3.5 h-3.5 rounded bg-[#00ff87] shadow-sm shadow-[#00ff87]/30" title="Optimal / Peak" />
                                <span className="text-[10px] text-zinc-300 ml-1 font-bold">More</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Selected Muscle Inspector & Anatomy Roster */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Muscle Focus Detail Card */}
                        <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-44 h-44 bg-[#00ff87]/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#1b1c20] text-zinc-400 border border-zinc-800">
                                            {selectedMuscle.category}
                                        </span>
                                        <span
                                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                                                selectedMuscle.status === "Optimal"
                                                    ? "bg-[#00ff87]/10 text-[#00ff87] border-[#00ff87]/30"
                                                    : selectedMuscle.status === "Underworked"
                                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                                    : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                            }`}
                                        >
                                            {selectedMuscle.status}
                                        </span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black text-white">{selectedMuscle.name}</h3>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            // Auto-flip view perspective if selected muscle is primarily on back
                                            const backDominant = ["upper-back", "gluteal", "hamstring", "lower-back"];
                                            if (backDominant.includes(selectedMuscle.id)) {
                                                setViewMode("back");
                                            } else {
                                                setViewMode("front");
                                            }
                                        }}
                                        className="bg-[#1b1c20] hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Auto-Align View ↺
                                    </button>
                                </div>
                            </div>

                            {/* Volume Metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
                                <div className="bg-[#1b1c20]/80 border border-zinc-800/80 rounded-xl p-4">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Weekly Sets</span>
                                    <span className="text-2xl font-black text-[#00ff87] font-mono mt-1 block">
                                        {selectedMuscle.weeklySets}{" "}
                                        <span className="text-xs font-normal text-zinc-500">sets</span>
                                    </span>
                                </div>

                                <div className="bg-[#1b1c20]/80 border border-zinc-800/80 rounded-xl p-4">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Target Load</span>
                                    <span className="text-2xl font-black text-zinc-200 font-mono mt-1 block">
                                        {selectedMuscle.targetSets}{" "}
                                        <span className="text-xs font-normal text-zinc-500">sets</span>
                                    </span>
                                </div>

                                <div className="bg-[#1b1c20]/80 border border-zinc-800/80 rounded-xl p-4 col-span-2 sm:col-span-1">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Completion</span>
                                    <span className="text-2xl font-black text-white font-mono mt-1 block">
                                        {Math.round((selectedMuscle.weeklySets / selectedMuscle.targetSets) * 100)}%
                                    </span>
                                </div>
                            </div>

                            {/* Progress Completion Bar */}
                            <div className="mt-5 space-y-2">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-zinc-400">Weekly Target Progress</span>
                                    <span className="text-[#00ff87] font-mono">
                                        {selectedMuscle.weeklySets} / {selectedMuscle.targetSets} sets
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

                            {/* Exercises contributing to this muscle */}
                            <div className="mt-6 pt-5 border-t border-zinc-800/80">
                                <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 block mb-2.5">
                                    Recommended Exercises
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMuscle.primaryExercises.map((ex, i) => (
                                        <span
                                            key={i}
                                            className="bg-[#1b1c20] border border-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium"
                                        >
                                            <span className="text-[#00ff87] text-[10px]">●</span> {ex}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* All Muscles Roster Table with Category Filters */}
                        <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <h4 className="text-sm font-bold text-white tracking-wide">
                                    Weekly Load by Anatomy ({filteredMuscles.length})
                                </h4>

                                {/* Filter Pills */}
                                <div className="flex items-center gap-1 bg-[#1b1c20] p-1 rounded-xl border border-zinc-800 overflow-x-auto">
                                    {["All", "Upper Body", "Core", "Lower Body", "Arms"].map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilterCategory(cat)}
                                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                                                filterCategory === cat
                                                    ? "bg-[#00ff87] text-black font-bold"
                                                    : "text-zinc-400 hover:text-white"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                                {filteredMuscles.map((item) => {
                                    const isSelected = selectedId === item.id;
                                    const pct = Math.round((item.weeklySets / item.targetSets) * 100);
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => setSelectedId(item.id)}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                                isSelected
                                                    ? "bg-[#1b1c20] border-[#00ff87]/60 shadow-md shadow-[#00ff87]/10"
                                                    : "bg-[#16171b]/60 border-zinc-800/60 hover:bg-[#1b1c20] hover:border-zinc-700/60"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{ backgroundColor: getMuscleColor(item.id) }}
                                                />
                                                <div>
                                                    <span className="text-xs font-bold text-zinc-200 block">
                                                        {item.name}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 font-mono">
                                                        {item.weeklySets} / {item.targetSets} sets • {pct}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-20 bg-zinc-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                                    <div
                                                        className="bg-[#00ff87] h-full rounded-full transition-all"
                                                        style={{ width: `${Math.min(100, pct)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-white font-mono min-w-[34px] text-right">
                                                    {item.weeklySets}s
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
