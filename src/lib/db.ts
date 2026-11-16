import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PaymentTransaction, addPayment, getPayments } from './payment-store';

export interface MemberRecord {
    id: string;
    name: string;
    phone: string;
    plan: string;
    dueDate: string;
    streakDays: number;
    status: 'Due' | 'Paid' | 'Overdue';
    age?: number;
    heightCm?: number;
    targetWeightKg?: number;
    fitnessGoal?: string;
    emergencyContact?: string;
}

// Global server-side fallback member store
let globalMembersStore: MemberRecord[] = [
    {
        id: 'mem_kshitij',
        name: 'Kshitij Pilankar',
        phone: '919004884885',
        plan: 'Smart Athlete Pass',
        dueDate: '2026-11-20',
        streakDays: 14,
        status: 'Due',
        age: 26,
        heightCm: 178,
        targetWeightKg: 70,
        fitnessGoal: 'Hypertrophy & Lean Bulk',
        emergencyContact: '+91 9087799948 (Sneha)',
    },
    {
        id: 'mem_sneha',
        name: 'Sneha Pilankar',
        phone: '919087799948',
        plan: 'Smart Athlete Pass',
        dueDate: '2026-11-28',
        streakDays: 20,
        status: 'Due',
    },
    {
        id: 'mem_sachin',
        name: 'Sachin Pilankar',
        phone: '919876543210',
        plan: 'Smart Athlete Pass',
        dueDate: '2026-11-05',
        streakDays: 18,
        status: 'Overdue',
    },
    {
        id: 'mem_aman',
        name: 'Aman Sharma',
        phone: '919876543211',
        plan: 'Standard Gym Plan',
        dueDate: '2026-11-04',
        streakDays: 24,
        status: 'Due',
    },
    {
        id: 'mem_patel',
        name: 'Sneha Patel',
        phone: '919876543213',
        plan: 'Smart Athlete Pass',
        dueDate: '2026-11-20',
        streakDays: 31,
        status: 'Paid',
    },
    {
        id: 'mem_vikram',
        name: 'Vikram Malhotra',
        phone: '919876543214',
        plan: 'Smart Athlete Pass',
        dueDate: '2026-10-28',
        streakDays: 9,
        status: 'Overdue',
    },
];

function getSupabaseClient(): SupabaseClient | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return null;
    }

    try {
        return createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
        });
    } catch (err) {
        console.warn('[Supabase Init Warning]: Could not initialize client, using memory store', err);
        return null;
    }
}

/**
 * Fetch all members with Supabase cloud query & graceful server-memory fallback
 */
export async function getMembersFromDb(): Promise<MemberRecord[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        return globalMembersStore;
    }

    try {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
            return globalMembersStore;
        }

        return data.map((row) => ({
            id: row.id,
            name: row.name,
            phone: row.phone,
            plan: row.plan,
            dueDate: row.due_date,
            streakDays: row.streak_days || 1,
            status: row.status as any,
            age: row.age,
            heightCm: row.height_cm,
            targetWeightKg: row.target_weight_kg,
            fitnessGoal: row.fitness_goal,
            emergencyContact: row.emergency_contact,
        }));
    } catch {
        return globalMembersStore;
    }
}

/**
 * Save or update member in Supabase with memory fallback
 */
export async function saveMemberToDb(member: MemberRecord): Promise<MemberRecord> {
    // 1. Update in-memory fallback
    const idx = globalMembersStore.findIndex(
        (m) => m.id === member.id || m.phone.replace(/[^0-9]/g, '') === member.phone.replace(/[^0-9]/g, '')
    );
    if (idx >= 0) {
        globalMembersStore[idx] = { ...globalMembersStore[idx], ...member };
    } else {
        globalMembersStore.unshift(member);
    }

    // 2. Try persisting to Supabase if configured
    const supabase = getSupabaseClient();
    if (!supabase) {
        return member;
    }

    try {
        const payload = {
            id: member.id,
            name: member.name,
            phone: member.phone,
            plan: member.plan,
            due_date: member.dueDate,
            streak_days: member.streakDays || 1,
            status: member.status,
            age: member.age || null,
            height_cm: member.heightCm || null,
            target_weight_kg: member.targetWeightKg || null,
            fitness_goal: member.fitnessGoal || null,
            emergency_contact: member.emergencyContact || null,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('members')
            .upsert(payload, { onConflict: 'phone' });

        if (error) {
            console.warn('[Supabase Upsert Member Warning]:', error.message);
        }
    } catch (err) {
        console.warn('[Supabase Save Error]:', err);
    }

    return member;
}

/**
 * Delete a member from DB
 */
export async function deleteMemberFromDb(id: string): Promise<boolean> {
    globalMembersStore = globalMembersStore.filter((m) => m.id !== id);

    const supabase = getSupabaseClient();
    if (!supabase) return true;

    try {
        await supabase.from('members').delete().eq('id', id);
        return true;
    } catch {
        return true;
    }
}

/**
 * Fetch all payment transactions
 */
export async function getPaymentsFromDb(): Promise<PaymentTransaction[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        return getPayments();
    }

    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
            return getPayments();
        }

        return data.map((row) => ({
            id: row.id,
            paymentId: row.payment_id,
            orderId: row.order_id,
            amount: Number(row.amount),
            planName: row.plan_name,
            memberPhone: row.member_phone,
            memberName: row.member_name,
            date: row.date,
            time: row.time,
            status: row.status,
        }));
    } catch {
        return getPayments();
    }
}

/**
 * Save a payment to DB
 */
export async function savePaymentToDb(payment: PaymentTransaction): Promise<PaymentTransaction> {
    // Save to server-side memory
    addPayment(payment);

    const supabase = getSupabaseClient();
    if (!supabase) return payment;

    try {
        await supabase.from('payments').upsert({
            id: payment.id,
            payment_id: payment.paymentId,
            order_id: payment.orderId || '',
            amount: payment.amount,
            plan_name: payment.planName,
            member_phone: payment.memberPhone || '',
            member_name: payment.memberName || '',
            date: payment.date,
            time: payment.time,
            status: payment.status,
        }, { onConflict: 'payment_id' });
    } catch (err) {
        console.warn('[Supabase Payment Save Error]:', err);
    }

    return payment;
}
