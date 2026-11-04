import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { phone, otp } = await req.json();

        if (!phone || !otp) {
            return NextResponse.json(
                { error: "Phone number and OTP are mandatory." },
                { status: 400 }
            );
        }

        const cleanPhone = phone.replace(/[^0-9]/g, "");
        const recipientPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || "1403885859474438";
        const token =
            process.env.WHATSAPP_ACCESS_TOKEN ||
            "EAAQBlq9m170BSxGt6mYqD2AbgC4OuCXXwuhBf80l4lACWpOwGr2CDnZC2XeHS1YIMZBqlZAdjlMPWPegIkcEirFuYCVOyQ32dcAGUfrwW3MJVWmSSAO6aFNU5gAPOuYT4ZAKoZAFnZBBeI0GwiB6o6E7ZCZC9BntMfeiEoZCJ5lMLh5pV5yaACcEEQ47GrtI3dTILD7Wxjnldb9PDWtZAOJGtzXvS4G6vME3UvkgCdECD5oZBCaTLENDZAScQcX1ZAGsNJkaP31DWLPDad3dxUBRbSJEcaYkjMtcZD";

        console.log(`[Meta Cloud API] Initiating OTP dispatch: ${otp} -> +${recipientPhone}`);

        // Direct WhatsApp text message inside open 24h conversation window
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
                        body: `🏋️ *IronCore Fitness Verification*\n\nAapka login OTP code hai: *${otp}*\n\nYeh code 5 minutes ke liye valid hai. Kisi ke sath share na karein.`,
                    },
                }),
            }
        );

        const data = await metaResponse.json();
        console.log("[Meta Cloud API Result]:", JSON.stringify(data));

        if (!metaResponse.ok) {
            console.error("[Meta Cloud API Error]:", data);
            return NextResponse.json(
                {
                    error:
                        data.error?.message ||
                        "Meta WhatsApp API call failed. Please check token or whitelist.",
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
            { error: "Internal server error occurred while dispatching OTP." },
            { status: 500 }
        );
    }
}