import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
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

        // Dynamic Custom Message
        const messageText =
            `🏋️ *IronCore Fitness Reminder*
━━━━━━━━━━━━━━━━━━
Hey *${memberName}*! 💪

Aapka *${plan}* subscription *${dueDate}* ko renew hone wala hai.

🔥 *Current Streak:* ${streakDays} Days! Streak tootne mat dena!
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
            console.error("Meta API Error:", data);
            return NextResponse.json(
                { success: false, error: data.error?.message || "Meta API error" },
                { status: metaResponse.status }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Internal Server Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}