"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Exercise {
    id: string;
    name: string;
    muscle: string;
    category: "Chest" | "Back" | "Shoulders" | "Legs" | "Core" | "Arms";
    equipment: "Barbell" | "Dumbbell" | "Cable" | "Bodyweight" | "Machine";
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    primaryLoad: string;
    cues: string[];
}

const EXERCISE_LIBRARY: Exercise[] = [
    {
        id: "ex-1",
        name: "Barbell Flat Bench Press",
        muscle: "Pectoralis Major, Triceps",
        category: "Chest",
        equipment: "Barbell",
        difficulty: "Intermediate",
        primaryLoad: "Upper Body Horizontal Push",
        cues: ["Retract scapula into bench", "Lower bar to lower chest", "Drive heels into ground"],
    },
    {
        id: "ex-2",
        name: "Incline Dumbbell Press",
        muscle: "Clavicular Pectoral Head, Anterior Delt",
        category: "Chest",
        equipment: "Dumbbell",
        difficulty: "Intermediate",
        primaryLoad: "Upper Chest Incline Push",
        cues: ["Bench angle 30 degrees", "Control the 3-second eccentric", "Avoid clanking dumbbells"],
    },
    {
        id: "ex-3",
        name: "Weighted Chest Dips",
        muscle: "Lower Pectorals, Triceps, Core",
        category: "Chest",
        equipment: "Bodyweight",
        difficulty: "Advanced",
        primaryLoad: "Vertical Bodyweight Push",
        cues: ["Slight forward torso lean", "Break at elbows to 90 degrees", "Lock out triceps at apex"],
    },
    {
        id: "ex-4",
        name: "Barbell Bent-Over Row",
        muscle: "Latissimus Dorsi, Rhomboids, Traps",
        category: "Back",
        equipment: "Barbell",
        difficulty: "Intermediate",
        primaryLoad: "Horizontal Pull Load",
        cues: ["Hinge at hips at 45 degrees", "Pull elbows past ribcage", "Maintain neutral spine"],
    },
    {
        id: "ex-5",
        name: "Weighted Pull-Up",
        muscle: "Latissimus Dorsi, Biceps, Core",
        category: "Back",
        equipment: "Bodyweight",
        difficulty: "Advanced",
        primaryLoad: "Vertical Lat Pull",
        cues: ["Deadhang start position", "Drive elbows downward to ribs", "Chest to bar touch"],
    },
    {
        id: "ex-6",
        name: "Seated Cable Row",
        muscle: "Mid-Back, Lower Traps",
        category: "Back",
        equipment: "Cable",
        difficulty: "Beginner",
        primaryLoad: "Horizontal Cable Tension",
        cues: ["Keep upright torso", "Squeeze shoulder blades 1 second", "Do not hyperextend spine"],
    },
    {
        id: "ex-7",
        name: "Overhead Military Press",
        muscle: "Anterior Deltoids, Lateral Delts, Triceps",
        category: "Shoulders",
        equipment: "Barbell",
        difficulty: "Intermediate",
        primaryLoad: "Vertical Compound Push",
        cues: ["Glutes & core locked tight", "Bar path directly vertical", "Head passes under bar"],
    },
    {
        id: "ex-8",
        name: "Cable Lateral Raises",
        muscle: "Lateral Deltoids",
        category: "Shoulders",
        equipment: "Cable",
        difficulty: "Beginner",
        primaryLoad: "Isolated Lateral Tension",
        cues: ["Cable at wrist height", "Slight elbow bend", "Lead with pinky finger"],
    },
    {
        id: "ex-9",
        name: "Barbell Back Squat",
        muscle: "Quadriceps, Glutes, Adductors",
        category: "Legs",
        equipment: "Barbell",
        difficulty: "Advanced",
        primaryLoad: "Lower Body Compound Hinge",
        cues: ["Brace diaphragm before descent", "Knees track over second toe", "Break parallel plane"],
    },
    {
        id: "ex-10",
        name: "Romanian Deadlift (RDL)",
        muscle: "Hamstrings, Gluteus Maximus, Lower Back",
        category: "Legs",
        equipment: "Barbell",
        difficulty: "Intermediate",
        primaryLoad: "Posterior Chain Stretch",
        cues: ["Push hips back towards wall", "Shins stay vertical", "Feel deep hamstring stretch"],
    },
    {
        id: "ex-11",
        name: "Barbell Hip Thrust",
        muscle: "Gluteus Maximus",
        category: "Legs",
        equipment: "Barbell",
        difficulty: "Intermediate",
        primaryLoad: "Horizontal Glute Drive",
        cues: ["Bench under scapula line", "Full hip extension lockout", "Chin tucked to chest"],
    },
    {
        id: "ex-12",
        name: "Incline Dumbbell Curl",
        muscle: "Biceps Brachii Long Head",
        category: "Arms",
        equipment: "Dumbbell",
        difficulty: "Beginner",
        primaryLoad: "Bicep Stretch Focus",
        cues: ["Bench set to 45 degrees", "Elbows pinned behind torso", "Full stretch at bottom"],
    },
    {
        id: "ex-13",
        name: "Triceps Rope Pushdown",
        muscle: "Lateral & Medial Tricep Heads",
        category: "Arms",
        equipment: "Cable",
        difficulty: "Beginner",
        primaryLoad: "Tricep Lockout Tension",
        cues: ["Elbows stationary at sides", "Spread rope apart at bottom", "Control 2-second return"],
    },
    {
        id: "ex-14",
        name: "Hanging Leg Raises",
        muscle: "Rectus Abdominis, Hip Flexors",
        category: "Core",
        equipment: "Bodyweight",
        difficulty: "Intermediate",
        primaryLoad: "Lower Core Tension",
        cues: ["Do not swing or kick", "Roll pelvis upwards to chest", "Control negative drop"],
    },
    {
        id: "ex-15",
        name: "Cable Woodchoppers",
        muscle: "Obliques, Transverse Abdominis",
        category: "Core",
        equipment: "Cable",
        difficulty: "Intermediate",
        primaryLoad: "Rotational Core Power",
        cues: ["Rotate from core, not arms", "Pivot rear foot smoothly", "Maintain solid wide base"],
    },
];

