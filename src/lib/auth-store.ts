import crypto from "crypto";

// Sliding window rate limiter: phone -> timestamps[]
const rateLimitStore = new Map<string, number[]>();

const MAX_OTP_PER_10_MIN = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export const SESSION_SECRET =
    process.env.SESSION_SECRET || "ironcore_secure_production_secret_key_98234710";

/**
 * Checks sliding window rate limit for a phone number.
 * Returns true if allowed, false if limit exceeded.
 */
export function checkRateLimit(phone: string): boolean {
    const now = Date.now();
    const timestamps = rateLimitStore.get(phone) || [];

    // Filter out timestamps outside window
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

    if (recent.length >= MAX_OTP_PER_10_MIN) {
        rateLimitStore.set(phone, recent);
        return false;
    }

    recent.push(now);
    rateLimitStore.set(phone, recent);
    return true;
}

/**
 * Creates a stateless HMAC-SHA256 signature for serverless OTP verification.
 * Format: `${expiresAt}.${hmac}`
 */
export function createOtpSignature(phone: string, otp: string, expiresAt: number): string {
    const hmac = crypto
        .createHmac("sha256", SESSION_SECRET)
        .update(`${phone}:${otp}:${expiresAt}`)
        .digest("hex");
    return `${expiresAt}.${hmac}`;
}

/**
 * Verifies the stateless OTP signature cookie using constant-time comparison.
 */
export function verifyOtpSignature(
    phone: string,
    otp: string,
    signatureCookie: string
): { valid: boolean; error?: string } {
    if (!signatureCookie || !signatureCookie.includes(".")) {
        return { valid: false, error: "OTP expired ya generate nahi hua. Kripya naya code mangwayein." };
    }

    const [expiresAtStr, sig] = signatureCookie.split(".");
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || !sig) {
        return { valid: false, error: "Invalid OTP session signature. Kripya naya code request karein." };
    }

    if (Date.now() > expiresAt) {
        return { valid: false, error: "OTP ki valid time (5 minutes) khatam ho chuki hai. Naya OTP lein." };
    }

    const clean = phone.replace(/[^0-9]/g, "");
    const rawTen = clean.length > 10 ? clean.slice(-10) : clean;
    const withCountry = `91${rawTen}`;

    // Test candidate phone formats in case phone was normalized with or without 91 prefix
    const candidatePhones = Array.from(new Set([phone, clean, withCountry, rawTen]));
    const sigBuf = Buffer.from(sig);

    for (const candidate of candidatePhones) {
        const expectedHmac = crypto
            .createHmac("sha256", SESSION_SECRET)
            .update(`${candidate}:${otp}:${expiresAt}`)
            .digest("hex");

        const expectedBuf = Buffer.from(expectedHmac);
        if (sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf)) {
            return { valid: true };
        }
    }

    return {
        valid: false,
        error: "Galat OTP! Kripya WhatsApp par aaya hua 4-digit code enter karein.",
    };
}

/**
 * Generates a signed token for authenticated sessions.
 */
export function createSignedToken(payload: { id: string; role: "member" | "admin" }): string {
    const data = JSON.stringify({
        ...payload,
        iat: Date.now(),
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    const base64Data = Buffer.from(data).toString("base64url");
    const signature = crypto
        .createHmac("sha256", SESSION_SECRET)
        .update(base64Data)
        .digest("base64url");
    return `${base64Data}.${signature}`;
}

/**
 * Verifies signed session token.
 */
export function verifySignedToken(token: string): { valid: boolean; payload?: any } {
    try {
        const [base64Data, signature] = token.split(".");
        if (!base64Data || !signature) return { valid: false };

        const expectedSig = crypto
            .createHmac("sha256", SESSION_SECRET)
            .update(base64Data)
            .digest("base64url");

        if (
            expectedSig.length !== signature.length ||
            !crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(signature))
        ) {
            return { valid: false };
        }

        const payload = JSON.parse(Buffer.from(base64Data, "base64url").toString("utf8"));
        if (payload.exp && Date.now() > payload.exp) {
            return { valid: false };
        }

        return { valid: true, payload };
    } catch {
        return { valid: false };
    }
}
