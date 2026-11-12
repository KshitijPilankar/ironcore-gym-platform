"use client";

import React, { useState } from "react";
import { Dumbbell, Flame, Trophy, Smartphone, ArrowRight, CheckCircle2, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { currentGym } from "../gymConfig";
import RazorpayPaymentBtn from "../components/RazorpayPaymentBtn";

export default function GymHomePage() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [claimed, setClaimed] = useState(false);

  const handleFreePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setClaimed(true);
  };

  const openWhatsAppConfirmation = () => {
    const passId = `IC-${Math.floor(1000 + Math.random() * 9000)}`;
    const msg = `Hi ${currentGym.shortName}! I have generated my 1-Day VIP Pass.\n\n👤 Name: ${name}\n📱 Phone: ${phone}\n🎟️ Pass ID: ${passId}\n\nPlease confirm my slot!`;
    window.open(`https://wa.me/${currentGym.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500 selection:text-black flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg text-black font-black">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="font-extrabold tracking-tight text-xl uppercase">
              {currentGym.name}
            </span>
          </div>

          {/* Secure Login Gateways */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3.5 py-1.5 rounded-full hover:border-emerald-500/40"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" /> Member App
            </Link>
            <Link
              href="/admin/login"
              className="text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 rounded-full transition shadow-md shadow-emerald-500/20"
            >
              Owner Portal
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative px-6 pt-20 pb-16 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-6">
            <Flame className="w-4 h-4" /> {currentGym.tagline}
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight uppercase">
            Build Real Muscle. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Powered by Digital Tracking.
            </span>
          </h1>

          <p className="mt-6 text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Stop guessing in the gym. Every {currentGym.shortName} member gets access to 5,600+ animated exercise guides, automated volume tracking, and monthly streak competitions.
          </p>

          {/* Lead Capture Form */}
          <form onSubmit={handleFreePass} className="mt-10 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm focus:outline-none focus:border-emerald-500 text-white"
            />
            <input
              type="tel"
              placeholder="WhatsApp Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-sm focus:outline-none focus:border-emerald-500 text-white"
            />
            <button
              type="submit"
              className="whitespace-nowrap px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              Claim Pass <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <p className="text-xs text-neutral-500 mt-3 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Free 1-Day Trial. Instant activation.
          </p>
        </section>

        {/* Claimed Digital Pass Modal */}
        {claimed && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-emerald-500/50 rounded-2xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl text-center">
              <button
                onClick={() => setClaimed(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">VIP Pass Generated!</h3>
              <p className="text-neutral-400 text-xs mt-1">Show this digital pass at the {currentGym.shortName} reception.</p>

              <div className="my-6 p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-left">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2 mb-2">
                  <span className="text-xs text-neutral-400">Pass Holder</span>
                  <span className="text-xs font-bold text-emerald-400">{name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2 mb-2">
                  <span className="text-xs text-neutral-400">Registered Phone</span>
                  <span className="text-xs font-mono">{phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-400">Validity</span>
                  <span className="text-xs font-bold text-amber-400">24 Hours Active</span>
                </div>
              </div>

              <button
                onClick={openWhatsAppConfirmation}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" /> Send Pass to WhatsApp
              </button>
            </div>
          </div>
        )}

        {/* App Integration Showcase */}
        <section className="px-6 py-16 border-t border-neutral-900 bg-neutral-950/50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/portal/exercises"
              className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/40 transition block group"
            >
              <Smartphone className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">5,600+ Exercise Engine</h3>
              <p className="text-neutral-400 text-xs sm:text-sm mt-2">
                Cannot afford a Personal Trainer? Our official member app guides your form, sets, reps, and plate math live during your workout.
              </p>
            </Link>

            <Link
              href="/portal"
              className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/40 transition block group"
            >
              <Flame className="w-8 h-8 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">Snapchat-Style Streaks</h3>
              <p className="text-neutral-400 text-xs sm:text-sm mt-2">
                Log your daily check-in. Maintain your 30-day workout streak on the gym leaderboard and win free supplements every month.
              </p>
            </Link>

            <Link
              href="/portal/stats"
              className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/40 transition block group"
            >
              <Trophy className="w-8 h-8 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">Muscle Balance Map</h3>
              <p className="text-neutral-400 text-xs sm:text-sm mt-2">
                Watch your personal 3D muscle heatmap light up as you complete sets. Target weak muscles before injury strikes.
              </p>
            </Link>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-10 tracking-tight uppercase">Membership Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Basic */}
            <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Standard Gym</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-black">₹{currentGym.pricing.standard}</span>
                  <span className="text-neutral-500 text-sm">/month</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-neutral-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full Gym Equipment Access</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Locker & Shower Facility</li>
                  <li className="flex items-center gap-2 text-neutral-600"><CheckCircle2 className="w-4 h-4" /> Digital App & Streak Leaderboard</li>
                </ul>
              </div>

              {/* Razorpay Integrated Button - Standard Plan */}
              <RazorpayPaymentBtn
                amount={1499}
                planName="Standard Gym Plan"
                buttonText="Get Started (Pay Now)"
                memberPhone={phone}
                className="mt-8 w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-bold transition text-center text-white disabled:opacity-50"
              />
            </div>

            {/* Smart Pass */}
            <div className="p-8 rounded-2xl bg-neutral-900 border-2 border-emerald-500 relative flex flex-col justify-between shadow-lg shadow-emerald-950/50">
              <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black uppercase tracking-wider">
                Most Popular
              </span>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Smart Athlete Pass</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-black">₹{currentGym.pricing.smartPass}</span>
                  <span className="text-neutral-500 text-sm">/month</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-neutral-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Everything in Standard Gym</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Official openGym App Sync</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 5,600+ Guided Exercise Library</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Streak Rewards & Monthly Supplements</li>
                </ul>
              </div>

              {/* Razorpay Integrated Button - Smart Athlete Pass */}
              <RazorpayPaymentBtn
                amount={1999}
                planName="Smart Athlete Pass"
                buttonText="Join Smart Pass (Pay Now)"
                memberPhone={phone}
                className="mt-8 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Compliance Footer for Razorpay Verification */}
      <footer className="border-t border-neutral-900 bg-neutral-950 px-6 py-10 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© 2026 {currentGym.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/contact" className="hover:text-emerald-400 transition">Contact Us</Link>
            <Link href="/terms" className="hover:text-emerald-400 transition">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition">Privacy Policy</Link>
            <Link href="/refund" className="hover:text-emerald-400 transition">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}