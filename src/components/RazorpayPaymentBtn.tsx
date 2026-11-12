'use client';

import React, { useState } from 'react';

interface PaymentProps {
    amount: number;
    planName: string;
    memberId?: string;
    memberPhone?: string;
    className?: string;
    buttonText?: string;
    onSuccess?: () => void;
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
    const [loading, setLoading] = useState(false);

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
                    color: '#10b981',
                },
                handler: function (response: any) {
                    alert(`🎉 Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
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

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className={className}
        >
            {loading ? 'Processing...' : (buttonText || `Pay ₹${amount}`)}
        </button>
    );
}