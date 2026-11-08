# 🏋️ IronCore Fitness — Full-Stack Gym CRM & Athlete Performance Hub

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Meta WhatsApp Cloud API](https://img.shields.io/badge/Meta_Cloud_API-v20.0-25D366?style=for-the-badge&logo=whatsapp)](https://developers.facebook.com/docs/whatsapp/cloud-api)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Security Audited](https://img.shields.io/badge/Security-Hardened-00ff87?style=for-the-badge&logo=shield)](https://github.com/KshitijPilankar/ironcore-gym-platform)

> **IronCore Fitness** is an enterprise-grade, full-stack gym operating platform. It unifies an **Athlete Performance Portal** (gamified consistency streaks, 3D muscle heatmaps, and a 5,600+ movement biomechanics engine) with an **Automated WhatsApp CRM** for gym owners to drive recurring renewal collections and instant coach support.

---

## 🌐 Live Production Deployments

| Interface | Route | Direct Link |
|---|---|---|
| **Landing & Member Pass** | `/` | [ironcore-gym-platform.vercel.app](https://ironcore-gym-platform-git-main-kshitij-pilankars-projects.vercel.app/) |
| **Athlete Portal** | `/portal` | [Launch Athlete Hub](https://ironcore-gym-platform-git-main-kshitij-pilankars-projects.vercel.app/portal) |
| **Member WhatsApp OTP Login** | `/login` | [Member OTP Login](https://ironcore-gym-platform-git-main-kshitij-pilankars-projects.vercel.app/login) |
| **Gym Owner CRM Dashboard** | `/admin` | [Owner CRM](https://ironcore-gym-platform-git-main-kshitij-pilankars-projects.vercel.app/admin) |
| **Owner Clearance Login** | `/admin/login` | [Admin Portal Login](https://ironcore-gym-platform-git-main-kshitij-pilankars-projects.vercel.app/admin/login) |
| **5,600+ Exercise Engine** | `/portal/exercises` | [Explore Biomechanics](https://ironcore-gym-platform-git-main-kshitij-pilankars-projects.vercel.app/portal/exercises) |
| **3D Volume Load Heatmap** | `/portal/stats` | [View Muscle Stats](https://ironcore-gym-platform-git-main-kshitij-pilankars-projects.vercel.app/portal/stats) |

---

## ⚡ Core Architecture

```
                               ┌────────────────────────────────────────┐
                               │       Next.js 16 Edge Middleware       │
                               │   (HMAC-SHA256 Signed Session Gates)   │
                               └───────────────────┬────────────────────┘
                                                   │
                         ┌─────────────────────────┴────────────────────────┐
                         ▼                                                  ▼
      ┌────────────────────────────────────┐             ┌────────────────────────────────────┐
      │       ATHLETE PERFORMANCE HUB      │             │        GYM OWNER ADMIN CRM         │
      │              (/portal)             │             │              (/admin)              │
      ├────────────────────────────────────┤             ├────────────────────────────────────┤
      │ • Snapchat-Style Daily Streak      │             │ • Real-Time Renewal Table (Due/Paid│
      │ • 3D Muscle Anatomy Volume Heatmap │             │ • 1-Click WhatsApp Meta Reminder   │
      │ • 5,600+ Exercise Engine & Form    │             │ • Automatic WhatsApp Web Fallback  │
      │ • Interactive Set Rest Timers      │             │ • Bidirectional Live Member Chat   │
      │ • Morning Bodyweight Progress Log  │             │ • Athlete Retention Analytics      │
      └────────────────────────────────────┘             └────────────────────────────────────┘
                         │                                                  │
                         └─────────────────────────┬────────────────────────┘
                                                   ▼
                               ┌───────────────────────────────────────┐
                               │    Meta WhatsApp Cloud API Engine     │
                               │   (Phone ID: 1403885859474438)        │
                               │ • Rate-Limited Cryptographic OTPs     │
                               │ • Personalized Dynamic Billing Cues   │
                               └───────────────────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. Athlete Performance Portal (`/portal`)
* **Snapchat-Style Consistency Streaks:** Athletes log daily check-ins with an unbroken streak counter. Leaderboards incentivize retention with merchandise and supplement rewards.
* **Biometric Composition Tracking:** Interactive target physique slider and morning weigh-in log with historical delta computation.
* **3D Muscle Anatomy Volume Heatmap (`/portal/stats`):** Maps weekly training volume across 14 anatomical muscle groups, visually highlighting under-trained synergists and recovery states.
* **5,600+ openGym Biomechanics Engine (`/portal/exercises`):**
  * In-memory search and multi-tag filtering across muscle targets (Chest, Back, Delts, Quads, etc.) and equipment modalities (Barbell, Dumbbell, Cable, Machine, Calisthenics).
  * High-res media streaming with global edge CDN acceleration.
  * **Progressive 2-Step Fallback:** URL-encoded media paths with instant fallback to looped modal animations, backed by a high-tech animated SVG anatomical radar when offline.
  * **Interactive Cues & Timers:** 3-step biomechanical form cues tailored to each muscle group and built-in interactive 30s/60s/90s rest interval timers.
* **Coach & Front-Desk Support Drawer:** Persistent slide-up encrypted chat drawer with instant 1-click WhatsApp escalation.

### 2. Gym Owner CRM Dashboard (`/admin`)
* **Live Renewal Management:** Tracks member subscription tiers (Smart Pass, Standard, Annual) with dynamic status indicators (`Due`, `Paid`, `Overdue`).
* **1-Click WhatsApp Billing Engine (`/api/whatsapp/send-reminder`):**
  * Dispatches personalized billing alerts with member name, plan, due date, streak count, and renewal amount via Meta Cloud API.
  * **Automatic Sandbox Fallback:** Automatically intercepts sandbox limitation errors (`#131030`) and seamlessly launches WhatsApp Web with pre-filled message templates.
* **Live WhatsApp CRM Chat (`/admin/chat`):** Full-screen roster with unread badges, message timestamps, active 24-hour Meta window countdown, and preset rapid-response chips.

---

## 🔒 Security & Hardening Architecture

Following a comprehensive Cloudflare-grade security audit, IronCore implements defense-in-depth protections:

| Security Domain | Implementation Details |
|---|---|
| **Zero Exposed Secrets** | All Meta WhatsApp tokens (`WHATSAPP_ACCESS_TOKEN`) and phone IDs are strictly server-side environment variables. No credentials exist in client bundles or public repositories. |
| **Server-Side OTP Engine** | Client-side generation and backdoor codes (`"1234"`) are completely eliminated. OTPs are generated on the server via `crypto.randomInt(1000, 10000)` with a strict 5-minute TTL. |
| **Timing-Attack Resistance** | OTP validation and admin password comparisons use constant-time byte buffers via `crypto.timingSafeEqual`. |
| **Sliding-Window Rate Limiting** | OTP dispatch endpoints are rate-limited to a maximum of 5 requests per 10 minutes per phone number. |
| **Edge Middleware Gates** | Next.js Edge Middleware (`src/middleware.ts`) verifies HMAC-SHA256 signed session cookies before granting access to `/admin/*` or `/portal/*`. |
| **Input Sanitization** | Phone numbers enforce strict Indian mobile format validation (`/^[6-9]\d{9}$/`). String inputs are stripped of control characters to prevent message injection. |

---

## 🛠️ Technology Stack

* **Framework:** [Next.js 16.4.3](https://nextjs.org/) (App Router, Server Actions, Edge Middleware)
* **Language:** [TypeScript 5.x](https://www.typescriptlang.org/) (Strict mode, zero emit errors)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Neo-brutalist dark palette `#0e0e10`, Emerald `#00ff87`, Amber `#f59e0b`)
* **Messaging:** [Meta WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) (Graph API v20.0/v22.0)
* **Exercise Catalogue:** [openGym Dataset](https://github.com/DuarteSantos8/openGym) (5,632 validated biomechanical movement routines)
* **Hosting & CDN:** [Vercel](https://vercel.com/) with jsDelivr Edge CDN asset streaming

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory for local development or configure these variables in the **Vercel Project Settings**:

```bash
# ==============================================================================
# Meta WhatsApp Cloud API Credentials
# ==============================================================================
WHATSAPP_PHONE_NUMBER_ID=1403885859474438
WHATSAPP_ACCESS_TOKEN=your_meta_system_user_or_temporary_access_token

# ==============================================================================
# Gym Owner / Desk Administration Credentials
# ==============================================================================
ADMIN_EMAIL=admin@ironcore.fit
ADMIN_PASSWORD=your_secure_admin_master_password

# ==============================================================================
# Cryptographic Session Signature Secret
# ==============================================================================
SESSION_SECRET=your_high_entropy_random_32_byte_secret_string
```

---

## 📦 Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KshitijPilankar/ironcore-gym-platform.git
   cd ironcore-gym-platform
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Meta WhatsApp credentials
   ```

4. **Verify TypeScript compilation:**
   ```bash
   npx tsc --noEmit
   ```

5. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

6. **Create a production build:**
   ```bash
   npm run build
   # or with Webpack:
   npx next build --webpack
   ```

---

## 📂 Project Directory Structure

```
client-portal/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Landing Page & Pass Showcase
│   │   ├── layout.tsx                    # Root Layout with Font Optimization
│   │   ├── login/page.tsx                # Member 2-Step WhatsApp OTP Login
│   │   ├── admin/
│   │   │   ├── page.tsx                  # Owner CRM Table & 1-Click Reminder
│   │   │   ├── chat/page.tsx             # Live WhatsApp Roster Chat
│   │   │   └── login/page.tsx            # Protected Admin Clearance Login
│   │   ├── portal/
│   │   │   ├── page.tsx                  # Athlete Performance Dashboard & Streak
│   │   │   ├── exercises/page.tsx        # 5,600+ Exercise Engine & Form Cues
│   │   │   ├── history/page.tsx          # Workout Logs & PDF Export
│   │   │   ├── stats/page.tsx            # 3D Anatomical Volume Load Heatmap
│   │   │   └── support/page.tsx          # Full-Screen Coach Support Thread
│   │   └── api/
│   │       ├── admin/login/route.ts      # Constant-Time Admin Authentication
│   │       ├── auth/send-otp/route.ts    # Secure Server-Side OTP Dispatch
│   │       ├── auth/verify-otp/route.ts  # Timing-Safe OTP Verification & Cookie
│   │       ├── media/[type]/[filename]/  # CDN Media Streamer with 307 Redirect
│   │       └── whatsapp/send-reminder/   # Authenticated Renewal Alert Dispatch
│   ├── lib/
│   │   ├── auth-store.ts                 # In-Memory OTP Store & Sliding Rate Limiter
│   │   └── exercises-data.js             # 5,632 Exercise Biomechanics Dataset
│   ├── gymConfig.ts                      # Gym Metadata (Phone, Brand, Plans)
│   └── middleware.ts                     # Edge Session Gates (/admin, /portal)
├── .env.local                            # Local Secrets (Ignored by Git)
├── next.config.ts                        # Next.js Build & Image Optimizations
└── package.json                          # Dependencies & NPM Scripts
```

---

## 📄 License & Attribution

* **Software:** Licensed under the [MIT License](LICENSE).
* **Exercise Media:** Biomechanical animations and stills are powered by openGym catalogue assets and are governed by their respective licenses.

---

<p align="center">
  <b>IronCore Fitness</b> • Engineered for Maximum Human Performance & Seamless Gym Operations.
</p>
