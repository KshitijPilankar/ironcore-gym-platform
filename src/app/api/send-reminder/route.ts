import { NextResponse } from "next/server";
import { verifySignedToken } from "@/lib/auth-store";

export async function POST(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie") || "";
        const match = cookieHeader.match(/ironcore_admin_token=([^;]+)/);
        const adminToken = match ? match[1] : null;

        if (!adminToken) {
            return NextResponse.json(
                { success: false, error: "Unauthorized: Admin session required" },
                { status: 401 }
            );
        }

        const session = verifySignedToken(adminToken);
        if (!session.valid || session.payload?.role !== "admin") {
            return NextResponse.json(
                { success: false, error: "Unauthorized: Invalid admin credentials" },
                { status: 401 }
            );
        }

        const { phone, memberName, dueDate, plan, streakDays } = await req.json();

        if (!phone) {
            return NextResponse.json(
                { success: false, error: "Phone number is required" },
                { status: 400 }
            );
        }

        let cleanPhone = phone.replace(/\D/g, "");
        if (!cleanPhone.startsWith("91") && cleanPhone.length === 10) {
            cleanPhone = "91" + cleanPhone;
        }

        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

        if (!phoneNumberId || !accessToken) {
            return NextResponse.json(
                { success: false, error: "WhatsApp credentials not configured on server" },
                { status: 500 }
            );
        }

        const safeName = String(memberName || "Athlete").slice(0, 50).replace(/[^\w\s.-]/gi, "");
        const safePlan = String(plan || "Smart Pass").slice(0, 30);
        const safeDueDate = String(dueDate || "Soon").slice(0, 20);
        const safeStreak = Math.max(0, parseInt(String(streakDays), 10) || 0);

        const messageText =
            `🏋️ *IronCore Fitness Reminder*
━━━━━━━━━━━━━━━━━━
Hey *${safeName}*! 💪

Aapka *${safePlan}* subscription *${safeDueDate}* ko renew hone wala hai.

🔥 *Current Streak:* ${safeStreak} Days! Streak tootne mat dena!
💳 Renewal amount clear karne ke liye gym desk par visit karein ya UPI karein.

_Stay Consistent, Stay Strong!_`;

        const metaResponse = await fetch(
            `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: cleanPhone,
                    type: "text",
                    text: {
                        preview_url: false,
                        body: messageText,
                    },
                }),
            }
        );

        const data = await metaResponse.json();

        if (!metaResponse.ok) {
            return NextResponse.json(
                { success: false, error: data.error?.message || "Meta API error" },
                { status: metaResponse.status }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
