import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { name, phone, plan, dueDate, streakDays, amount } = await req.json();

        if (!phone || !name) {
            return NextResponse.json(
                { error: "Member name aur phone number dono mandatory hain." },
                { status: 400 }
            );
        }

        const cleanPhone = phone.replace(/[^0-9]/g, "");
        const recipientPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || "1403885859474438";
        const token =
            process.env.WHATSAPP_ACCESS_TOKEN ||
            "EAAQBlq9m170BSxGt6mYqD2AbgC4OuCXXwuhBf80l4lACWpOwGr2CDnZC2XeHS1YIMZBqlZAdjlMPWPegIkcEirFuYCVOyQ32dcAGUfrwW3MJVWmSSAO6aFNU5gAPOuYT4ZAKoZAFnZBBeI0GwiB6o6E7ZCZC9BntMfeiEoZCJ5lMLh5pV5yaACcEEQ47GrtI3dTILD7Wxjnldb9PDWtZAOJGtzXvS4G6vME3UvkgCdECD5oZBCaTLENDZAScQcX1ZAGsNJkaP31DWLPDad3dxUBRbSJEcaYkjMtcZD";

        const renewalPrice = amount || (plan === "Smart Pass" ? "1,999" : "1,499");

        // Dynamic Personalized Message Body
        const personalizedMessage =
            `🏋️ *IronCore Fitness • Membership Renewal Alert*\n\n` +
            `Hi *${name}*! 👋\n\n` +
            `Aapka *${plan}* subscription *${dueDate}* ko renew hone wala hai.\n\n` +
            `🔥 *Workout Streak:* *${streakDays} Days Unbroken!*\n` +
            `Top 3 consistency leaderboard me bane rehne aur monthly rewards ke liye apna pass time par renew karein.\n\n` +
            `💳 *Renewal Amount:* ₹${renewalPrice}/month\n` +
            `⚡ *Payment:* Gym front desk par UPI scan karein ya instant renew karein.\n\n` +
            `Agar training ya membership pause/freeze karni ho toh yahan direct reply karein. Stay Strong! 💪`;

        console.log(`[Meta Reminder API] Sending personalized alert to ${name} (+${recipientPhone})`);

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
        console.log("[Meta Reminder API Raw Result]:", JSON.stringify(data));

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
        console.error("Internal Server Error:", error);
        return NextResponse.json(
            { error: "Server error occurred while dispatching WhatsApp reminder." },
            { status: 500 }
        );
    }
}