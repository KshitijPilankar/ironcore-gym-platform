import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSignedToken } from "@/lib/auth-store";

function safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Admin email and password are required." },
                { status: 400 }
            );
        }

        const expectedEmail = (process.env.ADMIN_EMAIL || "admin@ironcore.fit").toLowerCase();
        const expectedPassword = process.env.ADMIN_PASSWORD || "ironcore2026";

        const emailMatch = safeCompare(email.trim().toLowerCase(), expectedEmail);
        const passwordMatch = safeCompare(password, expectedPassword);

        if (!emailMatch || !passwordMatch) {
            return NextResponse.json(
                { error: "Invalid Admin Email or Password." },
                { status: 401 }
            );
        }

        // Generate signed admin session token
        const adminToken = createSignedToken({
            id: expectedEmail,
            role: "admin",
        });

        const response = NextResponse.json({
            success: true,
            role: "admin",
        });

        // Set HttpOnly Admin Token Cookie
        response.cookies.set({
            name: "ironcore_admin_token",
            value: adminToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error: any) {
        console.error("Internal Server Error in admin login:", error);
        return NextResponse.json(
            { error: "Internal server error occurred during admin authentication." },
            { status: 500 }
        );
    }
}
