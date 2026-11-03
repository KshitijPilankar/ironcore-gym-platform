"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface WorkoutExercise {
    id: string;
    name: string;
    sets: {
        setNumber: number;
        reps: number;
        weightKg: number;
        completed: boolean;
    }[];
}

interface WorkoutLog {
    id: string;
    date: string;
    split: string;
    durationMinutes: number;
    totalVolumeKg: number;
    status?: "Completed" | "In-Progress";
    exercises: {
        name: string;
        sets: number;
        reps: number;
        weightKg: number;
        completedSetsCount?: number;
        setDetails?: {
            setNumber: number;
            reps: number;
            weightKg: number;
            completed: boolean;
        }[];
    }[];
}

const INITIAL_LOGS: WorkoutLog[] = [
    {
        id: "log-1",
        date: "2026-11-03",
        split: "Push Day",
        durationMinutes: 60,
        totalVolumeKg: 2400,
        status: "Completed",
        exercises: [
            {
                name: "Barbell Flat Bench Press",
                sets: 4,
                reps: 10,
                weightKg: 60,
                completedSetsCount: 4,
                setDetails: [
                    { setNumber: 1, reps: 10, weightKg: 60, completed: true },
                    { setNumber: 2, reps: 10, weightKg: 60, completed: true },
                    { setNumber: 3, reps: 10, weightKg: 60, completed: true },
                    { setNumber: 4, reps: 10, weightKg: 60, completed: true },
                ],
            },
        ],
    },
    {
        id: "log-2",
        date: "2026-11-02",
        split: "Push Day",
        durationMinutes: 65,
        totalVolumeKg: 4850,
        status: "Completed",
        exercises: [
            {
                name: "Barbell Flat Bench Press",
                sets: 4,
                reps: 8,
                weightKg: 80,
                completedSetsCount: 4,
                setDetails: [
                    { setNumber: 1, reps: 8, weightKg: 80, completed: true },
                    { setNumber: 2, reps: 8, weightKg: 80, completed: true },
                    { setNumber: 3, reps: 8, weightKg: 80, completed: true },
                    { setNumber: 4, reps: 8, weightKg: 80, completed: true },
                ],
            },
            {
                name: "Incline Dumbbell Press",
                sets: 3,
                reps: 10,
                weightKg: 28,
                completedSetsCount: 3,
                setDetails: [
                    { setNumber: 1, reps: 10, weightKg: 28, completed: true },
                    { setNumber: 2, reps: 10, weightKg: 28, completed: true },
                    { setNumber: 3, reps: 10, weightKg: 28, completed: true },
                ],
            },
            {
                name: "Cable Lateral Raises",
                sets: 4,
                reps: 15,
                weightKg: 12,
                completedSetsCount: 4,
                setDetails: [
                    { setNumber: 1, reps: 15, weightKg: 12, completed: true },
                    { setNumber: 2, reps: 15, weightKg: 12, completed: true },
                    { setNumber: 3, reps: 15, weightKg: 12, completed: true },
                    { setNumber: 4, reps: 15, weightKg: 12, completed: true },
                ],
            },
            {
                name: "Triceps Rope Pushdown",
                sets: 3,
                reps: 12,
                weightKg: 30,
                completedSetsCount: 3,
                setDetails: [
                    { setNumber: 1, reps: 12, weightKg: 30, completed: true },
                    { setNumber: 2, reps: 12, weightKg: 30, completed: true },
                    { setNumber: 3, reps: 12, weightKg: 30, completed: true },
                ],
            },
        ],
    },
];

