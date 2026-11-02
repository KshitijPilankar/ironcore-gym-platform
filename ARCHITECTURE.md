# IronCore Fitness & openGym Platform - System Architecture

## 1. System Vision & Overview
IronCore Fitness ek high-performance, full-stack gym management platform hai jo do core systems ko integrate karta hai:
1. **Gym Admin CRM & Automated WhatsApp Billing:** Gym owners ke liye subscription renewals track karna, automated dynamic WhatsApp reminders bhejna, aur membership health monitor karna.
2. **Member Athlete Portal (Powered by openGym Engine):** Gym members ke liye daily check-ins, weight logging, streak engine, aur 3D interactive muscle volume heatmap[cite: 36, 38, 41].

---

## 2. Tech Stack & Environment Boundaries

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) | Server and Client rendering, API handlers |
| **Styling** | Tailwind CSS + Lucide Icons | Dark-mode neo-brutalist athlete UI (`#0e0e10`, `#00ff87`) |
| **Messaging Gateway** | Meta WhatsApp Cloud API (v22.0) | Official direct cloud messaging (Zero Puppeteer overhead) |
| **Persistence (MVP)** | Browser `localStorage` + In-Memory Fallback | Client-side zero-downtime offline persistence |
| **Production DB (Planned)** | Supabase (PostgreSQL) | Multi-tenant gym schema with Row-Level Security |

---

## 3. Application Route Hierarchy

```text
client-portal/src/app/
├── (marketing)
│   └── page.tsx                     # Public Landing Page (Pricing, Features, CTAs)
├── admin/
│   └── page.tsx                     # Gym Owner Dashboard (Renewals, Members CRM, WhatsApp Dispatcher)
├── portal/
│   ├── page.tsx                     # Member Hub (Daily Check-in, Streak Banner, Weight Goal Logger)
│   ├── stats/
│   │   └── page.tsx                 # openGym Muscle Heatmap (Front/Back Vector Volume Tracker)
│   └── exercises/
│       └── page.tsx                 # Structural Balance & Exercise Library Drawer
└── api/
    └── send-reminder/
        └── route.ts                 # Meta WhatsApp Cloud API POST Handler (Serverless Endpoint)
        