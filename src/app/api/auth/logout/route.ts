import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({
        success: true,
        message: "Logged out successfully from IronCore session.",
    });

    // Clear member token cookie
    response.cookies.set({
        name: "ironcore_member_token",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    // Clear admin token cookie
    response.cookies.set({
        name: "ironcore_admin_token",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    // Clear any active OTP cookie
    response.cookies.set({
        name: "ironcore_otp_sig",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return response;
}
