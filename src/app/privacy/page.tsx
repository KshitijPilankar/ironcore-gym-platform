import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentGym } from "../../gymConfig";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white px-6 py-16">
            <div className="max-w-3xl mx-auto space-y-6 text-sm text-neutral-300 leading-relaxed">
                <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:underline">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <h1 className="text-3xl font-black uppercase tracking-tight text-white">Privacy Policy</h1>
                <p className="text-neutral-400">Last Updated: November 2026</p>

                <section className="space-y-2">
                    <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
                    <p>
                        {currentGym.name} collects basic member details including your name, phone number, workout logs, and payment transaction references strictly for membership management, OTP authentication, and WhatsApp attendance/receipt alerts.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-bold text-white">2. Payment Security</h2>
                    <p>
                        We do not store your credit/debit card details, UPI PINs, or netbanking credentials on our servers. All transactions are encrypted and handled directly by Razorpay in compliance with PCI-DSS standards.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-bold text-white">3. Data Sharing</h2>
                    <p>
                        We never sell or rent member data to third parties. Data is shared only with essential service providers (Razorpay for payments and Meta WhatsApp Cloud API for automated receipts).
                    </p>
                </section>
            </div>
        </div>
    );
}