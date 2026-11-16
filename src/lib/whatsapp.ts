/**
 * IronCore Fitness WhatsApp Automation Service
 */

export async function sendWelcomeWhatsAppMessage({
    phone,
    name,
    plan,
    amount,
    dueDate,
}: {
    phone: string;
    name: string;
    plan: string;
    amount: number;
    dueDate: string;
}): Promise<{ success: boolean; data?: any; error?: any }> {
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneId || !token) {
        return { success: false, error: 'Credentials not configured' };
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const rawTen = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
    const recipientPhone = `91${rawTen}`;

    const text =
        `🏋️ *Welcome to IronCore Fitness!* ⚡\n\n` +
        `Hi *${name || 'Athlete'}*, aapka payment capture & membership confirm ho gaya hai!\n\n` +
        `📋 *Membership Pass Details:*\n` +
        `• Plan: *${plan}*\n` +
        `• Amount Paid: *₹${amount.toLocaleString('en-IN')}*\n` +
        `• Valid Until: *${dueDate}* (30 Days Active)\n\n` +
        `📲 *Athlete Portal Access:*\n` +
        `5,600+ 3D exercise guides, workout history, aur Snapchat-style streak leaderboard access karein yahan:\n` +
        `https://ironcore-gym-platform.vercel.app/portal\n\n` +
        `See you on the gym floor! Let's crush your goals. 💪🔥`;

    try {
        const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: recipientPhone,
                type: 'text',
                text: { preview_url: false, body: text },
            }),
        });

        const data = await res.json();
        return { success: res.ok, data };
    } catch (err) {
        console.warn('[WhatsApp Welcome Dispatch Silently Failed]:', err);
        return { success: false, error: err };
    }
}
