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

// ---------------------------------------------------------------------------
// Clean URL Encoder for Linux/Vercel Special Characters & Parentheses
// ---------------------------------------------------------------------------
function encodeSafeUrl(url: string | null | undefined): string {
    if (!url) return "";
    return encodeURI(url).replace(/\(/g, "%28").replace(/\)/g, "%29");
}

function getPrimaryThumbnailSrc(ex: RawExercise): string {
    const rawPath =
        (ex as any).imageUrl ||
        (ex as any).thumbnailUrl ||
        (ex.img ? `https://cdn.jsdelivr.net/gh/DuarteSantos8/openGym@main/catalogue/media/still/${ex.img}` : "");
    return encodeSafeUrl(rawPath);
}

function getModalAnimationSrc(ex: RawExercise): string {
    const rawPath =
        (ex as any).gifUrl ||
        (ex as any).videoUrl ||
        (ex as any).animationUrl ||
        (ex.gif ? `https://cdn.jsdelivr.net/gh/DuarteSantos8/openGym@main/catalogue/media/clip/${ex.gif}` : "");
    return encodeSafeUrl(rawPath);
}

// ---------------------------------------------------------------------------
// High-Tech Animated SVG Anatomy Thumbnail with Progressive Fallback
// ---------------------------------------------------------------------------
function ExerciseThumbnail({ ex }: { ex: RawExercise }) {
    const primarySrc = useMemo(() => getPrimaryThumbnailSrc(ex), [ex]);
    const animationSrc = useMemo(() => getModalAnimationSrc(ex), [ex]);

    // Stage 0: Attempting primary thumbnail
    // Stage 1: Primary failed, attempting modal animation fallback
    // Stage 2: Both failed -> gracefully render stylized dark-gradient anatomy container
    const [fallbackStage, setFallbackStage] = useState<0 | 1 | 2>(() => {
        if (!primarySrc && !animationSrc) return 2;
        if (!primarySrc) return 1;
        return 0;
    });

    const [currentSrc, setCurrentSrc] = useState<string>(() => {
        if (primarySrc) return primarySrc;
        if (animationSrc) return animationSrc;
        return "";
    });

    // Reset cleanly when exercise prop changes
    useEffect(() => {
        const prim = getPrimaryThumbnailSrc(ex);
        const anim = getModalAnimationSrc(ex);
        if (prim) {
            setFallbackStage(0);
            setCurrentSrc(prim);
        } else if (anim) {
            setFallbackStage(1);
            setCurrentSrc(anim);
        } else {
            setFallbackStage(2);
            setCurrentSrc("");
        }
    }, [ex.id, ex.img, ex.gif]);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        if (fallbackStage === 0 && animationSrc && animationSrc !== currentSrc) {
            // First fallback: Immediately set target src to the exercise's working modal animation URL
            setFallbackStage(1);
            setCurrentSrc(animationSrc);
            const target = e.currentTarget as HTMLImageElement;
            target.src = animationSrc;
        } else {
            // Second fallback: Gracefully hide broken img and switch to stylized dark anatomy container
            setFallbackStage(2);
        }
    };

    if (fallbackStage === 2 || !currentSrc) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 relative overflow-hidden bg-gradient-to-b from-[#161820] via-[#121318] to-[#0d0e12]">
                {/* Tech Radar Grid */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00ff87_1px,transparent_1px)] [background-size:12px_12px]" />

                {/* Looping Pulse Radar Ring & Vector Anatomy */}
                <div className="relative flex items-center justify-center mb-1.5 z-10">
                    <div className="absolute w-14 h-14 rounded-full border border-[#00ff87]/30 animate-ping pointer-events-none" />
                    <div className="w-12 h-12 rounded-full border border-[#00ff87]/50 bg-[#00ff87]/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,135,0.25)]">
                        <svg
                            className="w-6 h-6 text-[#00ff87]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="5" r="2.5" />
                            <path d="M9 22v-6.5l-2-3 2.5-4.5h5L17 12.5l-2 3V22" />
                            <circle cx="12" cy="11" r="1.5" fill="#00ff87" />
                        </svg>
                    </div>
                </div>

                <span className="text-[10px] font-bold tracking-wider text-[#00ff87] uppercase z-10 font-mono truncate max-w-[90%] text-center">
                    {ex.tg || ex.bp}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono tracking-tight z-10 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff87] animate-pulse" />
                    ANATOMICAL CUES
                </span>
            </div>
        );
    }

    return (
        <img
            src={currentSrc}
            alt={ex.n}
            loading="lazy"
            onError={handleImageError}
            className="w-full h-full object-contain scale-110 will-change-transform transition-transform duration-300 group-hover:scale-115"
        />
    );
}

