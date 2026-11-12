import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentGym } from "../../gymConfig";

export default function RefundPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white px-6 py-16">
            <div className="max-w-3xl mx-auto space-y-6 text-sm text-neutral-300 leading-relaxed">
                <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:underline">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <h1 className="text-3xl font-black uppercase tracking-tight text-white">Refund & Cancellation Policy</h1>
                <p className="text-neutral-400">Last Updated: November 2026</p>

                <section className="space-y-2">
                    <h2 className="text-lg font-bold text-white">1. Cancellation Policy</h2>
                    <p>
                        Members may choose not to renew their monthly subscription at the end of any billing cycle. There are no auto-debit lock-ins unless explicitly opted in.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-bold text-white">2. Refund Eligibility</h2>
                    <p>
                        Once a gym membership or digital pass is activated, fees are generally non-refundable. However, if a duplicate payment occurs due to a technical error or payment gateway glitch, a 100% refund will be processed within 5–7 business days to the original payment method.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-bold text-white">3. How to Request a Refund</h2>
                    <p>
                        For duplicate transactions or billing issues, contact us within 48 hours of payment with your Razorpay Payment ID at <span className="text-emerald-400">kshitijpilankar3710@gmail.com</span>.
                    </p>
                </section>
            </div>
        </div>
    );
}