export default function ExerciseEnginePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedEquipment, setSelectedEquipment] = useState<string>("All");
    const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);

    const categories = ["All", "Chest", "Back", "Shoulders", "Legs", "Arms", "Core"];
    const equipmentTypes = ["All", "Barbell", "Dumbbell", "Cable", "Bodyweight", "Machine"];

    const filteredExercises = EXERCISE_LIBRARY.filter((ex) => {
        const matchesSearch =
            ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ex.muscle.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || ex.category === selectedCategory;
        const matchesEquipment = selectedEquipment === "All" || ex.equipment === selectedEquipment;
        return matchesSearch && matchesCategory && matchesEquipment;
    });

    return (
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] pt-8 sm:pt-10 pb-24 px-4 sm:px-8 font-sans selection:bg-[#00ff87]/30">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Navigation & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
                    <div>
                        <Link
                            href="/portal"
                            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 mb-2"
                        >
                            ← Back to Athlete Hub
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            5,600+ <span className="text-[#00ff87]">EXERCISE ENGINE</span>
                        </h1>
                        <p className="text-xs text-zinc-400 mt-1">
                            Filter by anatomical muscle groups, equipment type, and mechanical load vectors.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/portal/stats"
                            className="bg-[#141518] hover:bg-[#1b1c20] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-all flex items-center gap-2"
                        >
                            <span>🧬</span> View Muscle Heatmap
                        </Link>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
                    {/* Search bar */}
                    <div className="relative">
                        <span className="absolute left-3.5 top-3 text-zinc-500 text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder="Search exercise by name or target muscle (e.g. Bench, Lat, Quads)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1b1c20] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87]"
                        />
                    </div>

                    {/* Muscle Category Chips */}
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                            Muscle Group
                        </span>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${selectedCategory === cat
                                            ? "bg-[#00ff87] text-black border-[#00ff87] shadow-md shadow-[#00ff87]/20"
                                            : "bg-[#1b1c20] text-zinc-400 border-zinc-800 hover:text-white"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Equipment Type Chips */}
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                            Equipment Load
                        </span>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                            {equipmentTypes.map((eq) => (
                                <button
                                    key={eq}
                                    onClick={() => setSelectedEquipment(eq)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${selectedEquipment === eq
                                            ? "bg-zinc-700 text-white border-zinc-600"
                                            : "bg-[#1b1c20] text-zinc-400 border-zinc-800 hover:text-white"
                                        }`}
                                >
                                    {eq}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Exercises Grid */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                        <span>Showing {filteredExercises.length} cataloged exercises</span>
                        <span className="font-mono text-[11px]">Database v2.4 • openGym Engine</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredExercises.map((ex) => (
                            <div
                                key={ex.id}
                                onClick={() => setActiveExerciseModal(ex)}
                                className="bg-[#141518] border border-zinc-800/80 hover:border-[#00ff87]/50 rounded-2xl p-5 flex flex-col justify-between transition-all cursor-pointer group shadow-lg"
                            >
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1b1c20] border border-zinc-800 text-[#00ff87]">
                                            {ex.category}
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-500">
                                            {ex.equipment}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-white group-hover:text-[#00ff87] transition-colors line-clamp-1">
                                        {ex.name}
                                    </h3>

                                    <p className="text-xs text-zinc-400 line-clamp-1">
                                        🎯 {ex.muscle}
                                    </p>
                                </div>

                                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                                    <span
                                        className={`font-semibold text-[10px] uppercase ${ex.difficulty === "Advanced"
                                                ? "text-red-400"
                                                : ex.difficulty === "Intermediate"
                                                    ? "text-amber-400"
                                                    : "text-[#00ff87]"
                                            }`}
                                    >
                                        {ex.difficulty}
                                    </span>
                                    <span className="text-[#00ff87] font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                                        View Execution Cues →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Exercise Details Modal */}
            {activeExerciseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#141518] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00ff87] block">
                                    {activeExerciseModal.category} • {activeExerciseModal.equipment}
                                </span>
                                <h3 className="text-lg font-bold text-white mt-0.5">
                                    {activeExerciseModal.name}
                                </h3>
                            </div>
                            <button
                                onClick={() => setActiveExerciseModal(null)}
                                className="text-zinc-500 hover:text-white text-base px-2 py-1"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="bg-[#1b1c20] p-3.5 rounded-xl border border-zinc-800 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                                    Target Anatomical Region
                                </span>
                                <span className="font-semibold text-zinc-200">
                                    {activeExerciseModal.muscle}
                                </span>
                            </div>

                            <div className="bg-[#1b1c20] p-3.5 rounded-xl border border-zinc-800 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                                    Mechanical Profile
                                </span>
                                <span className="font-semibold text-zinc-200">
                                    {activeExerciseModal.primaryLoad}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                                    Form & Execution Cues
                                </span>
                                <ul className="space-y-1.5">
                                    {activeExerciseModal.cues.map((cue, idx) => (
                                        <li
                                            key={idx}
                                            className="flex items-start gap-2 bg-[#18191d] p-2.5 rounded-lg border border-zinc-800/80 text-zinc-300"
                                        >
                                            <span className="text-[#00ff87] font-bold">✓</span>
                                            <span>{cue}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-zinc-800 flex justify-end">
                            <button
                                onClick={() => setActiveExerciseModal(null)}
                                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}