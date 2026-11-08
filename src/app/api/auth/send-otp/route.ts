import { NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit, saveOtp } from "@/lib/auth-store";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { phone } = body;

        if (!phone || typeof phone !== "string") {
            return NextResponse.json(
                { error: "10-digit mobile number is mandatory." },
                { status: 400 }
            );
        }

        const cleanPhone = phone.replace(/[^0-9]/g, "");

        // 10-Digit Legitimate Indian Mobile Format Validation
        const indianMobileRegex = /^[6-9]\d{9}$/;
        const rawTenDigit = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;

        if (!indianMobileRegex.test(rawTenDigit)) {
            return NextResponse.json(
                { error: "Valid 10-digit Indian mobile number required (starting with 6, 7, 8, or 9)." },
                { status: 400 }
            );
        }

        const recipientPhone = `91${rawTenDigit}`;

        // Rate limit check: max 5 requests per 10 minutes per phone
        if (!checkRateLimit(recipientPhone)) {
            return NextResponse.json(
                { error: "Too many OTP requests. Please wait 10 minutes before requesting again." },
                { status: 429 }
            );
        }

        // SEC-01: Strictly read credentials from process.env, never use hardcoded fallbacks
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const token = process.env.WHATSAPP_ACCESS_TOKEN;

        if (!phoneId || !token) {
            console.error("[Meta Cloud API Configuration Error]: Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN.");
            return NextResponse.json(
                { error: "WhatsApp service configuration error on server." },
                { status: 500 }
            );
        }

        // SEC-02 & SEC-07: Cryptographically secure 4-digit OTP generated strictly on server
        const secureOtp = crypto.randomInt(1000, 10000).toString();

        // Store OTP with 5-minute expiry in memory store
        saveOtp(recipientPhone, secureOtp);

        console.log(`[Meta Cloud API] Dispatching secure OTP to +${recipientPhone}`);

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
                        body: `🏋️ *IronCore Fitness Verification*\n\nAapka login OTP code hai: *${secureOtp}*\n\nYeh code 5 minutes ke liye valid hai. Kisi ke sath share na karein.`,
                    },
                }),
            }
        );

        const data = await metaResponse.json();

        if (!metaResponse.ok) {
            console.error("[Meta Cloud API Error]:", data);
            return NextResponse.json(
                {
                    error:
                        data.error?.message ||
                        "Meta WhatsApp API call failed. Please check phone whitelist.",
                },
                { status: metaResponse.status }
            );
        }

        return NextResponse.json({
            success: true,
            messageId: data.messages?.[0]?.id,
        });
    } catch (error: any) {
        console.error("Internal Server Error in send-otp:", error);
        return NextResponse.json(
            { error: "Internal server error occurred while dispatching OTP." },
            { status: 500 }
        );
    }
}
