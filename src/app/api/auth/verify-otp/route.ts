import { NextResponse } from "next/server";
import { verifyOtp, createSignedToken } from "@/lib/auth-store";

export async function POST(req: Request) {
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

        // Verify OTP strictly on server using constant-time comparison
        const result = verifyOtp(recipientPhone, otp.trim());

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

        // Set HttpOnly, Secure Session Cookie
        const response = NextResponse.json({
            success: true,
            phone: recipientPhone,
            role: "member",
        });

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
