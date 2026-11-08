import crypto from "crypto";

interface OtpRecord {
    otp: string;
    expiresAt: number;
    attempts: number;
}

// In-memory OTP Store (5 min TTL)
const otpStore = new Map<string, OtpRecord>();

// Sliding window rate limiter: phone -> timestamps[]
const rateLimitStore = new Map<string, number[]>();

const MAX_OTP_PER_10_MIN = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

const SESSION_SECRET =
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
 * Stores a cryptographically generated 4-digit OTP with 5 min TTL.
 */
export function saveOtp(phone: string, otp: string): void {
    otpStore.set(phone, {
        otp,
        expiresAt: Date.now() + OTP_TTL_MS,
        attempts: 0,
    });
}

/**
 * Verifies submitted OTP against stored OTP using constant-time comparison.
 */
export function verifyOtp(phone: string, inputOtp: string): { valid: boolean; error?: string } {
    const record = otpStore.get(phone);

    if (!record) {
        return { valid: false, error: "OTP expired ya generate nahi hua. Kripya naya code mangwayein." };
    }

    if (Date.now() > record.expiresAt) {
        otpStore.delete(phone);
        return { valid: false, error: "OTP ki valid time (5 minutes) khatam ho chuki hai. Naya OTP lein." };
    }

    record.attempts += 1;
    if (record.attempts > MAX_VERIFY_ATTEMPTS) {
        otpStore.delete(phone);
        return { valid: false, error: "Maximum attempts cross ho gaye. Kripya naya code request karein." };
    }

    // Timing-safe constant time comparison to defeat timing attacks
    const a = Buffer.from(record.otp);
    const b = Buffer.from(inputOtp.padEnd(record.otp.length, " "));

    const isMatch = a.length === b.length && crypto.timingSafeEqual(a, b);

    if (isMatch) {
        otpStore.delete(phone);
        return { valid: true };
    }

    return {
        valid: false,
        error: `Galat OTP! Kripya WhatsApp par aaya hua 4-digit code enter karein. (${MAX_VERIFY_ATTEMPTS - record.attempts} attempts bache hain)`,
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
