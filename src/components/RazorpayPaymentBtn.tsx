'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PaymentProps {
    amount: number;
    planName: string;
    memberId?: string;
    memberPhone?: string;
    memberName?: string;
    className?: string;
    buttonText?: string;
    onSuccess?: () => void;
}

interface PaymentReceipt {
    paymentId: string;
    orderId?: string;
    planName: string;
    amount: number;
    memberName?: string;
    memberPhone?: string;
    date: string;
    time: string;
}

export default function RazorpayPaymentBtn({
    amount,
    planName,
    memberId = 'member_direct',
    memberPhone = '',
    memberName = '',
    className = '',
    buttonText,
    onSuccess,
}: PaymentProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
    const [countdown, setCountdown] = useState<number>(3);
    const [copied, setCopied] = useState(false);

    // Pre-checkout modal state for missing name/phone
    const [showPreModal, setShowPreModal] = useState(false);
    const [inputName, setInputName] = useState('');
    const [inputPhone, setInputPhone] = useState('');
    const [preModalError, setPreModalError] = useState('');

    // Auto-redirect to /portal once payment is confirmed
    useEffect(() => {
        if (!receipt) return;

        if (countdown <= 0) {
            router.push('/portal');
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

    // User clicks the main pay button
    const handleButtonClick = () => {
        const cleanPhone = (memberPhone || '').replace(/[^0-9]/g, '');
        const rawTen = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
        const hasValidPhone = /^[6-9]\d{9}$/.test(rawTen);
        const hasValidName = Boolean(memberName && memberName.trim().length >= 2);

        if (!hasValidPhone || !hasValidName) {
            setInputName(memberName || '');
            setInputPhone(rawTen || '');
            setPreModalError('');
            setShowPreModal(true);
            return;
        }

        initiateRazorpay(memberName.trim(), rawTen);
    };

    // Submit handler from pre-checkout modal
    const handlePreModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPreModalError('');

        const trimmedName = inputName.trim();
        if (trimmedName.length < 2) {
            setPreModalError('Please enter your full name (at least 2 letters).');
            return;
        }

        const clean = inputPhone.replace(/[^0-9]/g, '');
        const rawTen = clean.length > 10 ? clean.slice(-10) : clean;
        if (!/^[6-9]\d{9}$/.test(rawTen)) {
            setPreModalError('Please enter a valid 10-digit Indian WhatsApp number (starts with 6, 7, 8, or 9).');
            return;
        }

        setShowPreModal(false);
        initiateRazorpay(trimmedName, rawTen);
    };

    const initiateRazorpay = async (finalName: string, finalTenDigitPhone: string) => {
        setLoading(true);

        const res = await loadRazorpayScript();
        if (!res) {
            alert('Razorpay SDK failed to load. Please check your internet connection.');
            setLoading(false);
            return;
        }

        try {
            const recipientPhone = `91${finalTenDigitPhone}`;

            const orderRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    memberId,
                    planName,
                    memberName: finalName,
                    memberPhone: recipientPhone,
                }),
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
                    name: finalName,
                    contact: recipientPhone,
                },
                notes: {
                    memberName: finalName,
                    memberPhone: recipientPhone,
                    planName,
                },
                theme: {
                    color: '#00ff87',
                },
                handler: function (response: any) {
                    const now = new Date();
                    const due30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                    const paymentRecord: PaymentReceipt = {
                        paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                        orderId: response.razorpay_order_id || orderData.orderId,
                        planName,
                        amount: Number(amount),
                        memberName: finalName,
                        memberPhone: recipientPhone,
                        date: now.toISOString().split('T')[0],
                        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    };

                    // 1. Post-Payment Member Auto-Provisioning & Linking
                    try {
                        const activeUser = {
                            id: `mem-${Date.now()}`,
                            name: finalName,
                            phone: recipientPhone,
                            plan: planName,
                            dueDate: due30Days,
                            streakDays: 1,
                            status: 'Paid' as const,
                        };

                        localStorage.setItem('ironcore_active_member', JSON.stringify(activeUser));
                        localStorage.setItem('ironcore_member_session', 'authenticated');

                        // 2. Upsert into CRM members roster
                        const storedMembers = localStorage.getItem('ironcore_members_db');
                        let membersList: any[] = [];
                        if (storedMembers) {
                            try {
                                membersList = JSON.parse(storedMembers);
                                if (!Array.isArray(membersList)) membersList = [];
                            } catch {
                                membersList = [];
                            }
                        }

                        const matchIdx = membersList.findIndex(
                            (m: any) =>
                                m.phone &&
                                (m.phone.includes(finalTenDigitPhone) ||
                                    finalTenDigitPhone.includes(m.phone.replace(/[^0-9]/g, '').slice(-10)))
                        );

                        if (matchIdx >= 0) {
                            membersList[matchIdx] = {
                                ...membersList[matchIdx],
                                name: finalName,
                                status: 'Paid',
                                plan: planName,
                                dueDate: due30Days,
                            };
                        } else {
                            membersList.unshift(activeUser);
                        }

                        localStorage.setItem('ironcore_members_db', JSON.stringify(membersList));

                        // 3. Save payment into localStorage payments database
                        const existingPayments = JSON.parse(
                            localStorage.getItem('ironcore_payments_db') || '[]'
                        );
                        localStorage.setItem(
                            'ironcore_payments_db',
                            JSON.stringify([
                                {
                                    ...paymentRecord,
                                    status: 'Captured',
                                },
                                ...existingPayments,
                            ])
                        );
                    } catch (storageErr) {
                        console.warn('Error provisioning member in localStorage', storageErr);
                    }

                    // 4. Auto-Login API call to set HttpOnly session cookie
                    fetch('/api/auth/auto-login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            phone: recipientPhone,
                            name: finalName,
                        }),
                    }).catch((err) => console.error('Auto-login call failed:', err));

                    // 5. Post to backend record endpoint for server-side persistence
                    fetch('/api/payment/record', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...paymentRecord,
                            status: 'Captured',
                        }),
                    }).catch(() => {});

                    // 6. Trigger UI Receipt modal and trigger callback
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
        router.push('/portal');
    };

    return (
        <>
            <button
                onClick={handleButtonClick}
                disabled={loading}
                className={className}
            >
                {loading ? 'Processing...' : (buttonText || `Pay ₹${amount}`)}
            </button>

            {/* Inline Pre-Checkout Modal (Captures Name & Phone before opening Razorpay) */}
            {showPreModal && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div
                        className="bg-[#121316] border border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Glow accent */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#00ff87]/10 blur-3xl pointer-events-none" />

                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00ff87] font-bold bg-[#00ff87]/10 border border-[#00ff87]/20 px-2.5 py-0.5 rounded-full inline-block">
                                    FAST CHECKOUT
                                </span>
                                <h3 className="text-xl font-black text-white mt-2">
                                    Athlete Details
                                </h3>
                                <p className="text-xs text-zinc-400 mt-0.5">
                                    Enter your info to link your <span className="text-white font-semibold">{planName}</span> (₹{amount}).
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPreModal(false)}
                                className="text-zinc-500 hover:text-white text-lg p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {preModalError && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                                {preModalError}
                            </div>
                        )}

                        <form onSubmit={handlePreModalSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Kshitij Pilankar"
                                    value={inputName}
                                    onChange={(e) => setInputName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-[#181a20] border border-zinc-800 text-sm focus:outline-none focus:border-[#00ff87] text-white placeholder-zinc-500 font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                                    10-Digit WhatsApp Mobile
                                </label>
                                <div className="flex items-center rounded-xl bg-[#181a20] border border-zinc-800 focus-within:border-[#00ff87] overflow-hidden">
                                    <span className="px-3.5 text-xs font-mono text-zinc-400 border-r border-zinc-800 bg-zinc-900/60 py-3">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        required
                                        maxLength={10}
                                        placeholder="9004884885"
                                        value={inputPhone}
                                        onChange={(e) => setInputPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="w-full px-4 py-3 bg-transparent text-sm focus:outline-none text-white placeholder-zinc-500 font-mono"
                                    />
                                </div>
                                <span className="text-[10px] text-zinc-500 mt-1 block">
                                    Your workout pass and portal access will be tied to this number.
                                </span>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 px-4 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00ff87]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                                <span>Continue to Secure Payment</span>
                                <span>→</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

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
                                    Welcome, <span className="text-white font-semibold">{receipt.memberName}</span>! Your membership is activated for 30 days.
                                </p>
                            </div>
                        </div>

                        {/* Receipt Details Card */}
                        <div className="bg-[#181a20] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs">
                            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
                                <span className="text-zinc-400 font-medium">Athlete Name</span>
                                <span className="text-white font-bold">{receipt.memberName}</span>
                            </div>

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
                                    Captured & Auto-Logged In
                                </span>
                            </div>
                        </div>

                        {/* Auto-redirect Banner & Action Button */}
                        <div className="space-y-3 pt-1">
                            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                                <span className="flex items-center gap-1.5">
                                    <span>⏱️</span> Auto-redirecting to Athlete Hub:
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
                                <span>Go to Athlete Portal</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
