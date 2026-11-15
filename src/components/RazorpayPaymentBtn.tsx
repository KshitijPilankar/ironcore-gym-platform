'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PaymentProps {
    amount: number;
    planName: string;
    memberId?: string;
    memberPhone?: string;
    className?: string;
    buttonText?: string;
    onSuccess?: () => void;
}

interface PaymentReceipt {
    paymentId: string;
    orderId?: string;
    planName: string;
    amount: number;
    date: string;
    time: string;
}

export default function RazorpayPaymentBtn({
    amount,
    planName,
    memberId = 'member_direct',
    memberPhone = '',
    className = '',
    buttonText,
    onSuccess,
}: PaymentProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
    const [countdown, setCountdown] = useState<number>(3);
    const [copied, setCopied] = useState(false);

    // Auto-redirect countdown to /login once receipt modal is active
    useEffect(() => {
        if (!receipt) return;

        if (countdown <= 0) {
            router.push('/login');
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [receipt, countdown, router]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);

        const res = await loadRazorpayScript();
        if (!res) {
            alert('Razorpay SDK failed to load. Please check your internet connection.');
            setLoading(false);
            return;
        }

        try {
            const orderRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, memberId, planName }),
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'IronCore Fitness',
                description: `Subscription: ${planName}`,
                order_id: orderData.orderId,
                prefill: {
                    contact: memberPhone || '',
                },
                theme: {
                    color: '#00ff87',
                },
                handler: function (response: any) {
                    const now = new Date();
                    const paymentRecord: PaymentReceipt = {
                        paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                        orderId: response.razorpay_order_id || orderData.orderId,
                        planName,
                        amount: Number(amount),
                        date: now.toISOString().split('T')[0],
                        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    };

                    // 1. Save payment into localStorage payments database
                    try {
                        const existingPayments = JSON.parse(
                            localStorage.getItem('ironcore_payments_db') || '[]'
                        );
                        localStorage.setItem(
                            'ironcore_payments_db',
                            JSON.stringify([
                                {
                                    ...paymentRecord,
                                    memberPhone: memberPhone || '',
                                    status: 'Captured',
                                },
                                ...existingPayments,
                            ])
                        );

                        // 2. If matching member exists in CRM, update their status to Paid
                        const storedMembers = localStorage.getItem('ironcore_members_db');
                        if (storedMembers) {
                            const membersList = JSON.parse(storedMembers);
                            if (Array.isArray(membersList)) {
                                const cleanPhone = memberPhone.replace(/[^0-9]/g, '');
                                const updatedMembers = membersList.map((m: any) => {
                                    if (
                                        cleanPhone &&
                                        (m.phone.includes(cleanPhone) || cleanPhone.includes(m.phone.slice(-10)))
                                    ) {
                                        return {
                                            ...m,
                                            status: 'Paid',
                                            plan: planName,
                                        };
                                    }
                                    return m;
                                });
                                localStorage.setItem(
                                    'ironcore_members_db',
                                    JSON.stringify(updatedMembers)
                                );
                            }
                        }
                    } catch (storageErr) {
                        console.warn('Error saving payment record to localStorage', storageErr);
                    }

                    // 3. Post to backend record endpoint for server-side persistence
                    fetch('/api/payment/record', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...paymentRecord,
                            memberPhone: memberPhone || '',
                            status: 'Captured',
                        }),
                    }).catch(() => {});

                    // 4. Trigger UI Receipt modal and trigger callback
                    setReceipt(paymentRecord);
                    setCountdown(3);
                    if (onSuccess) onSuccess();
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    },
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
        } catch (err: any) {
            alert('Payment Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyId = () => {
        if (!receipt?.paymentId) return;
        navigator.clipboard.writeText(receipt.paymentId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGoToMemberApp = () => {
        router.push('/login');
    };

    return (
        <>
            <button
                onClick={handlePayment}
                disabled={loading}
                className={className}
            >
                {loading ? 'Processing...' : (buttonText || `Pay ₹${amount}`)}
            </button>

            {/* Sleek Dark-Mode Payment Receipt Modal */}
            {receipt && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div
                        className="bg-[#121316] border border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Glow accent in background */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#00ff87]/10 blur-3xl pointer-events-none" />

                        {/* Success Icon & Header */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00ff87]/15 border-2 border-[#00ff87]/50 text-[#00ff87] text-3xl font-black shadow-lg shadow-[#00ff87]/20 mb-1">
                                ✓
                            </div>
                            <div>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00ff87] font-bold bg-[#00ff87]/10 border border-[#00ff87]/20 px-2.5 py-0.5 rounded-full inline-block">
                                    PAYMENT CONFIRMED
                                </span>
                                <h2 className="text-2xl font-black tracking-tight text-white mt-1.5">
                                    Official Gym Receipt
                                </h2>
                                <p className="text-xs text-zinc-400">
                                    Your IronCore membership is activated and ready to train.
                                </p>
                            </div>
                        </div>

                        {/* Receipt Details Card */}
                        <div className="bg-[#181a20] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs">
                            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
                                <span className="text-zinc-400 font-medium">Plan Activated</span>
                                <span className="text-white font-bold">{receipt.planName}</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
                                <span className="text-zinc-400 font-medium">Amount Paid</span>
                                <span className="text-[#00ff87] font-mono text-base font-black">
                                    ₹{receipt.amount.toLocaleString('en-IN')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
                                <span className="text-zinc-400 font-medium">Payment ID</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-zinc-300 text-[11px]">
                                        {receipt.paymentId}
                                    </span>
                                    <button
                                        onClick={handleCopyId}
                                        title="Copy Payment ID"
                                        className="text-zinc-500 hover:text-white text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 cursor-pointer"
                                    >
                                        {copied ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
                                <span className="text-zinc-400 font-medium">Transaction Time</span>
                                <span className="text-zinc-300 font-mono text-[11px]">
                                    {receipt.date} • {receipt.time}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-0.5">
                                <span className="text-zinc-400 font-medium">Gateway Status</span>
                                <span className="inline-flex items-center gap-1.5 text-[#00ff87] font-semibold text-[11px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff87] animate-pulse" />
                                    Captured & Verified
                                </span>
                            </div>
                        </div>

                        {/* Auto-redirect Banner & Action Button */}
                        <div className="space-y-3 pt-1">
                            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                                <span className="flex items-center gap-1.5">
                                    <span>⏱️</span> Auto-redirecting to Member App:
                                </span>
                                <span className="text-[#00ff87] font-bold">
                                    {countdown}s
                                </span>
                            </div>

                            {/* Animated progress bar */}
                            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#00ff87] h-full transition-all duration-1000 ease-linear"
                                    style={{ width: `${(countdown / 3) * 100}%` }}
                                />
                            </div>

                            <button
                                onClick={handleGoToMemberApp}
                                className="w-full py-3.5 px-4 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00ff87]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                                <span>Go to Member App</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