export default function WorkoutHistoryPage() {
    const [logs, setLogs] = useState<WorkoutLog[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    // Live Workout Tracker State
    const [isLiveActive, setIsLiveActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Rest Timer Mode
    const [isResting, setIsResting] = useState(false);
    const [restSecondsLeft, setRestSecondsLeft] = useState<number>(60);
    const restTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Active Workout Setup
    const [activeSplit, setActiveSplit] = useState("Push Day");
    const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>([
        {
            id: "ex-live-1",
            name: "Barbell Flat Bench Press",
            sets: [
                { setNumber: 1, reps: 10, weightKg: 60, completed: true },
                { setNumber: 2, reps: 10, weightKg: 60, completed: false },
                { setNumber: 3, reps: 8, weightKg: 65, completed: false },
            ],
        },
    ]);
    const [newExerciseName, setNewExerciseName] = useState("");

    // Inspect Past Workout Modal State
    const [inspectedSession, setInspectedSession] = useState<WorkoutLog | null>(null);

    // Manual Quick Log Modal State
    const [showQuickLogModal, setShowQuickLogModal] = useState(false);
    const [manualSplit, setManualSplit] = useState("Push Day");
    const [manualExercise, setManualExercise] = useState("Barbell Flat Bench Press");
    const [manualSets, setManualSets] = useState(4);
    const [manualReps, setManualReps] = useState(10);
    const [manualWeight, setManualWeight] = useState(60);
    const [manualDuration, setManualDuration] = useState(60);

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem("ironcore_workout_history");
        if (stored) {
            try {
                setLogs(JSON.parse(stored));
            } catch {
                setLogs(INITIAL_LOGS);
            }
        } else {
            setLogs(INITIAL_LOGS);
            localStorage.setItem("ironcore_workout_history", JSON.stringify(INITIAL_LOGS));
        }
    }, []);

    // Main Stopwatch Logic
    useEffect(() => {
        if (isLiveActive && !isPaused && !isResting) {
            timerRef.current = setInterval(() => {
                setElapsedSeconds((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isLiveActive, isPaused, isResting]);

    // Rest Timer Logic
    useEffect(() => {
        if (isResting && !isPaused) {
            restTimerRef.current = setInterval(() => {
                setRestSecondsLeft((prev) => {
                    if (prev <= 1) {
                        setIsResting(false);
                        return 60;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (restTimerRef.current) clearInterval(restTimerRef.current);
        }
        return () => {
            if (restTimerRef.current) clearInterval(restTimerRef.current);
        };
    }, [isResting, isPaused]);

    const formatTime = (totalSecs: number) => {
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const startLiveWorkout = () => {
        setElapsedSeconds(0);
        setIsPaused(false);
        setIsResting(false);
        setIsLiveActive(true);
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    const resetCurrentTimer = () => {
        if (isResting) {
            setRestSecondsLeft(60);
        } else {
            setElapsedSeconds(0);
        }
    };

    // Helper to construct log payload
    const buildCurrentSessionPayload = (isFinalComplete: boolean): WorkoutLog => {
        const today = new Date().toISOString().split("T")[0];
        const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));

        let totalVol = 0;
        const finalExercises = activeExercises.map((ex) => {
            const completedSets = ex.sets.filter((s) => s.completed);
            const exerciseVol = completedSets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);
            totalVol += exerciseVol;
            return {
                name: ex.name,
                sets: ex.sets.length,
                reps: ex.sets[0]?.reps || 10,
                weightKg: ex.sets[0]?.weightKg || 50,
                completedSetsCount: completedSets.length,
                setDetails: ex.sets,
            };
        });

        if (totalVol === 0) totalVol = 1800;

        return {
            id: `log-${Date.now()}`,
            date: today,
            split: activeSplit,
            durationMinutes: durationMins,
            totalVolumeKg: totalVol,
            status: isFinalComplete ? "Completed" : "In-Progress",
            exercises: finalExercises,
        };
    };

    // 1. Save Progress & Draft Option
    const handleSaveDraft = () => {
        const newLog = buildCurrentSessionPayload(false);
        const updated = [newLog, ...logs];
        setLogs(updated);
        localStorage.setItem("ironcore_workout_history", JSON.stringify(updated));

        setIsLiveActive(false);
        setIsPaused(false);
        setElapsedSeconds(0);
        setIsResting(false);
        alert("💾 Workout progress saved as draft! You can resume it anytime from past sessions.");
    };

    // 2. Complete & Final Save Option
    const handleFinishAndSaveFinal = () => {
        const newLog = buildCurrentSessionPayload(true);
        const updated = [newLog, ...logs];
        setLogs(updated);
        localStorage.setItem("ironcore_workout_history", JSON.stringify(updated));

        setIsLiveActive(false);
        setIsPaused(false);
        setElapsedSeconds(0);
        setIsResting(false);
        alert(`🎉 Workout Completed! Logged ${newLog.durationMinutes}m and ${(newLog.totalVolumeKg / 1000).toFixed(1)}k kg volume.`);
    };

    const cancelLiveWorkout = () => {
        if (window.confirm("Discard this active workout session?")) {
            setIsLiveActive(false);
            setIsPaused(false);
            setElapsedSeconds(0);
            setIsResting(false);
        }
    };

    // Delete Individual Set Function
    const deleteSetFromExercise = (exId: string, setNumber: number) => {
        setActiveExercises((prev) =>
            prev.map((ex) => {
                if (ex.id !== exId) return ex;
                if (ex.sets.length <= 1) {
                    alert("At least one set must remain. You can remove the exercise instead.");
                    return ex;
                }
                const filtered = ex.sets.filter((s) => s.setNumber !== setNumber);
                // Re-index set numbers
                const reindexed = filtered.map((s, idx) => ({
                    ...s,
                    setNumber: idx + 1,
                }));
                return {
                    ...ex,
                    sets: reindexed,
                };
            })
        );
    };

    // Remove entire exercise from active workout
    const removeExerciseFromActive = (exId: string) => {
        if (activeExercises.length <= 1) {
            alert("At least one exercise is required in the session.");
            return;
        }
        setActiveExercises((prev) => prev.filter((ex) => ex.id !== exId));
    };

    const resumePastSession = (session: WorkoutLog) => {
        setActiveSplit(session.split);
        setElapsedSeconds(session.durationMinutes * 60);

        const mappedExercises: WorkoutExercise[] = session.exercises.map((ex, idx) => {
            if (ex.setDetails && ex.setDetails.length > 0) {
                return {
                    id: `ex-resume-${idx}-${Date.now()}`,
                    name: ex.name,
                    sets: ex.setDetails,
                };
            }
            const setsArr = [];
            const totalCount = ex.sets || 3;
            const completedCount = ex.completedSetsCount ?? totalCount;
            for (let i = 1; i <= totalCount; i++) {
                setsArr.push({
                    setNumber: i,
                    reps: ex.reps || 10,
                    weightKg: ex.weightKg || 50,
                    completed: i <= completedCount,
                });
            }
            return {
                id: `ex-resume-${idx}-${Date.now()}`,
                name: ex.name,
                sets: setsArr,
            };
        });

        setActiveExercises(mappedExercises);
        setIsPaused(false);
        setIsResting(false);
        setIsLiveActive(true);
        setInspectedSession(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const toggleSetComplete = (exId: string, setNumber: number) => {
        setActiveExercises((prev) =>
            prev.map((ex) => {
                if (ex.id !== exId) return ex;
                return {
                    ...ex,
                    sets: ex.sets.map((s) => {
                        if (s.setNumber !== setNumber) return s;
                        const willComplete = !s.completed;
                        if (willComplete) {
                            setIsResting(true);
                            setRestSecondsLeft(60);
                        }
                        return { ...s, completed: willComplete };
                    }),
                };
            })
        );
    };

    const addSetToExercise = (exId: string) => {
        setActiveExercises((prev) =>
            prev.map((ex) => {
                if (ex.id !== exId) return ex;
                const lastSet = ex.sets[ex.sets.length - 1];
                return {
                    ...ex,
                    sets: [
                        ...ex.sets,
                        {
                            setNumber: ex.sets.length + 1,
                            reps: lastSet ? lastSet.reps : 10,
                            weightKg: lastSet ? lastSet.weightKg : 50,
                            completed: false,
                        },
                    ],
                };
            })
        );
    };

    const addExerciseToActiveWorkout = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExerciseName.trim()) return;
        setActiveExercises((prev) => [
            ...prev,
            {
                id: `ex-live-${Date.now()}`,
                name: newExerciseName.trim(),
                sets: [
                    { setNumber: 1, reps: 10, weightKg: 50, completed: false },
                    { setNumber: 2, reps: 10, weightKg: 50, completed: false },
                    { setNumber: 3, reps: 8, weightKg: 55, completed: false },
                ],
            },
        ]);
        setNewExerciseName("");
    };

    const deletePastLog = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (window.confirm("Permanently delete this workout log?")) {
            const filtered = logs.filter((l) => l.id !== id);
            setLogs(filtered);
            localStorage.setItem("ironcore_workout_history", JSON.stringify(filtered));
            if (inspectedSession?.id === id) setInspectedSession(null);
        }
    };

    const handleManualQuickLog = (e: React.FormEvent) => {
        e.preventDefault();
        const today = new Date().toISOString().split("T")[0];
        const newLog: WorkoutLog = {
            id: `log-${Date.now()}`,
            date: today,
            split: manualSplit,
            durationMinutes: manualDuration,
            totalVolumeKg: manualSets * manualReps * manualWeight,
            status: "Completed",
            exercises: [
                {
                    name: manualExercise,
                    sets: manualSets,
                    reps: manualReps,
                    weightKg: manualWeight,
                    completedSetsCount: manualSets,
                },
            ],
        };
        const updated = [newLog, ...logs];
        setLogs(updated);
        localStorage.setItem("ironcore_workout_history", JSON.stringify(updated));
        setShowQuickLogModal(false);
    };

    if (!isMounted) return null;

    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const progressRatio = isResting
        ? (60 - restSecondsLeft) / 60
        : (elapsedSeconds % 60) / 60;
    const strokeDashoffset = circumference - progressRatio * circumference;

    const totalSessions = logs.length;
    const cumulativeVolume = logs.reduce((acc, curr) => acc + curr.totalVolumeKg, 0);

    return (
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] pt-8 sm:pt-10 pb-28 px-4 sm:px-8 font-sans selection:bg-[#00ff87]/30 print:bg-white print:text-black print:p-0">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Navigation & Header */}
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
                            Mobile circular stopwatch, live set logger, progressive overload tracking, and performance export.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {!isLiveActive ? (
                            <button
                                onClick={startLiveWorkout}
                                className="bg-[#00ff87] hover:bg-[#00e57a] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-[#00ff87]/20 flex items-center gap-2"
                            >
                                <span>▶</span> Start Live Workout
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                                <span className="text-xs font-mono font-bold text-red-400">Workout In Progress</span>
                            </div>
                        )}

                        <button
                            onClick={() => setShowQuickLogModal(true)}
                            className="bg-[#141518] hover:bg-[#1b1c20] border border-zinc-800 text-zinc-300 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all"
                        >
                            + Quick Manual Log
                        </button>

                        <button
                            onClick={() => window.print()}
                            className="bg-[#141518] hover:bg-[#1b1c20] border border-zinc-800 text-zinc-300 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                        >
                            <span>📄</span> Export PDF
                        </button>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* MOBILE CIRCULAR STOPWATCH / TIMER ACTIVE CARD                            */}
                {/* ========================================================================= */}
                {isLiveActive && (
                    <div className="bg-[#121418] border-2 border-[#00ff87]/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#00ff87]/10 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
                        <div className="w-full flex items-center justify-between text-xs font-semibold text-zinc-400 border-b border-zinc-800/80 pb-3">
                            <span className="uppercase tracking-widest text-[#00ff87] font-bold">
                                {isResting ? "REST INTERVAL" : `${activeSplit.toUpperCase()} ACTIVE`}
                            </span>
                            <span className="font-mono text-zinc-500">
                                {isPaused ? "PAUSED" : "RECORDING"}
                            </span>
                        </div>

                        {/* Circular Gauge Ring */}
                        <div className="relative w-64 h-64 flex items-center justify-center select-none">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                                <circle cx="100" cy="100" r={radius} stroke="#1c1e24" strokeWidth="12" fill="transparent" />
                                <circle
                                    cx="100"
                                    cy="100"
                                    r={radius}
                                    stroke={isResting ? "#38bdf8" : "#00ff87"}
                                    strokeWidth="12"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    className="transition-all duration-300 ease-linear"
                                />
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                                    {isResting ? formatTime(restSecondsLeft) : formatTime(elapsedSeconds)}
                                </span>
                                <span className="text-xs font-semibold text-zinc-400 mt-1">
                                    {isResting ? `Workout time: ${formatTime(elapsedSeconds)}` : `Remaining time: 60:00`}
                                </span>
                            </div>
                        </div>

                        {/* Timer Center Controls */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={resetCurrentTimer}
                                className="w-14 h-14 rounded-2xl bg-[#1b1d24] hover:bg-[#252833] text-zinc-300 border border-zinc-700/80 flex items-center justify-center text-xl transition-all shadow-md active:scale-95"
                                title="Reset timer"
                            >
                                ↺
                            </button>

                            <button
                                onClick={togglePause}
                                className={`w-20 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all shadow-xl active:scale-95 ${isPaused ? "bg-[#00ff87] text-black shadow-[#00ff87]/30" : "bg-[#00e57a] text-black hover:bg-[#00ff87]"
                                    }`}
                                title={isPaused ? "Resume" : "Pause"}
                            >
                                {isPaused ? "▶" : "⏸"}
                            </button>

                            <button
                                onClick={cancelLiveWorkout}
                                className="w-14 h-14 rounded-2xl bg-[#1b1d24] hover:bg-red-500/20 text-red-400 border border-zinc-700/80 flex items-center justify-center text-base transition-all shadow-md active:scale-95"
                                title="Discard workout"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 2 DISTINCT FINISH & SAVE BUTTONS */}
                        <div className="w-full flex flex-col sm:flex-row items-center gap-3 pt-2">
                            <button
                                onClick={handleSaveDraft}
                                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#1c1e24] hover:bg-[#262932] text-zinc-200 border border-zinc-700/90 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                            >
                                <span>💾</span>
                                <span>Save Progress as Draft</span>
                            </button>

                            <button
                                onClick={handleFinishAndSaveFinal}
                                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] text-black text-xs font-black transition-all shadow-lg shadow-[#00ff87]/25 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <span>✓</span>
                                <span>Complete & Log Final Session</span>
                            </button>
                        </div>

                        {/* Live Exercises Tracker */}
                        <div className="w-full space-y-4 pt-4 border-t border-zinc-800/80">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    Session Movements & Sets
                                </span>
                                <span className="text-[11px] text-zinc-500 font-mono">Click ✕ to delete accidental sets</span>
                            </div>

                            <div className="space-y-3">
                                {activeExercises.map((ex) => (
                                    <div key={ex.id} className="bg-[#181a20] border border-zinc-800 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                                <span className="text-[#00ff87]">🏋️</span> {ex.name}
                                            </h4>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => addSetToExercise(ex.id)}
                                                    className="text-[11px] font-bold text-[#00ff87] hover:underline"
                                                >
                                                    + Add Set
                                                </button>
                                                <button
                                                    onClick={() => removeExerciseFromActive(ex.id)}
                                                    className="text-[11px] font-bold text-zinc-500 hover:text-red-400"
                                                    title="Remove exercise"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            {ex.sets.map((set) => (
                                                <div
                                                    key={set.setNumber}
                                                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-mono border transition-all ${set.completed
                                                            ? "bg-[#00ff87]/10 border-[#00ff87]/30 text-white"
                                                            : "bg-[#121418] border-zinc-800 text-zinc-400"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-zinc-500">Set {set.setNumber}</span>
                                                        <span className="text-white font-bold">{set.weightKg} kg</span>
                                                        <span>× {set.reps} reps</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => toggleSetComplete(ex.id, set.setNumber)}
                                                            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${set.completed
                                                                    ? "bg-[#00ff87] text-black"
                                                                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                                                }`}
                                                        >
                                                            {set.completed ? "✓ Done" : "Mark Set"}
                                                        </button>

                                                        {/* DELETE INDIVIDUAL SET BUTTON */}
                                                        <button
                                                            onClick={() => deleteSetFromExercise(ex.id, set.setNumber)}
                                                            className="w-7 h-7 rounded-md bg-zinc-800/80 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-colors text-xs font-bold"
                                                            title={`Delete Set ${set.setNumber}`}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <form onSubmit={addExerciseToActiveWorkout} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add another exercise (e.g. Incline DB Press)..."
                                        value={newExerciseName}
                                        onChange={(e) => setNewExerciseName(e.target.value)}
                                        className="flex-1 bg-[#181a20] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87]"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all"
                                    >
                                        + Add
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Printable Official Header */}
                <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
                    <h2 className="text-2xl font-black tracking-tight text-black">
                        IRONCORE ATHLETE PERFORMANCE REPORT
                    </h2>
                    <p className="text-xs text-zinc-600">
                        Generated on {new Date().toLocaleDateString()} • Verified by IronCore & openGym Engine
                    </p>
                </div>

                {/* KPI Volume Stats */}
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
                            ~65 <span className="text-xs font-normal text-zinc-400">min</span>
                        </span>
                    </div>
                </div>

                {/* Past Sessions List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                        <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">
                            Past Training Sessions ({logs.length})
                        </h3>
                        <span className="text-[11px] text-[#00ff87] font-semibold">
                            💡 Tip: Click any card to inspect or resume session
                        </span>
                    </div>

                    <div className="space-y-3">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                onClick={() => setInspectedSession(log)}
                                className="bg-[#141518] hover:bg-[#181a20] print:bg-zinc-50 border border-zinc-800/80 hover:border-[#00ff87]/60 print:border-zinc-300 rounded-2xl p-5 shadow-lg space-y-4 group cursor-pointer transition-all duration-200 relative hover:shadow-[#00ff87]/5"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 print:border-zinc-200 pb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#00ff87]/10 text-[#00ff87] border border-[#00ff87]/30 group-hover:bg-[#00ff87] group-hover:text-black transition-colors">
                                            {log.split}
                                        </span>
                                        {log.status === "In-Progress" && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                Draft / Incomplete
                                            </span>
                                        )}
                                        <span className="text-xs font-mono text-zinc-400 print:text-zinc-600 font-bold">
                                            {log.date}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-mono">
                                        <span className="text-zinc-400 print:text-zinc-600">
                                            Duration: <strong className="text-white print:text-black">{log.durationMinutes}m</strong>
                                        </span>
                                        <span className="text-zinc-400 print:text-zinc-600">
                                            Volume: <strong className="text-[#00ff87] print:text-emerald-700">{log.totalVolumeKg} kg</strong>
                                        </span>

                                        <button
                                            onClick={(e) => deletePastLog(log.id, e)}
                                            className="print:hidden text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
                                            title="Delete this session"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {log.exercises.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between bg-[#1b1c20] group-hover:bg-[#1e2026] print:bg-white border border-zinc-800/80 print:border-zinc-200 rounded-xl p-3 text-xs transition-colors"
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

                                <div className="flex items-center justify-end text-[11px] font-semibold text-[#00ff87] pt-1">
                                    <span>View Details & Resume Sets →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Session Inspection Modal */}
            {inspectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-150">
                    <div className="bg-[#141518] border border-zinc-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <div>
                                <span className="text-[10px] font-mono text-[#00ff87] uppercase tracking-wider block font-bold">
                                    {inspectedSession.split} • {inspectedSession.date}
                                </span>
                                <h3 className="text-xl font-black text-white mt-0.5">Session Overview</h3>
                            </div>
                            <button
                                onClick={() => setInspectedSession(null)}
                                className="text-zinc-400 hover:text-white text-base px-2 py-1"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-[#1b1c20] p-3 rounded-xl border border-zinc-800/80">
                                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Duration</span>
                                <span className="text-lg font-black text-white font-mono">{inspectedSession.durationMinutes}m</span>
                            </div>
                            <div className="bg-[#1b1c20] p-3 rounded-xl border border-zinc-800/80">
                                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Volume Lifted</span>
                                <span className="text-lg font-black text-[#00ff87] font-mono">{inspectedSession.totalVolumeKg} kg</span>
                            </div>
                            <div className="bg-[#1b1c20] p-3 rounded-xl border border-zinc-800/80">
                                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Movements</span>
                                <span className="text-lg font-black text-zinc-200 font-mono">{inspectedSession.exercises.length}</span>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                                Exercise Set Breakdown
                            </span>

                            {inspectedSession.exercises.map((ex, i) => (
                                <div key={i} className="bg-[#181a20] border border-zinc-800/90 rounded-xl p-3.5 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-white flex items-center gap-1.5">
                                            <span className="text-[#00ff87]">🏋️</span> {ex.name}
                                        </span>
                                        <span className="font-mono text-zinc-400 text-[11px]">
                                            {ex.sets} sets • {ex.weightKg}kg
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                        {Array.from({ length: ex.sets }).map((_, sIdx) => {
                                            const isDone = sIdx < (ex.completedSetsCount ?? ex.sets);
                                            return (
                                                <span
                                                    key={sIdx}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isDone
                                                            ? "bg-[#00ff87]/20 text-[#00ff87] border border-[#00ff87]/30"
                                                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                                        }`}
                                                >
                                                    Set {sIdx + 1}: {isDone ? "✓ Done" : "Skipped"}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
                            <button
                                onClick={() => deletePastLog(inspectedSession.id)}
                                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors border border-red-500/30"
                            >
                                🗑️ Delete
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setInspectedSession(null)}
                                    className="px-4 py-2 rounded-xl bg-[#1b1c20] hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => resumePastSession(inspectedSession)}
                                    className="px-4 py-2 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] text-black text-xs font-extrabold transition-all shadow-lg shadow-[#00ff87]/20 flex items-center gap-1.5"
                                >
                                    <span>⚡</span> Resume Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Quick Log Modal */}
            {showQuickLogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden">
                    <div className="bg-[#141518] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <h3 className="text-base font-bold text-white">Log Past Session Manually</h3>
                            <button onClick={() => setShowQuickLogModal(false)} className="text-zinc-400 hover:text-white text-sm">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleManualQuickLog} className="space-y-3.5 text-xs">
                            <div>
                                <label className="text-zinc-400 font-semibold block mb-1">Workout Split</label>
                                <select
                                    value={manualSplit}
                                    onChange={(e) => setManualSplit(e.target.value)}
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
                                <label className="text-zinc-400 font-semibold block mb-1">Exercise Name</label>
                                <input
                                    type="text"
                                    required
                                    value={manualExercise}
                                    onChange={(e) => setManualExercise(e.target.value)}
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
                                        value={manualSets}
                                        onChange={(e) => setManualSets(parseInt(e.target.value) || 1)}
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
                                        value={manualReps}
                                        onChange={(e) => setManualReps(parseInt(e.target.value) || 1)}
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
                                        value={manualWeight}
                                        onChange={(e) => setManualWeight(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-[#1b1c20] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-zinc-400 font-semibold block mb-1">Duration (minutes)</label>
                                <input
                                    type="number"
                                    min="5"
                                    max="180"
                                    required
                                    value={manualDuration}
                                    onChange={(e) => setManualDuration(parseInt(e.target.value) || 60)}
                                    className="w-full bg-[#1b1c20] border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00ff87]"
                                />
                            </div>

                            <div className="pt-3 flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowQuickLogModal(false)}
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