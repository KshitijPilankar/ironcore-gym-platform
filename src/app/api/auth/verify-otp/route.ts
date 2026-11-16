import { NextRequest, NextResponse } from "next/server";
import { verifyOtpSignature, createSignedToken } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const { phone, otp } = body;

        if (!phone || !otp) {
            return NextResponse.json(
                { error: "Phone number and 4-digit OTP are required." },
                { status: 400 }
            );
        }

        const cleanPhone = phone.replace(/[^0-9]/g, "");
        const rawTenDigit = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
        const recipientPhone = `91${rawTenDigit}`;

        // Read ironcore_otp_sig from cookies (or fallback to cookie header)
        let cookieVal = req.cookies.get("ironcore_otp_sig")?.value;
        if (!cookieVal) {
            const rawCookie = req.headers.get("cookie") || "";
            const match = rawCookie.match(/(?:^|;\s*)ironcore_otp_sig=([^;]+)/);
            if (match) {
                cookieVal = decodeURIComponent(match[1]);
            }
        }

        if (!cookieVal) {
            return NextResponse.json(
                { error: "OTP expired ya generate nahi hua. Kripya naya code mangwayein." },
                { status: 400 }
            );
        }

        // Verify OTP signature statelessly using constant-time timingSafeEqual HMAC comparison
        const result = verifyOtpSignature(recipientPhone, otp.trim(), cookieVal);

        if (!result.valid) {
            return NextResponse.json(
                { error: result.error || "Invalid OTP code." },
                { status: 400 }
            );
        }

        // Generate cryptographically signed session token
        const token = createSignedToken({
            id: recipientPhone,
            role: "member",
        });

        // Set HttpOnly, Secure Session Cookie and clear the OTP cookie
        const response = NextResponse.json({
            success: true,
            phone: recipientPhone,
            role: "member",
        });

        // Clear the OTP cookie
        response.cookies.set({
            name: "ironcore_otp_sig",
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        });

        // Issue member session cookie
        response.cookies.set({
            name: "ironcore_member_token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error: any) {
        console.error("Internal Server Error in verify-otp:", error);
        return NextResponse.json(
            { error: "Internal server error occurred while verifying OTP." },
            { status: 500 }
        );
    }
}
