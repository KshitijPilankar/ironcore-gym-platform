"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { EXDB, RawExercise } from "@/lib/exercises-data.js";

const PAGE_SIZE = 30;

// Body Part filter options mapping to openGym `bp` tags
const BODY_PART_OPTIONS = [
    { label: "All Anatomy", value: "All" },
    { label: "Chest", value: "chest" },
    { label: "Back & Lats", value: "back" },
    { label: "Shoulders", value: "shoulders" },
    { label: "Arms", value: "upper arms" },
    { label: "Forearms", value: "lower arms" },
    { label: "Abs & Core", value: "waist" },
    { label: "Upper Legs", value: "upper legs" },
    { label: "Calves & Shins", value: "lower legs" },
    { label: "Cardio", value: "cardio" },
    { label: "Full Body", value: "full body" },
];

// Equipment filter options mapping to openGym `eq` tags
const EQUIPMENT_OPTIONS = [
    { label: "All Equipment", value: "All" },
    { label: "Barbell", value: "barbell" },
    { label: "Dumbbell", value: "dumbbell" },
    { label: "Cable", value: "cable" },
    { label: "Bodyweight", value: "body weight" },
    { label: "Machine", value: "leverage machine" },
    { label: "Resistance Band", value: "band" },
    { label: "Kettlebell", value: "kettlebell" },
    { label: "Smith Machine", value: "smith machine" },
    { label: "EZ Barbell", value: "ez barbell" },
];

