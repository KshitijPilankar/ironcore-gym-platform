import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_SECRET =
    process.env.SESSION_SECRET || "ironcore_secure_production_secret_key_98234710";

/**
 * Validates HMAC-SHA256 signed tokens inside Edge Middleware using Web Crypto API.
 */
async function verifyTokenEdge(token: string | undefined): Promise<boolean> {
    if (!token) return false;
    try {
        const parts = token.split(".");
        if (parts.length !== 2) return false;
        const [base64Data, signature] = parts;

        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            enc.encode(SESSION_SECRET),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["verify"]
        );

        // Base64Url decode helper
        const b64 = signature.replace(/-/g, "+").replace(/_/g, "/");
        const pad = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, "=");
        const binarySig = Uint8Array.from(atob(pad), (c) => c.charCodeAt(0));

        const isValid = await crypto.subtle.verify(
            "HMAC",
            key,
            binarySig,
            enc.encode(base64Data)
        );
        if (!isValid) return false;

        const dataB64 = base64Data.replace(/-/g, "+").replace(/_/g, "/");
        const dataPad = dataB64.padEnd(dataB64.length + (4 - (dataB64.length % 4)) % 4, "=");
        const payload = JSON.parse(atob(dataPad));

        if (payload.exp && Date.now() > payload.exp) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Guard Admin CRM routes (allow /admin/login)
    if (pathname.startsWith("/admin")) {
        if (pathname === "/admin/login") {
            return NextResponse.next();
        }

        const adminCookie = request.cookies.get("ironcore_admin_token")?.value;
        const isAuthenticated = await verifyTokenEdge(adminCookie);

        if (!isAuthenticated) {
            const loginUrl = new URL("/admin/login", request.url);
            loginUrl.searchParams.set("from", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 2. Guard Athlete Portal routes (/portal/*)
    if (pathname.startsWith("/portal")) {
        const memberCookie = request.cookies.get("ironcore_member_token")?.value;
        const adminCookie = request.cookies.get("ironcore_admin_token")?.value;

        const isMemberAuth = await verifyTokenEdge(memberCookie);
        const isAdminAuth = await verifyTokenEdge(adminCookie);

        if (!isMemberAuth && !isAdminAuth) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("from", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/portal/:path*"],
};

