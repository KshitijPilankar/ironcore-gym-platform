-- IronCore Fitness Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY DEFAULT 'mem_' || replace(uuid_generate_v4()::text, '-', ''),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'Standard Gym Plan',
    due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    streak_days INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'Due' CHECK (status IN ('Paid', 'Due', 'Overdue')),
    age INTEGER,
    height_cm NUMERIC(5, 1),
    target_weight_kg NUMERIC(5, 1) DEFAULT 70.0,
    fitness_goal TEXT DEFAULT 'Hypertrophy & Strength',
    emergency_contact TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for phone lookups
CREATE INDEX IF NOT EXISTS idx_members_phone ON public.members (phone);

-- 3. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY DEFAULT 'pay_' || replace(uuid_generate_v4()::text, '-', ''),
    payment_id TEXT NOT NULL UNIQUE,
    order_id TEXT DEFAULT '',
    amount NUMERIC(10, 2) NOT NULL,
    plan_name TEXT NOT NULL,
    member_phone TEXT,
    member_name TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Captured',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for payment lookups by member
CREATE INDEX IF NOT EXISTS idx_payments_member_phone ON public.payments (member_phone);

-- 4. Workouts & Sets Table
CREATE TABLE IF NOT EXISTS public.workouts (
    id TEXT PRIMARY KEY DEFAULT 'wkt_' || replace(uuid_generate_v4()::text, '-', ''),
    member_phone TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    exercise_name TEXT NOT NULL,
    muscle_group TEXT DEFAULT 'Full Body',
    sets JSONB DEFAULT '[]'::jsonb,
    total_volume_kg NUMERIC(10, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workouts_member_phone ON public.workouts (member_phone);

-- 5. Row Level Security (RLS) Setup
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Allow read/write access for service role and public API (guarded by Next.js server)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access policy members" ON public.members;
    CREATE POLICY "Public access policy members" ON public.members FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access policy payments" ON public.payments;
    CREATE POLICY "Public access policy payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access policy workouts" ON public.workouts;
    CREATE POLICY "Public access policy workouts" ON public.workouts FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 6. Seed Default Members for Demo
INSERT INTO public.members (id, name, phone, plan, due_date, streak_days, status, target_weight_kg)
VALUES
    ('mem_kshitij', 'Kshitij Pilankar', '919004884885', 'Smart Athlete Pass', CURRENT_DATE + INTERVAL '25 days', 14, 'Paid', 70.0),
    ('mem_sneha', 'Sneha Pilankar', '919087799948', 'Smart Athlete Pass', CURRENT_DATE + INTERVAL '12 days', 20, 'Due', 62.0),
    ('mem_sachin', 'Sachin Pilankar', '919876543210', 'Smart Athlete Pass', CURRENT_DATE - INTERVAL '3 days', 18, 'Overdue', 75.0),
    ('mem_aman', 'Aman Sharma', '919876543211', 'Standard Gym Plan', CURRENT_DATE + INTERVAL '10 days', 24, 'Due', 68.0),
    ('mem_rohan', 'Rohan Verma', '919876543212', 'Standard Gym Plan', CURRENT_DATE - INTERVAL '1 day', 14, 'Overdue', 80.0),
    ('mem_patel', 'Sneha Patel', '919876543213', 'Smart Athlete Pass', CURRENT_DATE + INTERVAL '18 days', 31, 'Paid', 58.0),
    ('mem_vikram', 'Vikram Malhotra', '919876543214', 'Smart Athlete Pass', CURRENT_DATE - INTERVAL '7 days', 9, 'Overdue', 85.0)
ON CONFLICT (phone) DO UPDATE 
SET plan = EXCLUDED.plan, status = EXCLUDED.status, updated_at = NOW();
