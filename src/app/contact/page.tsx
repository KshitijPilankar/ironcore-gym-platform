import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { currentGym } from "../../gymConfig";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white px-6 py-16">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:underline mb-8">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <h1 className="text-3xl font-black uppercase tracking-tight mb-4">Contact Us</h1>
                <p className="text-neutral-400 text-sm mb-8">
                    Have questions about memberships, digital app access, or billing? Reach out to {currentGym.name}.
                </p>

                <div className="space-y-4 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-sm">
                    <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Phone / WhatsApp Support</p>
                            <p className="text-neutral-400">+{currentGym.phone}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Email</p>
                            <p className="text-neutral-400">kshitijpilankar3710@gmail.com</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Operating Address</p>
                            <p className="text-neutral-400">Matunga, Mumbai, Maharashtra 400019, India</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}