import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentGym } from "../../gymConfig";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white px-6 py-16">
            <div className="max-w-3xl mx-auto space-y-6 text-sm text-neutral-300 leading-relaxed">
                <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:underline">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <h1 className="text-3xl font-black uppercase tracking-tight text-white">Terms & Conditions</h1>
                <p className="text-neutral-400">Last Updated: November 2026</p>

                <section className="space-y-2">
                    <h2 className="text-lg font-bold text-white">1. Membership & Access</h2>
                    <p>
                        By purchasing a membership plan on {currentGym.name}, you agree to follow facility rules, hygiene standards, and equipment safety guidelines. Digital portal access is valid for the active duration of your chosen subscription.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-bold text-white">2. Payments & Billing</h2>
                    <p>
                        All membership fees are priced in Indian Rupees (INR) and processed securely via Razorpay. Membership activation occurs immediately upon payment confirmation.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-bold text-white">3. Health & Safety Disclaimer</h2>
                    <p>
                        Members are responsible for ensuring they are medically fit for physical exercise. {currentGym.name} is not liable for injuries resulting from improper equipment use or failure to follow trainer instructions.
                    </p>
                </section>
            </div>
        </div>
    );
}