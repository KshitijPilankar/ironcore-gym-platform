"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface WorkoutLog {
    id: string;
    date: string;
    split: "Push Day" | "Pull Day" | "Leg Day" | "Full Body" | "Cardio Core";
    durationMinutes: number;
    totalVolumeKg: number;
    exercises: {
        name: string;
        sets: number;
        reps: number;
        weightKg: number;
    }[];
}

const INITIAL_LOGS: WorkoutLog[] = [
    {
        id: "log-1",
        date: "2026-11-02",
        split: "Push Day",
        durationMinutes: 65,
        totalVolumeKg: 4850,
        exercises: [
            { name: "Barbell Flat Bench Press", sets: 4, reps: 8, weightKg: 80 },
            { name: "Incline Dumbbell Press", sets: 3, reps: 10, weightKg: 28 },
            { name: "Cable Lateral Raises", sets: 4, reps: 15, weightKg: 12 },
            { name: "Triceps Rope Pushdown", sets: 3, reps: 12, weightKg: 30 },
        ],
    },
    {
        id: "log-2",
        date: "2026-10-31",
        split: "Pull Day",
        durationMinutes: 70,
        totalVolumeKg: 5400,
        exercises: [
            { name: "Barbell Bent-Over Row", sets: 4, reps: 8, weightKg: 75 },
            { name: "Weighted Pull-Up", sets: 3, reps: 6, weightKg: 15 },
            { name: "Seated Cable Row", sets: 3, reps: 12, weightKg: 55 },
            { name: "Incline Dumbbell Curl", sets: 3, reps: 12, weightKg: 14 },
        ],
    },
    {
        id: "log-3",
        date: "2026-10-29",
        split: "Leg Day",
        durationMinutes: 75,
        totalVolumeKg: 7200,
        exercises: [
            { name: "Barbell Back Squat", sets: 4, reps: 8, weightKg: 100 },
            { name: "Romanian Deadlift (RDL)", sets: 3, reps: 10, weightKg: 90 },
            { name: "Barbell Hip Thrust", sets: 3, reps: 12, weightKg: 110 },
            { name: "Standing Calf Raises", sets: 4, reps: 15, weightKg: 40 },
        ],
    },
];

