import { NextResponse } from "next/server";
import { createSignedToken } from "@/lib/auth-store";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { phone, name } = body;

        if (!phone || typeof phone !== "string") {
            return NextResponse.json(
                { error: "Phone number is required for auto-login." },
                { status: 400 }
            );
        }

        const cleanPhone = phone.replace(/[^0-9]/g, "");
        const rawTenDigit = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
        const recipientPhone = `91${rawTenDigit}`;

        // Issue cryptographically signed member session token
        const token = createSignedToken({
            id: recipientPhone,
            role: "member",
        });

        const response = NextResponse.json({
            success: true,
            phone: recipientPhone,
            name: name || "Athlete Member",
            role: "member",
        });

        // Set HttpOnly member session cookie (7 days)
        response.cookies.set({
            name: "ironcore_member_token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
        });

        return response;
    } catch (err: any) {
        console.error("[Auto-login Error]:", err);
        return NextResponse.json(
            { error: "Internal server error during auto-login." },
            { status: 500 }
        );
    }
}
