import { NextResponse } from "next/server";
import { verifySignedToken } from "@/lib/auth-store";

export async function POST(req: Request) {
    try {
        // SEC-05: Authenticate admin session before dispatching reminders
        const cookieHeader = req.headers.get("cookie") || "";
        const match = cookieHeader.match(/ironcore_admin_token=([^;]+)/);
        const adminToken = match ? match[1] : null;

        if (!adminToken) {
            return NextResponse.json(
                { error: "Unauthorized: Admin session required to send renewal reminders." },
                { status: 401 }
            );
        }

        const session = verifySignedToken(adminToken);
        if (!session.valid || session.payload?.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized: Invalid or expired admin credentials." },
                { status: 401 }
            );
        }

        const body = await req.json().catch(() => ({}));
        const { name, phone, plan, dueDate, streakDays, amount } = body;

        if (!phone || !name) {
            return NextResponse.json(
                { error: "Member name aur phone number dono mandatory hain." },
                { status: 400 }
            );
        }

        // Sanitize phone
        const cleanPhone = phone.replace(/[^0-9]/g, "");
        const rawTenDigit = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;

        if (!/^[6-9]\d{9}$/.test(rawTenDigit)) {
            return NextResponse.json(
                { error: "Invalid 10-digit Indian mobile number." },
                { status: 400 }
            );
        }

        const recipientPhone = `91${rawTenDigit}`;

        // SEC-01: Read credentials strictly from process.env, never use hardcoded strings
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const token = process.env.WHATSAPP_ACCESS_TOKEN;

        if (!phoneId || !token) {
            console.error("[Meta Reminder API Error]: Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN.");
            return NextResponse.json(
                { error: "Server WhatsApp credentials not configured." },
                { status: 500 }
            );
        }

        // Sanitize inputs to prevent text injection
        const safeName = String(name).slice(0, 50).replace(/[^\w\s.-]/gi, "");
        const safePlan = String(plan || "Smart Pass").slice(0, 30);
        const safeDueDate = String(dueDate || "Soon").slice(0, 20);
        const safeStreak = Math.max(0, parseInt(String(streakDays), 10) || 0);
        const renewalPrice = String(amount || (safePlan === "Smart Pass" ? "1,999" : "1,499")).replace(/[^0-9,]/g, "");

        // Dynamic Personalized Message Body
        const personalizedMessage =
            `🏋️ *IronCore Fitness • Membership Renewal Alert*\n\n` +
            `Hi *${safeName}*! 👋\n\n` +
            `Aapka *${safePlan}* subscription *${safeDueDate}* ko renew hone wala hai.\n\n` +
            `🔥 *Workout Streak:* *${safeStreak} Days Unbroken!*\n` +
            `Top 3 consistency leaderboard me bane rehne aur monthly rewards ke liye apna pass time par renew karein.\n\n` +
            `💳 *Renewal Amount:* ₹${renewalPrice}/month\n` +
            `⚡ *Payment:* Gym front desk par UPI scan karein ya instant renew karein.\n\n` +
            `Agar training ya membership pause/freeze karni ho toh yahan direct reply karein. Stay Strong! 💪`;

        console.log(`[Meta Reminder API] Admin dispatching verified alert to ${safeName} (+${recipientPhone})`);

        const metaResponse = await fetch(
            `https://graph.facebook.com/v20.0/${phoneId}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: recipientPhone,
                    type: "text",
                    text: {
                        preview_url: false,
                        body: personalizedMessage,
                    },
                }),
            }
        );

        const data = await metaResponse.json();

        if (!metaResponse.ok) {
            console.error("[Meta Reminder API Error]:", data);
            return NextResponse.json(
                {
                    error:
                        data.error?.message ||
                        "Meta WhatsApp API call fail hui. Kripya terminal check karein.",
                },
                { status: metaResponse.status }
            );
        }

        return NextResponse.json({
            success: true,
            messageId: data.messages?.[0]?.id,
        });
    } catch (error: any) {
        console.error("Internal Server Error in send-reminder:", error);
        return NextResponse.json(
            { error: "Server error occurred while dispatching WhatsApp reminder." },
            { status: 500 }
        );
    }
}