function titleCase(str: string): string {
    if (!str) return "";
    return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export default function ExerciseEnginePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBodyPart, setSelectedBodyPart] = useState("All");
    const [selectedEquipment, setSelectedEquipment] = useState("All");
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [activeModalExercise, setActiveModalExercise] = useState<RawExercise | null>(null);
    const [copiedName, setCopiedName] = useState(false);

    // Reset pagination window when filters change
    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [searchQuery, selectedBodyPart, selectedEquipment]);

    // Fast In-Memory Filter across all 5,632 openGym exercises
    const filteredExercises = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return EXDB.filter((ex) => {
            // Text Search across Name, Target, and Secondary Muscles
            if (query) {
                const matchesName = ex.n.toLowerCase().includes(query);
                const matchesTarget = ex.tg?.toLowerCase().includes(query);
                const matchesSecondary = ex.sm?.some((s) => s.toLowerCase().includes(query));
                if (!matchesName && !matchesTarget && !matchesSecondary) return false;
            }

            // Body Part Filter
            if (selectedBodyPart !== "All" && ex.bp !== selectedBodyPart) {
                return false;
            }

            // Equipment Filter
            if (selectedEquipment !== "All" && ex.eq !== selectedEquipment) {
                return false;
            }

            return true;
        });
    }, [searchQuery, selectedBodyPart, selectedEquipment]);

    // Slice current page batch for snappy rendering
    const displayedExercises = useMemo(() => {
        return filteredExercises.slice(0, visibleCount);
    }, [filteredExercises, visibleCount]);

    const handleLoadMore = () => {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredExercises.length));
    };

    const handleCopy = (name: string) => {
        navigator.clipboard.writeText(titleCase(name));
        setCopiedName(true);
        setTimeout(() => setCopiedName(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] pt-8 sm:pt-10 pb-28 px-4 sm:px-8 font-sans selection:bg-[#00ff87]/30">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header & Quick Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
                    <div>
                        <Link
                            href="/portal"
                            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 mb-2 font-medium"
                        >
                            <span>←</span> Back to Athlete Hub
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            5,600+ <span className="text-[#00ff87]">EXERCISE ENGINE</span>
                        </h1>
                        <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                            Complete openGym exercise catalog with high-precision anatomy tags, verified equipment classifications,
                            and live frame-by-frame illustration and animation streaming.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/portal/stats"
                            className="bg-[#141518] hover:bg-[#1b1c20] border border-zinc-800 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-300 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <span>🧬</span> View Muscle Heatmap
                        </Link>
                        <div className="bg-[#141518] border border-zinc-800 rounded-xl px-4 py-2 text-right shadow-sm">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                                In Library
                            </span>
                            <span className="text-base font-black text-[#00ff87] font-mono">
                                5,632 Movements
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Control Panel */}
                <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
                    {/* Search Bar */}
                    <div className="relative">
                        <span className="absolute left-3.5 top-3 text-zinc-500 text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder="Search 5,632 exercises by name or muscle (e.g. Bench, Romanian Deadlift, Lat Pulldown, Biceps)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1b1c20] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87] transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-white text-xs"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Filter Pill Rows */}
                    <div className="space-y-3 pt-1">
                        {/* Body Part Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] [scrollbar-color:#3f3f46_#141518]">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 flex-shrink-0 mr-1">
                                Muscle:
                            </span>
                            {BODY_PART_OPTIONS.map((bp) => (
                                <button
                                    key={bp.value}
                                    onClick={() => setSelectedBodyPart(bp.value)}
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap flex-shrink-0 ${
                                        selectedBodyPart === bp.value
                                            ? "bg-[#00ff87] text-black border-[#00ff87] font-bold shadow-sm shadow-[#00ff87]/20"
                                            : "bg-[#1b1c20] text-zinc-400 border-zinc-800 hover:text-white"
                                    }`}
                                >
                                    {bp.label}
                                </button>
                            ))}
                        </div>

                        {/* Equipment Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] [scrollbar-color:#3f3f46_#141518]">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 flex-shrink-0 mr-1">
                                Gear:
                            </span>
                            {EQUIPMENT_OPTIONS.map((eq) => (
                                <button
                                    key={eq.value}
                                    onClick={() => setSelectedEquipment(eq.value)}
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap flex-shrink-0 ${
                                        selectedEquipment === eq.value
                                            ? "bg-zinc-200 text-black border-zinc-200 font-bold"
                                            : "bg-[#1b1c20] text-zinc-400 border-zinc-800 hover:text-white"
                                    }`}
                                >
                                    {eq.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Count & Reset Indicator */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                        <span>
                            Showing <span className="text-[#00ff87] font-mono font-bold">{displayedExercises.length}</span> of{" "}
                            <span className="text-white font-mono font-bold">{filteredExercises.length.toLocaleString()}</span> filtered exercises
                        </span>
                        {(searchQuery || selectedBodyPart !== "All" || selectedEquipment !== "All") && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedBodyPart("All");
                                    setSelectedEquipment("All");
                                }}
                                className="text-zinc-500 hover:text-[#00ff87] transition-colors underline"
                            >
                                Reset all filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Exercises Grid */}
                {displayedExercises.length === 0 ? (
                    <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-12 text-center space-y-3">
                        <span className="text-3xl block">🔍</span>
                        <h3 className="text-base font-bold text-white">No exercises found</h3>
                        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                            No movements matched &quot;{searchQuery}&quot; with your selected equipment and body part filters.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedBodyPart("All");
                                setSelectedEquipment("All");
                            }}
                            className="bg-[#1b1c20] hover:bg-zinc-800 text-[#00ff87] border border-zinc-800 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedExercises.map((ex) => (
                            <div
                                key={ex.id}
                                onClick={() => setActiveModalExercise(ex)}
                                className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-[#00ff87]/50 hover:bg-[#18191d] transition-all cursor-pointer group shadow-lg"
                            >
                                <div className="space-y-3">
                                    {/* Top Meta Badges & Thumbnail */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1b1c20] text-zinc-400 border border-zinc-800">
                                                {ex.bp}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">
                                                {ex.eq}
                                            </span>
                                        </div>

                                        <span className="text-[10px] font-mono text-zinc-600 block">
                                            #{ex.id}
                                        </span>
                                    </div>

                                    {/* Exercise Still Illustration Thumbnail */}
                                    <div
                                        className="w-full h-36 rounded-xl border border-zinc-700/60 flex items-center justify-center p-2 overflow-hidden relative shadow-inner"
                                        style={{ background: "radial-gradient(circle at center, #272a31 0%, #121316 75%, #0a0a0c 100%)" }}
                                    >
                                        {ex.img ? (
                                            <img
                                                src={`/api/media/still/${ex.img}`}
                                                alt={ex.n}
                                                loading="lazy"
                                                className="w-full h-full object-contain will-change-transform transition-transform duration-300 group-hover:scale-105"
                                                style={{ filter: "brightness(1.28) contrast(1.18)" }}
                                            />
                                        ) : (
                                            <span className="text-zinc-600 text-xs">No preview</span>
                                        )}
                                        <span className="absolute bottom-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/60 text-zinc-300 backdrop-blur-sm border border-zinc-800">
                                            {ex.cat || "Movement"}
                                        </span>
                                    </div>

                                    {/* Name & Target Muscles */}
                                    <div>
                                        <h3 className="text-sm font-bold text-white group-hover:text-[#00ff87] transition-colors line-clamp-1">
                                            {titleCase(ex.n)}
                                        </h3>
                                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                                            <span className="text-[#00ff87] font-semibold">Target:</span> {titleCase(ex.tg)}
                                            {ex.sm && ex.sm.length > 0 && ` • ${ex.sm.slice(0, 2).map(titleCase).join(", ")}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Card Footer CTA */}
                                <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                                        Form & Video
                                    </span>
                                    <span className="text-[#00ff87] text-xs font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                        Inspect Cues →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination / Load More Controller */}
                {displayedExercises.length < filteredExercises.length && (
                    <div className="pt-6 flex flex-col items-center justify-center space-y-2">
                        <button
                            onClick={handleLoadMore}
                            className="bg-[#141518] hover:bg-[#1b1c20] text-[#00ff87] border border-zinc-800 hover:border-[#00ff87]/50 px-8 py-3 rounded-xl font-bold text-xs tracking-wider transition-all shadow-xl hover:shadow-[#00ff87]/10 flex items-center gap-2"
                        >
                            <span>Load More Movements</span>
                            <span className="font-mono text-zinc-400">
                                (+{Math.min(PAGE_SIZE, filteredExercises.length - displayedExercises.length)})
                            </span>
                        </button>
                        <span className="text-[10px] text-zinc-500 font-mono">
                            {filteredExercises.length - displayedExercises.length} additional exercises available in filter
                        </span>
                    </div>
                )}
            </div>

            {/* Exercise Details & Movement Video Modal */}
            {activeModalExercise && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
                    onClick={() => setActiveModalExercise(null)}
                >
                    <div
                        className="bg-[#141518] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#3f3f46_#141518]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-zinc-800 pb-3 gap-3">
                            <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1b1c20] text-zinc-400 border border-zinc-800">
                                        {activeModalExercise.bp}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#00ff87]/10 text-[#00ff87] border border-[#00ff87]/30">
                                        {activeModalExercise.eq}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-white">
                                    {titleCase(activeModalExercise.n)}
                                </h3>
                            </div>
                            <button
                                onClick={() => setActiveModalExercise(null)}
                                className="text-zinc-500 hover:text-white text-lg px-2 py-1 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Looping 3-Second Movement Video / Animation with Studio Ambient Backdrop */}
                        <div
                            className="w-full h-64 sm:h-72 rounded-2xl border border-zinc-700/60 overflow-hidden flex items-center justify-center relative shadow-inner"
                            style={{ background: "radial-gradient(circle at center, #272a31 0%, #121316 75%, #0a0a0c 100%)" }}
                        >
                            {activeModalExercise.gif ? (
                                <video
                                    src={`/api/media/clip/${activeModalExercise.gif}`}
                                    poster={activeModalExercise.img ? `/api/media/still/${activeModalExercise.img}` : undefined}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-contain scale-105 will-change-transform"
                                    style={{ filter: "brightness(1.28) contrast(1.18)" }}
                                />
                            ) : activeModalExercise.img ? (
                                <img
                                    src={`/api/media/still/${activeModalExercise.img}`}
                                    alt={activeModalExercise.n}
                                    className="w-full h-full object-contain scale-105 will-change-transform"
                                    style={{ filter: "brightness(1.28) contrast(1.18)" }}
                                />
                            ) : (
                                <span className="text-zinc-500 text-xs">No media available</span>
                            )}

                            <span className="absolute bottom-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/70 text-zinc-300 backdrop-blur-sm border border-zinc-800 flex items-center gap-1 z-10">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff87] animate-pulse" />
                                Looping Vector Execution
                            </span>
                        </div>

                        {/* Anatomical Stimulus Metrics */}
                        <div className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#1b1c20] p-3 rounded-xl border border-zinc-800 space-y-0.5">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                                        Primary Stimulus
                                    </span>
                                    <span className="font-bold text-[#00ff87] text-sm">
                                        {titleCase(activeModalExercise.tg)}
                                    </span>
                                </div>

                                <div className="bg-[#1b1c20] p-3 rounded-xl border border-zinc-800 space-y-0.5">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                                        Category
                                    </span>
                                    <span className="font-bold text-zinc-200 text-sm">
                                        {titleCase(activeModalExercise.cat || "Strength")}
                                    </span>
                                </div>
                            </div>

                            {activeModalExercise.sm && activeModalExercise.sm.length > 0 && (
                                <div className="bg-[#1b1c20] p-3.5 rounded-xl border border-zinc-800 space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                                        Synergists & Supporting Muscles
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                        {activeModalExercise.sm.map((muscle, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] font-medium"
                                            >
                                                {titleCase(muscle)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Technical Details */}
                            <div className="bg-[#18191d] p-3 rounded-xl border border-zinc-800/80 flex items-center justify-between text-[11px]">
                                <span className="text-zinc-500 font-mono">Catalog Permanent ID</span>
                                <span className="font-mono text-zinc-300">#{activeModalExercise.id}</span>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
                            <button
                                onClick={() => handleCopy(activeModalExercise.n)}
                                className="px-3.5 py-2 rounded-xl bg-[#1b1c20] hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-colors flex items-center gap-1.5"
                            >
                                <span>📋</span>
                                <span>{copiedName ? "Copied!" : "Copy Movement Name"}</span>
                            </button>

                            <button
                                onClick={() => setActiveModalExercise(null)}
                                className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