export default function WorkoutHistoryPage() {
    const [logs, setLogs] = useState<WorkoutLog[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);

    // Form State for new entry
    const [splitName, setSplitName] = useState<WorkoutLog["split"]>("Push Day");
    const [duration, setDuration] = useState<number>(60);
    const [exerciseInput, setExerciseInput] = useState<string>("Barbell Flat Bench Press");
    const [setsInput, setSetsInput] = useState<number>(4);
    const [repsInput, setRepsInput] = useState<number>(10);
    const [weightInput, setWeightInput] = useState<number>(60);

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem("ironcore_workout_history");
        if (stored) {
            try {
                setLogs(JSON.parse(stored));
            } catch (e) {
                setLogs(INITIAL_LOGS);
            }
        } else {
            setLogs(INITIAL_LOGS);
            localStorage.setItem("ironcore_workout_history", JSON.stringify(INITIAL_LOGS));
        }
    }, []);

    const handleSaveWorkout = (e: React.FormEvent) => {
        e.preventDefault();
        const today = new Date().toISOString().split("T")[0];
        const totalVol = setsInput * repsInput * weightInput;

        const newLog: WorkoutLog = {
            id: `log-${Date.now()}`,
            date: today,
            split: splitName,
            durationMinutes: duration,
            totalVolumeKg: totalVol,
            exercises: [
                {
                    name: exerciseInput,
                    sets: setsInput,
                    reps: repsInput,
                    weightKg: weightInput,
                },
            ],
        };

        const updated = [newLog, ...logs];
        setLogs(updated);
        localStorage.setItem("ironcore_workout_history", JSON.stringify(updated));
        setShowLogModal(false);
    };

    const handlePrintReport = () => {
        window.print();
    };

    if (!isMounted) return null;

    const totalSessions = logs.length;
    const cumulativeVolume = logs.reduce((acc, curr) => acc + curr.totalVolumeKg, 0);

    return (
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] pt-8 sm:pt-10 pb-24 px-4 sm:px-8 font-sans selection:bg-[#00ff87]/30 print:bg-white print:text-black print:p-0">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Navigation & Header (Hidden on Print) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 print:hidden">
                    <div>
                        <Link
                            href="/portal"
                            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 mb-2"
                        >
                            ← Back to Athlete Hub
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            WORKOUT <span className="text-[#00ff87]">HISTORY & SESSIONS</span>
                        </h1>
                        <p className="text-xs text-zinc-400 mt-1">
                            Historical workout logbook, progressive overload tracking, and performance export.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowLogModal(true)}
                            className="bg-[#00ff87] hover:bg-[#00e57a] text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-[#00ff87]/20 flex items-center gap-1.5"
                        >
                            <span>+</span> Log New Session
                        </button>
                        <button
                            onClick={handlePrintReport}
                            className="bg-[#141518] hover:bg-[#1b1c20] border border-zinc-800 text-zinc-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
                        >
                            <span>📄</span> Export PDF Report
                        </button>
                    </div>
                </div>

                {/* Printable Official Header (Shows only on print) */}
                <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
                    <h2 className="text-2xl font-black tracking-tight text-black">
                        IRONCORE ATHLETE PERFORMANCE REPORT
                    </h2>
                    <p className="text-xs text-zinc-600">
                        Generated on {new Date().toLocaleDateString()} • Verified by IronCore & openGym Engine
                    </p>
                </div>

                {/* Aggregate Volume KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#141518] print:bg-zinc-100 border border-zinc-800/80 print:border-zinc-300 rounded-2xl p-5">
                        <span className="text-[10px] text-zinc-400 print:text-zinc-600 uppercase font-bold tracking-wider block">
                            Total Logged Sessions
                        </span>
                        <span className="text-2xl font-black text-white print:text-black font-mono mt-1 block">
                            {totalSessions} Completed
                        </span>
                    </div>

                    <div className="bg-[#141518] print:bg-zinc-100 border border-zinc-800/80 print:border-zinc-300 rounded-2xl p-5">
                        <span className="text-[10px] text-zinc-400 print:text-zinc-600 uppercase font-bold tracking-wider block">
                            Cumulative Volume Lifted
                        </span>
                        <span className="text-2xl font-black text-[#00ff87] print:text-emerald-700 font-mono mt-1 block">
                            {(cumulativeVolume / 1000).toFixed(1)}k <span className="text-xs font-normal text-zinc-400">kg</span>
                        </span>
                    </div>

                    <div className="bg-[#141518] print:bg-zinc-100 border border-zinc-800/80 print:border-zinc-300 rounded-2xl p-5">
                        <span className="text-[10px] text-zinc-400 print:text-zinc-600 uppercase font-bold tracking-wider block">
                            Avg Session Length
                        </span>
                        <span className="text-2xl font-black text-zinc-200 print:text-black font-mono mt-1 block">
                            ~70 <span className="text-xs font-normal text-zinc-400">min</span>
                        </span>
                    </div>
                </div>

                {/* History Feed List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">
                        Past Training Sessions
                    </h3>

                    <div className="space-y-3">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="bg-[#141518] print:bg-zinc-50 border border-zinc-800/80 print:border-zinc-300 rounded-2xl p-5 shadow-lg space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 print:border-zinc-200 pb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#00ff87]/10 text-[#00ff87] border border-[#00ff87]/30 print:border-emerald-600 print:text-emerald-800">
                                            {log.split}
                                        </span>
                                        <span className="text-xs font-mono text-zinc-400 print:text-zinc-600 font-bold">
                                            {log.date}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-mono">
                                        <span className="text-zinc-400 print:text-zinc-600">
                                            Duration: <strong className="text-white print:text-black">{log.durationMinutes}m</strong>
                                        </span>
                                        <span className="text-zinc-400 print:text-zinc-600">
                                            Session Volume: <strong className="text-[#00ff87] print:text-emerald-700">{log.totalVolumeKg} kg</strong>
                                        </span>
                                    </div>
                                </div>

                                {/* Exercises in Session */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {log.exercises.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between bg-[#1b1c20] print:bg-white border border-zinc-800/80 print:border-zinc-200 rounded-xl p-3 text-xs"
                                        >
                                            <span className="font-semibold text-zinc-200 print:text-black truncate pr-2">
                                                • {item.name}
                                            </span>
                                            <span className="font-mono text-zinc-400 print:text-zinc-700 whitespace-nowrap">
                                                {item.sets} sets × {item.reps} @ {item.weightKg}kg
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Log Workout Modal */}
            {showLogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden">
                    <div className="bg-[#141518] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <h3 className="text-base font-bold text-white">Log Training Session</h3>
                            <button
                                onClick={() => setShowLogModal(false)}
                                className="text-zinc-400 hover:text-white text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveWorkout} className="space-y-3.5 text-xs">
                            <div>
                                <label className="text-zinc-400 font-semibold block mb-1">Workout Split</label>
                                <select
                                    value={splitName}
                                    onChange={(e) => setSplitName(e.target.value as any)}
                                    className="w-full bg-[#1b1c20] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                >
                                    <option value="Push Day">Push Day (Chest, Shoulders, Triceps)</option>
                                    <option value="Pull Day">Pull Day (Back, Lats, Biceps)</option>
                                    <option value="Leg Day">Leg Day (Quads, Hamstrings, Glutes)</option>
                                    <option value="Full Body">Full Body Compound</option>
                                    <option value="Cardio Core">Cardio & Core</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-zinc-400 font-semibold block mb-1">Primary Exercise Name</label>
                                <input
                                    type="text"
                                    required
                                    value={exerciseInput}
                                    onChange={(e) => setExerciseInput(e.target.value)}
                                    className="w-full bg-[#1b1c20] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="text-zinc-400 font-semibold block mb-1">Sets</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        required
                                        value={setsInput}
                                        onChange={(e) => setSetsInput(parseInt(e.target.value) || 1)}
                                        className="w-full bg-[#1b1c20] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                    />
                                </div>
                                <div>
                                    <label className="text-zinc-400 font-semibold block mb-1">Reps</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        required
                                        value={repsInput}
                                        onChange={(e) => setRepsInput(parseInt(e.target.value) || 1)}
                                        className="w-full bg-[#1b1c20] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                    />
                                </div>
                                <div>
                                    <label className="text-zinc-400 font-semibold block mb-1">Weight (kg)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        required
                                        value={weightInput}
                                        onChange={(e) => setWeightInput(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-[#1b1c20] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-zinc-400 font-semibold block mb-1">Duration (minutes)</label>
                                <input
                                    type="number"
                                    min="10"
                                    max="180"
                                    required
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                                    className="w-full bg-[#1b1c20] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                />
                            </div>

                            <div className="pt-3 flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowLogModal(false)}
                                    className="px-4 py-2 bg-[#1b1c20] hover:bg-[#25272e] text-zinc-300 rounded-xl font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#00ff87] hover:bg-[#00e57a] text-black rounded-xl font-bold transition-all shadow-md shadow-[#00ff87]/20"
                                >
                                    Save Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}