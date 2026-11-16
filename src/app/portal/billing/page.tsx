"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, CheckCircle2, Receipt, Printer, X, Shield, Calendar, ArrowRight } from "lucide-react";
import RazorpayPaymentBtn from "@/components/RazorpayPaymentBtn";
import { currentGym } from "@/gymConfig";

interface PaymentTx {
    id: string;
    paymentId: string;
    orderId?: string;
    amount: number;
    planName: string;
    memberPhone?: string;
    memberName?: string;
    date: string;
    time: string;
    status: string;
}

export default function MemberBillingPage() {
    const [payments, setPayments] = useState<PaymentTx[]>([]);
    const [activeMember, setActiveMember] = useState<any>(null);
    const [selectedReceipt, setSelectedReceipt] = useState<PaymentTx | null>(null);

    useEffect(() => {
        let phone = "";
        let name = "Athlete";
        try {
            const stored = localStorage.getItem("ironcore_active_member");
            if (stored) {
                const parsed = JSON.parse(stored);
                setActiveMember(parsed);
                phone = parsed.phone || "";
                name = parsed.name || "Athlete";
            }
        } catch {
            // ignore
        }

        const cleanPhone = phone.replace(/[^0-9]/g, "");

        // 1. Read local storage payments
        let localPayments: PaymentTx[] = [];
        try {
            const saved = localStorage.getItem("ironcore_payments_db");
            if (saved) {
                localPayments = JSON.parse(saved);
            }
        } catch {
            // ignore
        }

        // 2. Fetch server transactions
        fetch("/api/payment/transactions")
            .then((r) => r.json())
            .then((data) => {
                const serverList: PaymentTx[] = data?.transactions || [];
                const map = new Map<string, PaymentTx>();
                [...localPayments, ...serverList].forEach((p) => {
                    if (p.paymentId) map.set(p.paymentId, p);
                });
                const merged = Array.from(map.values());

                // Filter by member if phone is known, or show latest
                const memberPayments = merged.filter((p) => {
                    if (!cleanPhone) return true;
                    if (!p.memberPhone) return true;
                    const pClean = p.memberPhone.replace(/[^0-9]/g, "");
                    return pClean.includes(cleanPhone) || cleanPhone.includes(pClean.slice(-10));
                });

                setPayments(memberPayments.length > 0 ? memberPayments : merged.slice(0, 5));
            })
            .catch(() => {
                setPayments(localPayments);
            });
    }, []);

    const totalPaid = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#00ff87] uppercase font-mono">
                        BILLING & INVOICE VAULT
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                        Membership Billing
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        View official payment vouchers, tax invoices, and renewal receipts.
                    </p>
                </div>

                <Link
                    href="/portal"
                    className="self-start sm:self-auto text-xs font-semibold text-zinc-400 hover:text-white bg-[#181a20] border border-zinc-800 px-3.5 py-2 rounded-xl transition-all"
                >
                    ← Back to Hub
                </Link>
            </div>

            {/* Top Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-5 space-y-1">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Active Membership
                    </span>
                    <div className="text-lg font-black text-white">
                        {activeMember?.plan || "Smart Athlete Pass"}
                    </div>
                    <span className="text-xs text-zinc-500 font-mono block">
                        Due: {activeMember?.dueDate || "2026-11-20"}
                    </span>
                </div>

                <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-5 space-y-1">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Total Life Collections
                    </span>
                    <div className="text-2xl font-black text-[#00ff87] font-mono">
                        ₹{totalPaid.toLocaleString("en-IN")}
                    </div>
                    <span className="text-xs text-zinc-500 font-mono block">
                        {payments.length} successful payment{payments.length === 1 ? "" : "s"}
                    </span>
                </div>

                <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                            Quick Pass Extension
                        </span>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                            Extend pass validity by 30 days instantly.
                        </p>
                    </div>

                    <div className="mt-2">
                        <RazorpayPaymentBtn
                            amount={activeMember?.plan?.includes("Smart") ? 1999 : 1499}
                            planName={activeMember?.plan || "Smart Athlete Pass"}
                            memberName={activeMember?.name || "Kshitij Pilankar"}
                            memberPhone={activeMember?.phone || "919004884885"}
                            buttonText="⚡ Renew Pass"
                            className="w-full py-2 px-3 rounded-lg bg-[#00ff87] hover:bg-[#00e57a] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00ff87]/20 text-center cursor-pointer active:scale-95"
                            onSuccess={() => {
                                alert("✓ Payment captured! Refreshing invoice list...");
                                window.location.reload();
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Payment Transactions Table */}
            <div className="bg-[#141518] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                        <Receipt className="w-4 h-4 text-[#00ff87]" /> Official Receipt Register
                    </h3>
                    <span className="text-xs font-mono text-zinc-500">
                        {payments.length} Transaction Records
                    </span>
                </div>

                {payments.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 text-xs">
                        No transactions recorded yet. When you pay for a pass online or at desk, your receipt will appear here.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="text-zinc-500 border-b border-zinc-800/80 pb-2 font-mono">
                                    <th className="py-3 font-semibold">Payment ID</th>
                                    <th className="py-3 font-semibold">Plan Description</th>
                                    <th className="py-3 font-semibold">Date & Time</th>
                                    <th className="py-3 font-semibold">Amount</th>
                                    <th className="py-3 font-semibold">Status</th>
                                    <th className="py-3 font-semibold text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {payments.map((p) => (
                                    <tr key={p.id} className="hover:bg-[#181a20]/60 transition-colors">
                                        <td className="py-3.5 font-mono text-[#00ff87] font-semibold text-[11px]">
                                            {p.paymentId}
                                        </td>
                                        <td className="py-3.5 text-zinc-200 font-medium">
                                            {p.planName}
                                        </td>
                                        <td className="py-3.5 font-mono text-zinc-400 text-[11px]">
                                            {p.date} • {p.time}
                                        </td>
                                        <td className="py-3.5 font-mono font-bold text-white text-sm">
                                            ₹{p.amount.toLocaleString("en-IN")}
                                        </td>
                                        <td className="py-3.5">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-[#00ff87] border border-emerald-500/20 font-mono">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff87]" />
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-right">
                                            <button
                                                onClick={() => setSelectedReceipt(p)}
                                                className="bg-[#181a20] hover:bg-[#00ff87] hover:text-black text-zinc-300 font-semibold text-xs px-3 py-1.5 rounded-lg border border-zinc-800 transition-all cursor-pointer"
                                            >
                                                View Receipt →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Official Print/View Receipt Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div
                        className="bg-[#121316] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                            <div>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00ff87] font-bold bg-[#00ff87]/10 border border-[#00ff87]/20 px-2.5 py-0.5 rounded-full inline-block">
                                    TAX INVOICE / VOUCHER
                                </span>
                                <h2 className="text-2xl font-black tracking-tight text-white mt-1.5">
                                    {currentGym.name}
                                </h2>
                                <p className="text-xs text-zinc-400">
                                    {currentGym.tagline} • Contact: {currentGym.phone}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedReceipt(null)}
                                className="text-zinc-500 hover:text-white text-lg p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Invoice Breakdown */}
                        <div className="bg-[#181a20] border border-zinc-800 rounded-2xl p-5 space-y-3.5 text-xs">
                            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                                <span className="text-zinc-400 font-medium">Receipt No / ID</span>
                                <span className="font-mono text-zinc-200 font-bold">{selectedReceipt.paymentId}</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                                <span className="text-zinc-400 font-medium">Billed To (Athlete)</span>
                                <span className="text-white font-bold">{selectedReceipt.memberName || activeMember?.name || "Athlete Member"}</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                                <span className="text-zinc-400 font-medium">Athlete WhatsApp</span>
                                <span className="font-mono text-zinc-300">+{selectedReceipt.memberPhone || activeMember?.phone || "919004884885"}</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                                <span className="text-zinc-400 font-medium">Plan Item</span>
                                <span className="text-white font-bold">{selectedReceipt.planName}</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                                <span className="text-zinc-400 font-medium">Date & Time</span>
                                <span className="font-mono text-zinc-300">{selectedReceipt.date} • {selectedReceipt.time}</span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <span className="text-zinc-200 font-bold text-sm">Total Paid</span>
                                <span className="text-[#00ff87] font-mono text-xl font-black">
                                    ₹{selectedReceipt.amount.toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>

                        <div className="text-[11px] text-zinc-500 space-y-1">
                            <p>✓ Verified through Razorpay / Desk Register Gateway.</p>
                            <p>This is a computer-generated voucher and does not require physical signature.</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={handlePrint}
                                className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Print / Save PDF</span>
                            </button>

                            <button
                                onClick={() => setSelectedReceipt(null)}
                                className="flex-1 py-3 px-4 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
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
