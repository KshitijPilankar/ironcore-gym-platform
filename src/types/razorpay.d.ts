declare module 'razorpay' {
    interface RazorpayConfig {
        key_id: string;
        key_secret: string;
    }

    interface OrderOptions {
        amount: number;
        currency: string;
        receipt?: string;
        notes?: Record<string, any>;
        partial_payment?: boolean;
    }

    export default class Razorpay {
        constructor(config: RazorpayConfig);
        orders: {
            create(options: OrderOptions): Promise<any>;
            fetch(orderId: string): Promise<any>;
        };
    }
}

interface Window {
    Razorpay: any;
}