// ---------------------------------------------------------------------------
// Detail Modal Media & Interactive Tactical Cues with Rest Timer
// ---------------------------------------------------------------------------
function ExerciseModalPreview({ ex }: { ex: RawExercise }) {
    const [videoError, setVideoError] = useState(false);
    const [viewMode, setViewMode] = useState<"video" | "cues">("video");
    const [restTimer, setRestTimer] = useState<number | null>(null);
    const [activeTimerPreset, setActiveTimerPreset] = useState<number>(60);
    const [timerRunning, setTimerRunning] = useState(false);

    // Reset media error when active exercise switches
    useEffect(() => {
        setVideoError(false);
        setViewMode("video");
        setTimerRunning(false);
        setRestTimer(null);
    }, [ex.id]);

    // Rest Timer Countdown logic
    useEffect(() => {
        let interval: any = null;
        if (timerRunning && restTimer !== null && restTimer > 0) {
            interval = setInterval(() => {
                setRestTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
            }, 1000);
        } else if (restTimer === 0) {
            setTimerRunning(false);
        }
        return () => clearInterval(interval);
    }, [timerRunning, restTimer]);

    const startTimer = (seconds: number) => {
        setActiveTimerPreset(seconds);
        setRestTimer(seconds);
        setTimerRunning(true);
    };

    const resetTimer = () => {
        setTimerRunning(false);
        setRestTimer(null);
    };

    const clipSrc = getModalAnimationSrc(ex) || null;
    const stillSrc = getPrimaryThumbnailSrc(ex) || null;

    // Tactical cues tailored to target anatomy
    const getCues = () => {
        const bp = (ex.bp || "").toLowerCase();
        const tg = (ex.tg || "").toLowerCase();

        if (bp.includes("chest") || tg.includes("pectoralis")) {
            return [
                "Scapular Retraction: Pin shoulder blades down and back before initiation.",
                "Eccentric Control: Lower under tension for 3 seconds to maximize mechanical stretch.",
                "Concentric Drive: Squeeze through inner chest fibers without locking elbows out rigidly."
            ];
        }
        if (bp.includes("back") || tg.includes("latissimus") || tg.includes("trapezius")) {
            return [
                "Elbow Path: Lead movement with elbows driven backward rather than wrist flexion.",
                "Neutral Spine: Brace anterior core firmly; avoid jerky lumbar hyperextension.",
                "Peak Squeeze: Hold 1-second isometric pause at contraction to trigger lat recruitment."
            ];
        }
        if (bp.includes("legs") || bp.includes("upper legs") || tg.includes("quadriceps") || tg.includes("glutes")) {
            return [
                "Joint Alignment: Track knees symmetrically in direction of second toe throughout.",
                "Full Kinetic Depth: Descend until hip crease breaks parallel while maintaining flat foot pressure.",
                "Explosive Drive: Push through midfoot and heel, aggressively locking hips at peak."
            ];
        }
        if (bp.includes("shoulders") || tg.includes("delts")) {
            return [
                "Trap Neutrality: Avoid shrugging upper trapezius; isolate lateral and anterior heads.",
                "Smooth Arc: Maintain slight elbow bend and smooth cadence along scapular plane.",
                "Controlled Deceleration: Resist the negative descent to guard shoulder impingement."
            ];
        }
        if (bp.includes("arms") || tg.includes("biceps") || tg.includes("triceps")) {
            return [
                "Fixed Pivot Point: Anchor elbows against torso to prevent momentum transfer.",
                "Supination / Extension: Emphasize terminal lockout for complete peak tension.",
                "Tension Maintenance: Never let weight slam at bottom; sustain loaded muscle tension."
            ];
        }
        return [
            "Braced Kinetic Chain: Keep abdominal wall pressurized and neutral head alignment.",
            "Execution Tempo: 3s controlled lowering, 1s transition pause, explosive effort.",
            "Rhythmic Breathing: Inhale during eccentric stretch; exhale on peak contraction drive."
        ];
    };

    const tacticalCues = getCues();
    const showInteractiveCues = videoError || !clipSrc || viewMode === "cues";

    return (
        <div className="space-y-4">
            {/* View Mode Toggle Pill (Video vs Tactical Cues) */}
            {clipSrc && !videoError && (
                <div className="flex items-center justify-between bg-[#101216] border border-zinc-800 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode("video")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${viewMode === "video"
                                ? "bg-[#1b1e26] text-[#00ff87] border border-[#00ff87]/30 shadow"
                                : "text-zinc-400 hover:text-white"
                            }`}
                    >
                        <span>🎥</span>
                        <span>Video Execution</span>
                    </button>
                    <button
                        onClick={() => setViewMode("cues")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${viewMode === "cues"
                                ? "bg-[#1b1e26] text-[#00ff87] border border-[#00ff87]/30 shadow"
                                : "text-zinc-400 hover:text-white"
                            }`}
                    >
                        <span>⚡</span>
                        <span>Tactical Cues & Timer</span>
                    </button>
                </div>
            )}

            {/* Media Box: Looping Execution or Stylized Tactical Preview */}
            <div className="relative w-full aspect-square max-h-[350px] bg-[#0c0d10] rounded-2xl border border-zinc-800/90 flex items-center justify-center p-3 overflow-hidden shadow-2xl">
                {!showInteractiveCues ? (
                    <>
                        <video
                            src={clipSrc || ""}
                            poster={stillSrc || undefined}
                            autoPlay
                            loop
                            muted
                            playsInline
                            onError={() => setVideoError(true)}
                            className="w-full h-full object-contain pointer-events-none"
                            style={{
                                imageRendering: "crisp-edges",
                                filter: "contrast(1.15) saturate(1.15) brightness(1.02)",
                                WebkitBackfaceVisibility: "hidden",
                                transform: "translateZ(0)",
                            }}
                        />
                        <span className="absolute bottom-3 left-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/80 text-zinc-300 backdrop-blur-sm border border-zinc-800 flex items-center gap-1 z-10 pointer-events-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff87] animate-pulse" />
                            Looping Execution Animation
                        </span>
                    </>
                ) : (
                    /* High-Tech Stylized Interactive Workout Preview */
                    <div className="w-full h-full flex flex-col justify-between p-4 relative z-10 bg-gradient-to-br from-[#12141a] via-[#0d0f13] to-[#090a0d] rounded-xl border border-zinc-800/80">
                        {/* Background Radar Rings */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                            <div className="w-48 h-48 rounded-full border border-[#00ff87] animate-ping" />
                            <div className="absolute w-36 h-36 rounded-full border border-[#00ff87]/40" />
                            <div className="absolute w-20 h-20 rounded-full border border-[#00ff87]/60" />
                        </div>

                        {/* Top Stimulus Header */}
                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 z-10">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#00ff87] shadow-[0_0_8px_#00ff87]" />
                                <span className="text-[11px] font-mono font-bold tracking-wider text-white uppercase">
                                    Primary Stimulus Target: <span className="text-[#00ff87]">{ex.tg || ex.bp}</span>
                                </span>
                            </div>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#1b1c22] text-zinc-400 border border-zinc-800 uppercase">
                                {ex.bp}
                            </span>
                        </div>

                        {/* Tactical Movement Cues */}
                        <div className="space-y-2 py-2 z-10">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00ff87] flex items-center gap-1">
                                <span>🎯</span> Biomechanical Cues
                            </span>
                            <div className="space-y-1.5">
                                {tacticalCues.map((cue, idx) => (
                                    <div
                                        key={idx}
                                        className="text-[11px] leading-relaxed text-zinc-300 bg-[#15171e]/80 border border-zinc-800/60 rounded-lg px-2.5 py-1.5 flex items-start gap-2"
                                    >
                                        <span className="text-[#00ff87] font-bold font-mono">0{idx + 1}</span>
                                        <span>{cue}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Set Rest Timer Controller */}
                        <div className="pt-2 border-t border-zinc-800/80 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono text-zinc-400 uppercase">Rest Interval:</span>
                                {[30, 60, 90].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => startTimer(s)}
                                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${activeTimerPreset === s && timerRunning
                                                ? "bg-[#00ff87] text-black shadow-[0_0_8px_rgba(0,255,135,0.4)]"
                                                : "bg-[#1b1c22] hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                                            }`}
                                    >
                                        {s}s
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                {restTimer !== null ? (
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-mono font-black ${restTimer === 0 ? "text-amber-400 animate-pulse" : "text-[#00ff87]"}`}>
                                            {restTimer === 0 ? "🔔 SET READY!" : `⏱️ ${restTimer}s remaining`}
                                        </span>
                                        <button
                                            onClick={resetTimer}
                                            className="text-[10px] text-zinc-500 hover:text-white underline cursor-pointer"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => startTimer(60)}
                                        className="text-[10px] font-bold px-2.5 py-1 rounded bg-[#1b1d24] hover:bg-[#232630] text-[#00ff87] border border-[#00ff87]/30 transition-all cursor-pointer"
                                    >
                                        ⚡ Start 60s Rest Timer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Exercise Engine Page
// ---------------------------------------------------------------------------
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
        <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f5] p-6 lg:p-10 font-sans selection:bg-[#00ff87]/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Top Breadcrumb Navigation */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Link href="/portal" className="hover:text-white transition-colors">
                            ← Athlete Portal
                        </Link>
                        <span>/</span>
                        <span className="text-[#00ff87] font-semibold">Exercise Engine</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
                        <span className="text-xs font-mono text-zinc-400">
                            {filteredExercises.length.toLocaleString()} Active Movements
                        </span>
                    </div>
                </div>

                {/* Hero Header */}
                <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#00ff87] uppercase">
                        IronCore Biomechanics Library
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight mt-1">
                        5,600+ Exercise Engine & Form Cues
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                        Filter by anatomical muscle target, barbell, dumbbell, cable, machine, and calisthenics.
                        Tap any movement card to inspect looped animation cues and set timers.
                    </p>
                </div>

                {/* Controls Bar: Search + Filter Chips */}
                <div className="bg-[#141518] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by exercise name, target muscle (e.g. lats, quads, bench press)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1b1c20] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff87] transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                            >
                                ✕ Clear
                            </button>
                        )}
                    </div>

                    {/* Filter Row 1: Body Part Anatomy Chips */}
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            Anatomical Muscle Focus
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {BODY_PART_OPTIONS.map((opt) => {
                                const active = selectedBodyPart === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSelectedBodyPart(opt.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${active
                                                ? "bg-[#00ff87] text-black shadow-md shadow-[#00ff87]/20"
                                                : "bg-[#1b1c20] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Filter Row 2: Equipment Modality Chips */}
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            Equipment Modality
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {EQUIPMENT_OPTIONS.map((opt) => {
                                const active = selectedEquipment === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSelectedEquipment(opt.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${active
                                                ? "bg-[#00ff87] text-black shadow-md shadow-[#00ff87]/20"
                                                : "bg-[#1b1c20] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Exercises Responsive Grid */}
                {displayedExercises.length === 0 ? (
                    <div className="bg-[#141518] border border-zinc-800 rounded-2xl p-12 text-center space-y-3">
                        <span className="text-3xl">🔍</span>
                        <h3 className="text-base font-bold text-white">No Exercises Match Current Filters</h3>
                        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                            Try resetting your search query or selecting &quot;All Anatomy&quot; and &quot;All Equipment&quot;.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedBodyPart("All");
                                setSelectedEquipment("All");
                            }}
                            className="bg-[#1b1c20] hover:bg-zinc-800 text-[#00ff87] text-xs font-semibold px-4 py-2 rounded-xl border border-zinc-800 transition-colors"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

                                    {/* Exercise Still Illustration Thumbnail with Fallback */}
                                    <div className="w-full h-36 bg-[#121316] rounded-xl border border-zinc-800/80 flex items-center justify-center p-2 overflow-hidden relative shadow-inner">
                                        <ExerciseThumbnail ex={ex} />
                                        <span className="absolute bottom-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/70 text-zinc-300 backdrop-blur-sm border border-zinc-800">
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
                                className="text-zinc-500 hover:text-white text-lg px-2 py-1 transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Looping 3-Second Movement Video / Animation with Interactive Fallback */}
                        <ExerciseModalPreview ex={activeModalExercise} />

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
                                className="px-3.5 py-2 rounded-xl bg-[#1b1c20] hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>📋</span>
                                <span>{copiedName ? "Copied!" : "Copy Movement Name"}</span>
                            </button>

                            <button
                                onClick={() => setActiveModalExercise(null)}
                                className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors cursor-pointer"
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
