export interface PaymentTransaction {
    id: string;
    paymentId: string;
    orderId?: string;
    amount: number;
    planName: string;
    memberPhone?: string;
    memberName?: string;
    date: string;
    time: string;
    status: 'Captured' | 'Refunded' | 'Failed';
}

// In-memory transaction store for demo & live runtime
const globalPayments: PaymentTransaction[] = [
    {
        id: "pay_live_01",
        paymentId: "pay_Q8a9bK1249zL",
        orderId: "order_Q8a97y9124",
        amount: 1999,
        planName: "Smart Athlete Pass",
        memberPhone: "919004884885",
        memberName: "Kshitij Pilankar",
        date: "2026-11-12",
        time: "14:20",
        status: "Captured",
    },
    {
        id: "pay_live_02",
        paymentId: "pay_Q7z81x8190mN",
        orderId: "order_Q7z81b0128",
        amount: 1499,
        planName: "Standard Gym Plan",
        memberPhone: "919876543213",
        memberName: "Sneha Patel",
        date: "2026-11-10",
        time: "11:05",
        status: "Captured",
    },
];

export function addPayment(tx: PaymentTransaction): void {
    const exists = globalPayments.some((p) => p.paymentId === tx.paymentId);
    if (!exists) {
        globalPayments.unshift(tx);
    }
}

export function getPayments(): PaymentTransaction[] {
    return globalPayments;
}
