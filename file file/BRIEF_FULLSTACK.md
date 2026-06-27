# Gawe — End-to-End Technical Brief
> Brief lengkap untuk membangun Gawe sebagai full-fledged platform freelance & cashflow.
> Dokumen ini berisi semua keputusan teknis, arsitektur, page structure, dashboard, payment flow, dan operasional yang dibutuhkan untuk ship MVP ke production.

**Version:** 1.0
**Stack:** Next.js (App Router) + Node.js/Express + PostgreSQL + Midtrans
**Date:** Mei 2026
**Status:** Pre-development — siap di-build

---

## Daftar Isi

1. [Vision & Business Context](#1-vision--business-context)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Tech Stack & Architecture](#3-tech-stack--architecture)
4. [Database Schema](#4-database-schema)
5. [Page Inventory — Semua Halaman](#5-page-inventory)
6. [Dashboard Specs per Role](#6-dashboard-specs)
7. [Payment & Escrow Flow](#7-payment--escrow-flow)
8. [Trust Score System](#8-trust-score-system)
9. [API Endpoints](#9-api-endpoints)
10. [Security & Compliance](#10-security--compliance)
11. [Admin Operations](#11-admin-operations)
12. [Notification System](#12-notification-system)
13. [File Storage & Media](#13-file-storage--media)
14. [Deployment & Infrastructure](#14-deployment--infrastructure)
15. [Development Phases](#15-development-phases)
16. [Definition of Done](#16-definition-of-done)

---

## 1. Vision & Business Context

### Produk
Gawe adalah platform freelance dua sisi dengan tiga value pillars:
1. **Trust from Zero** — sistem reputasi yang membuat pemula bisa membuktikan kemampuan tanpa portofolio
2. **Micro-project Marketplace** — proyek kecil (Rp 100rb–5jt) yang dikurasi untuk membangun reputasi
3. **Cashflow Clarity** — financial tools yang membantu freelancer pantau pendapatan

### Business Model
- **Komisi 10%** per proyek selesai (otomatis dipotong saat dana cair ke freelancer)
- Komisi turun bertahap berdasarkan jumlah proyek selesai (loyalty incentive)
- Gratis untuk daftar, post proyek, dan apply proyek

### Stakeholders
- **Freelancer** — orang yang menjual jasa (sisi penyedia)
- **Klien** — UMKM/individu yang post proyek (sisi pembeli)
- **Admin** — tim Gawe yang mengelola platform, mediasi, dan keuangan
- **Super Admin** — founder/owner dengan akses penuh

### Success Metrics (untuk validasi MVP)
- Time-to-first-project: median freelancer baru dapat proyek pertama dalam &lt;14 jam
- Project completion rate: ≥85% proyek aktif selesai sukses
- Repeat rate: ≥40% klien post proyek kedua dalam 30 hari
- Cashflow tool DAU: ≥60% freelancer aktif buka dashboard cashflow ≥2×/minggu

---

## 2. User Roles & Permissions

### Role Hierarchy
```
┌─────────────────────────────────────────┐
│ SUPER_ADMIN                             │  Full system access, billing, role mgmt
├─────────────────────────────────────────┤
│ ADMIN                                   │  User management, dispute, content moderation
├─────────────────────────────────────────┤
│ FINANCE_ADMIN                           │  Disbursement, refund, financial reports
├─────────────────────────────────────────┤
│ SUPPORT_ADMIN                           │  Customer support, ticket handling
├─────────────────────────────────────────┤
│ FREELANCER                              │  Standard freelancer account
│ CLIENT                                  │  Standard client account
│ FREELANCER + CLIENT (hybrid)            │  Same user, dual capability
└─────────────────────────────────────────┘
```

### Permission Matrix

| Capability                          | Freelancer | Client | Support | Finance | Admin | Super Admin |
|-------------------------------------|:----------:|:------:|:-------:|:-------:|:-----:|:-----------:|
| Apply ke proyek                     | ✓          |        |         |         |       |             |
| Post proyek                         |            | ✓      |         |         |       |             |
| Lihat profil sendiri                | ✓          | ✓      | ✓       | ✓       | ✓     | ✓           |
| Lihat dashboard cashflow            | ✓          |        |         |         |       |             |
| Generate invoice                    | ✓          |        |         |         |       |             |
| Lihat semua user                    |            |        | ✓ (read) | ✓ (read) | ✓     | ✓           |
| Suspend user                        |            |        |         |         | ✓     | ✓           |
| Mediasi dispute                     |            |        | ✓       |         | ✓     | ✓           |
| Approve disbursement &gt;Rp 5jt        |            |        |         | ✓       |       | ✓           |
| Approve disbursement &gt;Rp 50jt       |            |        |         |         |       | ✓           |
| Lihat laporan keuangan              |            |        |         | ✓       | ✓     | ✓           |
| Manage komisi platform              |            |        |         |         |       | ✓           |
| Manage admin roles                  |            |        |         |         |       | ✓           |

### Account Verification Levels
- **Level 0 — Unverified**: Email verified only. Bisa browse, tidak bisa transaksi.
- **Level 1 — Phone Verified**: OTP via SMS. Bisa apply proyek micro (&lt;Rp 500rb).
- **Level 2 — KYC Verified**: KTP + selfie verification. Bisa semua transaksi.
- **Level 3 — Business Verified**: NPWP + dokumen bisnis. Untuk klien UMKM resmi, dapat invoice resmi.

---

## 3. Tech Stack & Architecture

### Frontend
```
Framework      : Next.js 15+ (App Router)
Language       : TypeScript (strict mode)
Styling        : Tailwind CSS + shadcn/ui components
State          : Zustand (client state) + TanStack Query (server state)
Forms          : React Hook Form + Zod validation
Charts         : Recharts (cashflow charts)
Date utils     : date-fns
Icons          : Lucide React
i18n           : next-intl (Bahasa Indonesia primary, English secondary)
```

### Backend
```
Runtime        : Node.js 20 LTS
Framework      : Express.js 4.x atau Fastify (lebih cepat, optional)
Language       : TypeScript (strict mode)
ORM            : Prisma (type-safe, migrations built-in)
Database       : PostgreSQL 16
Cache          : Redis (sessions, rate limiting, queue)
Queue          : BullMQ (background jobs: email, disbursement, notifications)
Auth           : JWT (access + refresh tokens) + httpOnly cookies
Validation     : Zod (shared between frontend + backend via tRPC optional)
File storage   : AWS S3 atau Cloudflare R2 (cheaper)
```

### External Services
```
Payment        : Midtrans (Core API + Snap)
                 - Snap for client checkout
                 - Core API for VA + escrow logic
                 - Disbursement via Iris (Midtrans payout)
Email          : Resend atau Postmark
SMS / OTP      : Twilio Verify atau Vonage
KYC            : Privy.id atau Verihubs (Indonesia-focused)
Analytics      : PostHog (self-hosted optional) + Plausible
Error tracking : Sentry
Logging        : Pino + Datadog (atau self-hosted: Grafana Loki)
```

### Infrastructure
```
Frontend host   : Vercel (Next.js native)
Backend host    : Railway / Render / AWS ECS (Docker)
Database        : Supabase Postgres atau Neon (managed PG with branching)
Redis           : Upstash (serverless Redis)
CDN             : Cloudflare (DNS, CDN, DDoS protection)
Domain          : gawe.id (utama), api.gawe.id (backend), admin.gawe.id (admin)
```

### Architecture Diagram
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Browser       │     │   Mobile (PWA)  │     │  Admin Panel    │
│   gawe.id       │     │   gawe.id       │     │  admin.gawe.id  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                        │
         └───────────────┬───────┴────────────────────────┘
                         │
                  ┌──────▼──────┐
                  │  Cloudflare │  DNS, CDN, WAF
                  └──────┬──────┘
                         │
                  ┌──────▼──────────────────┐
                  │  Next.js Frontend       │
                  │  (Vercel)               │
                  │  - SSR/SSG/ISR          │
                  │  - API Routes (lightweight)│
                  └──────┬──────────────────┘
                         │
                  ┌──────▼──────────────────┐
                  │  Express Backend API    │
                  │  (Railway/Render)       │
                  │  api.gawe.id            │
                  └─┬────┬────┬────┬────┬───┘
                    │    │    │    │    │
        ┌───────────┘    │    │    │    └────────────┐
        │                │    │    │                 │
┌───────▼──────┐  ┌──────▼─┐ ┌▼─────────┐  ┌─────────▼────┐
│ PostgreSQL   │  │ Redis  │ │ S3/R2    │  │ External APIs│
│ (Supabase)   │  │ Upstash│ │ (files)  │  │ Midtrans/    │
│              │  │        │ │          │  │ Verihubs/    │
│              │  │        │ │          │  │ Resend/Twilio│
└──────────────┘  └────────┘ └──────────┘  └──────────────┘
```

### Project Structure (Monorepo)
```
gawe/
├── apps/
│   ├── web/              # Next.js frontend (public site + freelancer/client app)
│   │   ├── app/
│   │   │   ├── (marketing)/    # Landing, pricing, blog
│   │   │   ├── (auth)/         # Login, register, OTP
│   │   │   ├── (freelancer)/   # Freelancer dashboard + pages
│   │   │   ├── (client)/       # Client dashboard + pages
│   │   │   └── api/            # Next.js API routes (BFF pattern)
│   │   └── components/
│   ├── admin/            # Admin panel (separate Next.js app)
│   │   └── app/
│   └── api/              # Express backend
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── middlewares/
│       │   ├── jobs/         # Background workers
│       │   ├── webhooks/     # Midtrans, etc
│       │   └── utils/
│       └── prisma/
│           └── schema.prisma
├── packages/
│   ├── ui/               # Shared component library
│   ├── types/            # Shared TypeScript types
│   ├── config/           # Shared config (ESLint, TS, Tailwind)
│   └── db/               # Prisma client (shared)
└── docker-compose.yml    # Local dev: PG, Redis
```

---

## 4. Database Schema

### Core Entities (Prisma schema)

```prisma
// User & Auth
model User {
  id              String        @id @default(cuid())
  email           String        @unique
  emailVerified   DateTime?
  phone           String?       @unique
  phoneVerified   DateTime?
  passwordHash    String?
  fullName        String
  avatarUrl       String?
  bio             String?       @db.Text
  city            String?
  province        String?

  // Role & verification
  roles           UserRole[]
  verificationLevel Int         @default(0)
  kycStatus       KycStatus     @default(NOT_SUBMITTED)
  kycSubmittedAt  DateTime?
  kycApprovedAt   DateTime?
  ktpUrl          String?       // S3 URL, encrypted
  selfieUrl       String?
  npwpNumber      String?
  npwpUrl         String?

  // Status
  status          UserStatus    @default(ACTIVE)
  suspendedAt     DateTime?
  suspendedReason String?
  deletedAt       DateTime?

  // Relations
  freelancerProfile FreelancerProfile?
  clientProfile     ClientProfile?
  ownedProjects     Project[]    @relation("ClientProjects")
  applications      Application[]
  reviewsGiven      Review[]     @relation("Reviewer")
  reviewsReceived   Review[]     @relation("Reviewee")
  messages          Message[]
  notifications     Notification[]
  transactions      Transaction[]
  bankAccounts      BankAccount[]

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum UserRole { FREELANCER  CLIENT  SUPPORT_ADMIN  FINANCE_ADMIN  ADMIN  SUPER_ADMIN }
enum UserStatus { ACTIVE  SUSPENDED  BANNED  DELETED }
enum KycStatus { NOT_SUBMITTED  PENDING  APPROVED  REJECTED }

model FreelancerProfile {
  id                String    @id @default(cuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id])

  headline          String    // "Desainer UI/UX untuk UMKM"
  skills            String[]  // ["UI Design", "Figma", "Illustration"]
  hourlyRate        Int?      // dalam Rupiah
  availability      Availability @default(PART_TIME)
  yearsOfExperience Int       @default(0)

  // Trust & reputation
  trustScore        Int       @default(0)  // 0–100
  skillTestsPassed  Json      @default("[]")  // [{category, score, takenAt}]
  badges            String[]  // ["new", "verified", "rising_star"]

  // Stats
  projectsCompleted Int       @default(0)
  projectsCancelled Int       @default(0)
  totalEarnings     Int       @default(0)  // dalam Rupiah, lifetime
  averageRating     Float     @default(0)
  responseTimeHours Float?    // average response to messages

  // Portfolio
  portfolioItems    PortfolioItem[]

  // Settings
  acceptingNewProjects Boolean @default(true)
  minProjectBudget   Int?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum Availability { FULL_TIME  PART_TIME  WEEKENDS_ONLY }

model PortfolioItem {
  id              String    @id @default(cuid())
  profileId       String
  profile         FreelancerProfile @relation(fields: [profileId], references: [id])
  title           String
  description     String    @db.Text
  category        String
  thumbnailUrl    String
  imageUrls       String[]
  projectUrl      String?   // external link if any
  isFromGawe      Boolean   @default(false)  // auto-generated from completed projects
  linkedProjectId String?   // if isFromGawe
  createdAt       DateTime  @default(now())
}

model ClientProfile {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])

  companyName   String?
  companyType   CompanyType @default(INDIVIDUAL)
  industry      String?
  website       String?

  // Stats
  projectsPosted    Int   @default(0)
  projectsCompleted Int   @default(0)
  totalSpent        Int   @default(0)
  averageRating     Float @default(0)  // rating yang diberikan klien dari freelancer

  // Trust signals for freelancers
  paymentReliability Float @default(0)  // % proyek yang dibayar tepat waktu
  isPremium         Boolean @default(false)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum CompanyType { INDIVIDUAL  UMKM  PT  CV  STARTUP }

// ── Projects ─────────────────────────────────────────────────────────
model Project {
  id              String        @id @default(cuid())
  slug            String        @unique
  clientId        String
  client          User          @relation("ClientProjects", fields: [clientId], references: [id])

  title           String
  description     String        @db.Text
  category        String
  subcategory     String?
  skillsRequired  String[]

  // Budget & timeline
  budgetMin       Int           // Rupiah
  budgetMax       Int
  budgetType      BudgetType    @default(FIXED)
  estimatedDays   Int

  // Status
  status          ProjectStatus @default(DRAFT)
  visibility      ProjectVisibility @default(PUBLIC)

  // Deliverables
  deliverables    Json          // [{description, format}]
  attachmentUrls  String[]

  // Engagement
  selectedFreelancerId String?
  selectedFreelancer   User?    @relation("SelectedFreelancer", fields: [selectedFreelancerId], references: [id])

  acceptedAt      DateTime?
  startedAt       DateTime?
  submittedAt     DateTime?
  completedAt     DateTime?
  cancelledAt     DateTime?
  cancelledReason String?

  // Escrow
  escrowAmount    Int           @default(0)
  escrowStatus    EscrowStatus  @default(NOT_FUNDED)

  applications    Application[]
  milestones      Milestone[]
  reviews         Review[]
  messages        Message[]
  transactions    Transaction[]
  disputes        Dispute[]

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([clientId, status])
  @@index([status, createdAt])
  @@index([category, status])
}

enum BudgetType { FIXED  HOURLY }
enum ProjectStatus {
  DRAFT
  OPEN              // Menerima aplikasi
  IN_REVIEW         // Klien meninjau aplikasi
  AWARDED           // Sudah pilih freelancer, menunggu funding
  FUNDED            // Escrow terisi, siap mulai
  IN_PROGRESS       // Freelancer sedang kerja
  SUBMITTED         // Freelancer submit, menunggu approval klien
  REVISION          // Klien minta revisi
  COMPLETED         // Selesai sukses
  CANCELLED         // Dibatalkan
  DISPUTED          // Sedang dalam dispute
}
enum ProjectVisibility { PUBLIC  PRIVATE_INVITE }
enum EscrowStatus { NOT_FUNDED  FUNDED  PARTIAL_RELEASED  FULLY_RELEASED  REFUNDED }

model Application {
  id            String      @id @default(cuid())
  projectId     String
  project       Project     @relation(fields: [projectId], references: [id])
  freelancerId  String
  freelancer    User        @relation(fields: [freelancerId], references: [id])

  coverLetter   String      @db.Text
  proposedBudget Int
  proposedDays  Int

  status        ApplicationStatus @default(PENDING)
  withdrawnAt   DateTime?

  createdAt     DateTime    @default(now())

  @@unique([projectId, freelancerId])
  @@index([freelancerId, status])
}

enum ApplicationStatus { PENDING  ACCEPTED  REJECTED  WITHDRAWN }

model Milestone {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  title         String
  description   String    @db.Text
  amount        Int       // Rupiah
  dueDate       DateTime
  status        MilestoneStatus @default(PENDING)
  completedAt   DateTime?
  order         Int

  createdAt     DateTime  @default(now())
}

enum MilestoneStatus { PENDING  IN_PROGRESS  SUBMITTED  APPROVED  REJECTED }

// ── Messaging ─────────────────────────────────────────────────────────
model Conversation {
  id            String      @id @default(cuid())
  projectId     String?     // null untuk general inquiry
  project       Project?    @relation(fields: [projectId], references: [id])
  participants  ConversationParticipant[]
  messages      Message[]
  lastMessageAt DateTime    @default(now())
  createdAt     DateTime    @default(now())
}

model ConversationParticipant {
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  userId         String
  user           User        @relation(fields: [userId], references: [id])
  lastReadAt     DateTime    @default(now())
  unreadCount    Int         @default(0)

  @@id([conversationId, userId])
}

model Message {
  id              String    @id @default(cuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id])
  senderId        String
  sender          User      @relation(fields: [senderId], references: [id])
  content         String    @db.Text
  attachmentUrls  String[]
  readAt          DateTime?
  editedAt        DateTime?
  createdAt       DateTime  @default(now())

  @@index([conversationId, createdAt])
}

// ── Payments & Transactions ───────────────────────────────────────────
model Transaction {
  id                String      @id @default(cuid())
  type              TransactionType
  projectId         String?
  project           Project?    @relation(fields: [projectId], references: [id])
  userId            String      // The user this transaction belongs to
  user              User        @relation(fields: [userId], references: [id])

  amount            Int         // Rupiah, can be negative for outflows
  fee               Int         @default(0)  // Platform fee
  netAmount         Int         // amount - fee
  currency          String      @default("IDR")

  // Midtrans data
  midtransOrderId   String?     @unique
  midtransTransactionId String? @unique
  paymentMethod     String?     // "bank_transfer", "credit_card", "gopay", etc
  paymentChannel    String?     // "bca", "mandiri", etc

  status            TransactionStatus @default(PENDING)
  processedAt       DateTime?
  failedAt          DateTime?
  failedReason      String?

  description       String
  metadata          Json?

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  @@index([userId, type, status])
  @@index([projectId, type])
}

enum TransactionType {
  PROJECT_FUNDING       // Client deposits escrow
  PROJECT_PAYOUT        // Freelancer receives payment
  PLATFORM_FEE          // Gawe takes commission
  REFUND                // Client gets refund
  WITHDRAWAL            // Freelancer withdraws to bank
  TOP_UP                // (future) wallet top up
}
enum TransactionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}

model BankAccount {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  bankCode      String    // "bca", "mandiri", "bri", "bni"
  bankName      String
  accountNumber String
  accountHolder String
  isPrimary     Boolean   @default(false)
  isVerified    Boolean   @default(false)
  verifiedAt    DateTime?

  createdAt     DateTime  @default(now())

  @@unique([userId, bankCode, accountNumber])
}

model Wallet {
  id                String    @id @default(cuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id])
  availableBalance  Int       @default(0)  // Bisa di-withdraw
  pendingBalance    Int       @default(0)  // Masih di escrow / hold period
  totalEarned       Int       @default(0)  // Lifetime, untuk display
  lastUpdatedAt     DateTime  @default(now())
}

// ── Reviews ────────────────────────────────────────────────────────────
model Review {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  reviewerId    String    // Who wrote the review
  reviewer      User      @relation("Reviewer", fields: [reviewerId], references: [id])
  revieweeId    String    // Who is being reviewed
  reviewee      User      @relation("Reviewee", fields: [revieweeId], references: [id])

  rating        Int       // 1-5
  ratingCommunication Int?
  ratingQuality       Int?
  ratingProfessionalism Int?
  ratingTimeliness    Int?

  comment       String?   @db.Text
  isPublic      Boolean   @default(true)
  flaggedAt     DateTime?
  flaggedReason String?

  createdAt     DateTime  @default(now())

  @@unique([projectId, reviewerId])
}

// ── Disputes ───────────────────────────────────────────────────────────
model Dispute {
  id              String    @id @default(cuid())
  projectId       String
  project         Project   @relation(fields: [projectId], references: [id])
  raisedById      String
  reason          DisputeReason
  description     String    @db.Text
  evidenceUrls    String[]

  status          DisputeStatus @default(OPEN)
  assignedAdminId String?
  resolution      String?   @db.Text
  resolvedAt      DateTime?
  resolvedInFavorOf String? // userId (freelancer or client)

  refundAmount    Int       @default(0)
  payoutAmount    Int       @default(0)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum DisputeReason {
  WORK_NOT_DELIVERED
  WORK_QUALITY_POOR
  SCOPE_DISAGREEMENT
  COMMUNICATION_ISSUE
  PAYMENT_ISSUE
  OTHER
}
enum DisputeStatus { OPEN  UNDER_REVIEW  RESOLVED_FREELANCER  RESOLVED_CLIENT  RESOLVED_SPLIT  WITHDRAWN }

// ── Skill Tests ────────────────────────────────────────────────────────
model SkillTest {
  id              String    @id @default(cuid())
  category        String
  title           String
  description     String    @db.Text
  durationMinutes Int       @default(15)
  passingScore    Int       @default(70)
  questions       Json      // [{q, options, correct, explanation}]
  isActive        Boolean   @default(true)

  attempts        SkillTestAttempt[]
  createdAt       DateTime  @default(now())
}

model SkillTestAttempt {
  id              String    @id @default(cuid())
  userId          String
  testId          String
  test            SkillTest @relation(fields: [testId], references: [id])
  score           Int
  passed          Boolean
  answers         Json
  startedAt       DateTime  @default(now())
  completedAt     DateTime?

  @@index([userId, testId])
}

// ── Notifications ──────────────────────────────────────────────────────
model Notification {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  type          NotificationType
  title         String
  body          String
  actionUrl     String?
  metadata      Json?
  readAt        DateTime?
  createdAt     DateTime  @default(now())

  @@index([userId, readAt, createdAt])
}

enum NotificationType {
  PROJECT_NEW_APPLICATION
  PROJECT_APPLICATION_ACCEPTED
  PROJECT_APPLICATION_REJECTED
  PROJECT_FUNDED
  PROJECT_SUBMITTED
  PROJECT_REVISION_REQUESTED
  PROJECT_COMPLETED
  MESSAGE_RECEIVED
  PAYMENT_RECEIVED
  PAYMENT_RELEASED
  WITHDRAWAL_PROCESSED
  KYC_APPROVED
  KYC_REJECTED
  REVIEW_RECEIVED
  DISPUTE_OPENED
  DISPUTE_RESOLVED
  SYSTEM_ANNOUNCEMENT
}

// ── Audit Log (Admin actions) ──────────────────────────────────────────
model AuditLog {
  id            String    @id @default(cuid())
  actorId       String    // Admin user id
  action        String    // "user.suspend", "dispute.resolve", "disbursement.approve"
  targetType    String    // "User", "Project", "Transaction"
  targetId      String
  before        Json?
  after         Json?
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime  @default(now())

  @@index([actorId, createdAt])
  @@index([targetType, targetId])
}
```

### Indexing Strategy
Critical indexes (selain yang sudah di schema):
- `User.email`, `User.phone` — unique, sudah ada
- `Project.status + Project.category + Project.createdAt` composite — untuk feed listing
- `Application.freelancerId + Application.status` — untuk "proyek saya"
- `Transaction.userId + Transaction.type + Transaction.createdAt` — untuk cashflow query
- `Notification.userId + Notification.readAt` — untuk unread count

---

## 5. Page Inventory

### Public Pages (gawe.id/*)
| Path                          | Purpose                                          | Auth   |
|-------------------------------|--------------------------------------------------|:------:|
| `/`                           | Landing page                                     | Public |
| `/cara-kerja`                 | How it works detail                              | Public |
| `/fitur`                      | Features deep-dive                               | Public |
| `/harga`                      | Pricing & commission breakdown                   | Public |
| `/cerita-kami`                | About Gawe, founders, mission                    | Public |
| `/blog`                       | Blog listing                                     | Public |
| `/blog/[slug]`                | Blog post                                        | Public |
| `/proyek`                     | Browse all open projects (SEO)                   | Public |
| `/proyek/[slug]`              | Individual project detail                        | Public |
| `/freelancer`                 | Browse top freelancers (SEO)                     | Public |
| `/freelancer/[username]`      | Public freelancer profile                        | Public |
| `/kategori/[slug]`            | Project category landing                         | Public |
| `/syarat-ketentuan`           | T&amp;C                                              | Public |
| `/privasi`                    | Privacy policy                                   | Public |
| `/keamanan`                   | Security & trust info                            | Public |
| `/faq`                        | FAQ                                              | Public |
| `/hubungi-kami`               | Contact form                                     | Public |
| `/karir`                      | Careers at Gawe                                  | Public |

### Auth Pages (gawe.id/auth/*)
| Path                          | Purpose                                          |
|-------------------------------|--------------------------------------------------|
| `/auth/masuk`                 | Login (email + password, Google OAuth, magic link) |
| `/auth/daftar`                | Register — pilih role (freelancer/client/both)   |
| `/auth/daftar/freelancer`     | Freelancer onboarding wizard                     |
| `/auth/daftar/klien`          | Client onboarding wizard                         |
| `/auth/verifikasi-email`      | Email verification flow                          |
| `/auth/verifikasi-otp`        | Phone OTP verification                           |
| `/auth/lupa-password`         | Forgot password                                  |
| `/auth/reset-password`        | Reset password with token                        |
| `/auth/keluar`                | Logout (POST)                                    |

### Freelancer App (gawe.id/app/*)
| Path                                  | Purpose                                       |
|---------------------------------------|-----------------------------------------------|
| `/app/dasbor`                         | Freelancer main dashboard                     |
| `/app/jelajah`                        | Browse projects (smart matching)              |
| `/app/jelajah/[id]`                   | Project detail + apply                        |
| `/app/lamaran`                        | My applications (pending/accepted/rejected)   |
| `/app/proyek`                         | Active projects list                          |
| `/app/proyek/[id]`                    | Active project workspace                      |
| `/app/proyek/[id]/kirim-hasil`        | Submit deliverable form                       |
| `/app/proyek/[id]/dispute`            | Raise dispute                                 |
| `/app/pesan`                          | Inbox (conversations)                         |
| `/app/pesan/[id]`                     | Individual conversation                       |
| `/app/dompet`                         | Wallet — balance, withdraw, history           |
| `/app/dompet/tarik`                   | Withdrawal form                               |
| `/app/dompet/riwayat`                 | Transaction history                           |
| `/app/cashflow`                       | Cashflow dashboard (charts, projections)      |
| `/app/cashflow/invoice`               | Invoice list                                  |
| `/app/cashflow/invoice/[id]`          | Invoice detail / download PDF                 |
| `/app/profil`                         | Edit profile, portfolio, skills               |
| `/app/profil/skill-test`              | Available skill tests                         |
| `/app/profil/skill-test/[id]`         | Take a skill test                             |
| `/app/profil/verifikasi`              | KYC submission flow                           |
| `/app/profil/bank`                    | Manage bank accounts                          |
| `/app/pengaturan`                     | Settings (notifications, privacy, password)   |
| `/app/pengaturan/notifikasi`          | Notification preferences                      |
| `/app/pengaturan/keamanan`            | Security (2FA, sessions, password)            |
| `/app/bantuan`                        | Help center, contact support                  |

### Client App (gawe.id/klien/*)
| Path                                  | Purpose                                       |
|---------------------------------------|-----------------------------------------------|
| `/klien/dasbor`                       | Client main dashboard                         |
| `/klien/post-proyek`                  | Post new project wizard (multi-step)          |
| `/klien/proyek`                       | My posted projects                            |
| `/klien/proyek/[id]`                  | Project management                            |
| `/klien/proyek/[id]/lamaran`          | View applications, select freelancer          |
| `/klien/proyek/[id]/danai`            | Fund escrow (payment page)                    |
| `/klien/proyek/[id]/tinjau`           | Review submitted work, approve/revise        |
| `/klien/freelancer`                   | Browse freelancers (saved + recommendations)  |
| `/klien/freelancer/[username]`        | Freelancer profile + invite to project        |
| `/klien/pesan`                        | Inbox                                          |
| `/klien/transaksi`                    | Payment history                               |
| `/klien/profil`                       | Edit company profile                          |
| `/klien/profil/verifikasi-bisnis`     | Business verification (NPWP, dokumen)         |
| `/klien/pengaturan`                   | Settings                                      |

### Admin Panel (admin.gawe.id/*)
| Path                                  | Purpose                                       |
|---------------------------------------|-----------------------------------------------|
| `/`                                   | Admin dashboard — KPIs overview               |
| `/users`                              | User management table                         |
| `/users/[id]`                         | User detail, edit, suspend, view activity     |
| `/users/kyc-queue`                    | Pending KYC submissions                       |
| `/users/business-verification`        | Pending business verifications                |
| `/projects`                           | All projects (filter by status, flagged)      |
| `/projects/[id]`                      | Project detail with full audit trail          |
| `/projects/flagged`                   | Flagged/reported projects                     |
| `/transactions`                       | All transactions                              |
| `/transactions/disbursements`         | Disbursement queue (approval required)        |
| `/transactions/refunds`               | Refund queue                                  |
| `/disputes`                           | All disputes                                  |
| `/disputes/[id]`                      | Dispute workspace (evidence, mediation)      |
| `/reviews/flagged`                    | Reported reviews                              |
| `/finance/overview`                   | Financial dashboard                           |
| `/finance/reports`                    | Generate financial reports (monthly, quarterly)|
| `/finance/reconciliation`             | Reconcile Midtrans payouts vs internal ledger |
| `/skill-tests`                        | Manage skill tests                            |
| `/skill-tests/[id]`                   | Edit skill test questions                     |
| `/content/blog`                       | Manage blog posts                             |
| `/content/categories`                 | Manage project categories &amp; subcategories     |
| `/content/badges`                     | Manage user badges                            |
| `/notifications/broadcast`            | Send platform-wide announcements              |
| `/audit-log`                          | View admin action history                    |
| `/settings/platform`                  | Platform settings (commission, limits, etc)  |
| `/settings/admins`                    | Manage admin accounts &amp; roles                 |
| `/settings/api-keys`                  | External API credentials                     |

**Total: ~80 unique pages.**

---

## 6. Dashboard Specs

### Freelancer Dashboard (`/app/dasbor`)

**Layout:** 12-col grid. Hero strip on top, 3-column widget area below.

**Hero strip (full width):**
- Greeting: "Selamat siang, [Nama]" (time-based)
- Trust Score widget: big number 82/100, progress bar, "+8 dari bulan lalu"
- Quick stats inline: "3 proyek aktif · 12 lamaran terkirim · Rp 4,5jt bulan ini"

**Left column (8-col):**
- **Smart project matches** — 5 cards proyek yang cocok dengan skill &amp; trust score
- **Active projects timeline** — Gantt-style mini view dari proyek aktif (deadline, progress)
- **Recent activity feed** — chronological: aplikasi diterima, pesan baru, review masuk

**Right column (4-col):**
- **Wallet snapshot** — Available balance, pending balance, button "Tarik dana"
- **Cashflow mini chart** — bar chart 6 bulan terakhir
- **Action items** — "3 lamaran perlu follow-up", "Skill test baru tersedia"
- **Notifications** — unread top 5

### Freelancer Cashflow Dashboard (`/app/cashflow`)

**Top stats row (4 cards):**
1. **Pemasukan bulan ini** — Rp 3,250,000 (+12% vs last month)
2. **Proyek aktif** — 3 proyek senilai Rp 4,800,000
3. **Sedang ditahan** — Rp 1,200,000 (akan cair dalam 5 hari)
4. **Status** — "Aman" / "Waspada" / "Kritis" badge dengan color

**Main chart area:**
- Bar chart 12 bulan terakhir: pemasukan vs pengeluaran (jika ada categorization)
- Toggle: "By month" / "By project category"

**Projection panel (right side):**
- Line chart: proyeksi 30/60/90 hari ke depan berdasarkan proyek aktif &amp; pipeline
- "Bulan depan diperkirakan: Rp 2,800,000 ± Rp 400rb"
- Insight: "Kamu butuh ambil 2 proyek lagi untuk capai target Rp 5jt/bulan"

**Invoice section:**
- List of recent invoices (auto-generated post-project)
- Status: paid, pending, overdue
- Button "Generate invoice manual" (untuk klien di luar Gawe — future feature)

**Income breakdown:**
- Pie chart by category
- Top 5 highest-paying clients

### Client Dashboard (`/klien/dasbor`)

**Top section:**
- Active projects count + spend this month
- Big CTA: "Post Proyek Baru"

**Main widgets:**
- **Active projects list** — status, freelancer name, next milestone
- **Pending decisions** — proyek yang menunggu approval (review work)
- **Recommended freelancers** — based on past projects + browsing
- **Recent transactions** — payments, refunds

**Spend analytics:**
- Total spent this month/quarter/year
- Spend by category pie chart
- Average project value, average time-to-completion

### Admin Main Dashboard (`admin.gawe.id`)

**KPI cards (top row, 6 columns):**
1. **New signups (24h)** — number + sparkline
2. **Active users (7d DAU)** — number + sparkline
3. **GMV today** — Total project value transacted
4. **Revenue today** — Platform commission
5. **Open disputes** — number, click → dispute queue
6. **KYC pending** — number, click → KYC queue

**Mid section (2 columns):**
- **GMV chart** — last 30/90 days, can switch granularity
- **Top activities feed** — high-value transactions, suspended users, refunds processed

**Bottom row — operational queues:**
- Disbursement queue (need approval)
- Refund queue
- Flagged content queue
- Support tickets queue

### Finance Admin Dashboard (`/admin/finance/overview`)

**Top metrics:**
- Total in escrow (across all funded projects)
- Total disbursed this month
- Total commission earned this month
- Pending reconciliation discrepancies

**Tables:**
- Disbursement queue (sortable by amount, age)
- Recent refunds
- Midtrans settlement vs internal ledger diff

**Reports section:**
- Generate monthly P&amp;L
- Tax report (PPh withholding from freelancer payouts)
- Export to CSV/Excel

---

## 7. Payment & Escrow Flow

### Overview
Full escrow model: dana klien ditahan di rekening Gawe (Midtrans-held) sampai klien approve hasil kerja, baru cair ke freelancer.

### State Machine — Project + Payment
```
[DRAFT] → client publishes
   ↓
[OPEN] ← freelancers apply
   ↓ client selects freelancer
[AWARDED] ← awaiting client funding
   ↓ client funds via Midtrans
[FUNDED] ← escrow filled, work begins
   ↓
[IN_PROGRESS]
   ↓ freelancer submits
[SUBMITTED] ← awaiting client review
   ├─ client approves → [COMPLETED] → disbursement
   ├─ client requests revision → [REVISION] → back to IN_PROGRESS
   └─ dispute raised → [DISPUTED] → admin mediation
```

### Phase 1: Client Funds Escrow
```
1. Client navigates to /klien/proyek/[id]/danai
2. Frontend creates draft transaction:
   POST /api/transactions/create-escrow
   { projectId, amount, breakdown: { projectAmount, platformFee } }

3. Backend:
   a. Validates project status = AWARDED
   b. Calculates total: project_amount + (project_amount * 0.10 if client pays fee, or 0 if freelancer absorbs)
      [Decision: Gawe charges fee from freelancer side, so client pays exactly project_amount]
   c. Creates Transaction record (status=PENDING)
   d. Calls Midtrans Snap API to create transaction token
   e. Returns snap_token + redirect_url

4. Frontend opens Midtrans Snap modal (or redirect)

5. Client completes payment (VA, e-wallet, card, QRIS)

6. Midtrans sends webhook to /api/webhooks/midtrans
   POST /api/webhooks/midtrans
   Headers: Signature-Key
   Body: { order_id, transaction_status, fraud_status, ... }

7. Backend webhook handler:
   a. Verifies signature (HMAC SHA512 with server_key)
   b. Idempotency check (have we processed this order_id?)
   c. If status=settlement and fraud=accept:
      - Update Transaction.status = COMPLETED
      - Update Project.status = FUNDED
      - Update Project.escrowAmount += amount
      - Update Project.escrowStatus = FUNDED
      - Send notification to freelancer: "Project funded, you can start"
      - Send notification to client: "Payment received, project active"
   d. If status=expire or deny:
      - Update Transaction.status = FAILED
      - Notify client
```

### Phase 2: Work in Progress
- Freelancer logs work, uploads files, communicates
- No money movement during this phase

### Phase 3: Submission → Approval → Release
```
1. Freelancer clicks "Submit hasil"
   POST /api/projects/[id]/submit
   { deliverableUrls, notes }

2. Backend:
   a. Validates: project status = IN_PROGRESS, freelancer is assigned one
   b. Updates project status = SUBMITTED
   c. Sets submittedAt timestamp
   d. Creates auto-review reminder (cron: if client doesn't respond in 7 days, auto-approve)
   e. Notifies client

3. Client reviews deliverable
   - Option A: Approve
     POST /api/projects/[id]/approve
     → Triggers payout flow (see below)
   - Option B: Request revision
     POST /api/projects/[id]/revise
     { reason }
     → Updates status to REVISION, notifies freelancer
   - Option C: Open dispute
     POST /api/disputes
     { projectId, reason, description, evidence[] }
     → Status → DISPUTED, admin gets notified

4. On Approve — Disbursement flow:
   a. Update Project.status = COMPLETED
   b. Update Project.completedAt
   c. Calculate amounts:
      - escrow_amount = X
      - platform_fee = X * 0.10
      - freelancer_payout = X - platform_fee
   d. Create transactions:
      - Transaction(type=PLATFORM_FEE, amount=fee, user=null/system)
      - Transaction(type=PROJECT_PAYOUT, amount=payout, userId=freelancer)
   e. Update Wallet.pendingBalance += payout (hold period 24h)
   f. Schedule background job: ReleaseToAvailableBalance (in 24h)
   g. After hold period:
      - Move from pendingBalance to availableBalance
      - Send notification: "Bayaran sudah cair ke wallet"
```

### Phase 4: Withdrawal
```
1. Freelancer clicks "Tarik dana" in wallet
   POST /api/wallet/withdraw
   { amount, bankAccountId }

2. Backend:
   a. Validates: amount <= availableBalance, bank account verified, KYC level >= 2
   b. Validates: amount >= 50,000 (minimum withdrawal)
   c. Calculates withdrawal fee (Rp 4,000 per transaksi, similar to Indo bank fees)
   d. Creates Transaction(type=WITHDRAWAL, status=PENDING)
   e. Decrements availableBalance immediately (prevent double-spend)
   f. Adds to disbursement queue

3. Disbursement processing:
   - If amount <= Rp 5,000,000: auto-process via Midtrans Iris API
   - If amount > Rp 5,000,000: require Finance Admin approval first
   - If amount > Rp 50,000,000: require Super Admin approval

4. Midtrans Iris webhook callback:
   - On success: Transaction.status = COMPLETED, send notification
   - On failure: refund to availableBalance, notify user, log incident

5. Daily reconciliation job (cron):
   - Compare Midtrans Iris transaction log with internal ledger
   - Flag discrepancies for finance admin review
```

### Refund Scenarios
- **Client cancels before project starts (IN_PROGRESS):** full refund minus Midtrans processing fee
- **Mutual cancellation mid-project:** split per agreement, requires admin approval
- **Dispute resolved in client's favor:** full or partial refund based on admin decision
- **Dispute resolved in freelancer's favor:** disburse to freelancer minus fee

### Midtrans Integration Specifics
```typescript
// Environment variables needed
MIDTRANS_SERVER_KEY=         // Backend only, never expose
MIDTRANS_CLIENT_KEY=         // Frontend safe
MIDTRANS_IS_PRODUCTION=      // true | false
MIDTRANS_IRIS_API_KEY=       // For disbursement

// Configuration
- Use Snap for client payments (best UX, supports VA, GoPay, OVO, Dana, ShopeePay, QRIS, cards)
- Enable fraud detection (FDS) — auto-decline high-risk transactions
- Set transaction expiry to 24 hours
- Webhook URL: https://api.gawe.id/api/webhooks/midtrans
- Disbursement webhook: https://api.gawe.id/api/webhooks/midtrans-iris
```

### Idempotency &amp; Reliability
- All webhook handlers MUST be idempotent — use `midtransOrderId` as unique key
- Webhook signature verification REQUIRED
- Failed webhooks: Midtrans retries 7x over 6 hours, must respond with 200 OK quickly
- Store raw webhook payload in `audit_log` for debugging
- Use database transactions when updating multiple tables (escrow + project + notification)

---

## 8. Trust Score System

### Score Formula (0–100)
```
trustScore = (
  baseFromKyc(0-20) +
  fromSkillTests(0-25) +
  fromCompletedProjects(0-30) +
  fromReviews(0-15) +
  fromActivity(0-10)
) capped at 100
```

### Components
1. **KYC Verification (max 20):** 
   - Email: 5
   - Phone: 5
   - KTP: 10

2. **Skill Tests (max 25):**
   - Each passed test: +5 (capped at 25)
   - Score modifier: tests with score ≥90 worth +6

3. **Completed Projects (max 30):**
   - First 5 projects: +4 each (max 20)
   - Projects 6–10: +1.5 each (max 7.5)
   - Beyond 10: +0.5 each
   - Penalty: cancelled-by-freelancer project: -3

4. **Reviews (max 15):**
   - Average rating × 3 (capped at 15)
   - 4 stars + comments = full points

5. **Activity (max 10):**
   - Profile completeness: 3
   - Recent activity (project in last 30d): 3
   - Response time &lt; 4h: 2
   - Portfolio items ≥ 3: 2

### Badges (separate from score)
- `new` — under 30 days, no projects yet
- `verified` — KYC complete
- `rising_star` — first 5 projects, avg rating ≥ 4.5
- `top_rated` — 20+ projects, avg ≥ 4.7
- `quick_responder` — avg response &lt; 1h over 30 days
- `category_specialist` — 10+ projects in single category, avg ≥ 4.5

### Display Logic
- Score &lt;30: show "Baru bergabung" + skill test recommendations
- Score 30–60: show "Sedang berkembang" + tips to improve
- Score 60–80: show "Terverifikasi" + can apply to most projects
- Score 80+: show "Terpercaya" + premium project access

---

## 9. API Endpoints

Brief overview of REST endpoints. Full OpenAPI spec to be generated post-MVP.

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
POST   /api/auth/send-otp
POST   /api/auth/verify-otp
GET    /api/auth/me
POST   /api/auth/oauth/google
```

### Users &amp; Profiles
```
GET    /api/users/[id]
PATCH  /api/users/[id]
DELETE /api/users/[id]                  // Soft delete
POST   /api/users/[id]/avatar
GET    /api/freelancers
GET    /api/freelancers/[username]
PATCH  /api/freelancers/me
POST   /api/freelancers/me/portfolio
DELETE /api/freelancers/me/portfolio/[itemId]
POST   /api/clients/me/business-verification
POST   /api/kyc/submit
GET    /api/kyc/status
```

### Projects
```
GET    /api/projects                      // Public listing with filters
POST   /api/projects                      // Client creates
GET    /api/projects/[id]
PATCH  /api/projects/[id]
DELETE /api/projects/[id]
POST   /api/projects/[id]/publish
POST   /api/projects/[id]/close
GET    /api/projects/[id]/applications
POST   /api/projects/[id]/apply           // Freelancer applies
POST   /api/projects/[id]/select-freelancer
POST   /api/projects/[id]/start           // After funding
POST   /api/projects/[id]/submit          // Freelancer submits
POST   /api/projects/[id]/approve         // Client approves
POST   /api/projects/[id]/revise          // Client requests revision
POST   /api/projects/[id]/cancel
GET    /api/projects/[id]/timeline        // Activity log
```

### Applications
```
GET    /api/applications/me               // My applications (freelancer)
PATCH  /api/applications/[id]
DELETE /api/applications/[id]             // Withdraw
```

### Messaging
```
GET    /api/conversations
GET    /api/conversations/[id]
GET    /api/conversations/[id]/messages
POST   /api/conversations/[id]/messages
PATCH  /api/conversations/[id]/read
POST   /api/conversations                 // Start new
```

### Payments &amp; Wallet
```
POST   /api/payments/create-escrow
POST   /api/webhooks/midtrans             // Inbound webhook
POST   /api/webhooks/midtrans-iris
GET    /api/wallet/me
GET    /api/wallet/transactions
POST   /api/wallet/withdraw
GET    /api/wallet/bank-accounts
POST   /api/wallet/bank-accounts
DELETE /api/wallet/bank-accounts/[id]
POST   /api/wallet/bank-accounts/[id]/verify
```

### Reviews
```
GET    /api/reviews/user/[userId]
POST   /api/reviews
POST   /api/reviews/[id]/flag
```

### Disputes
```
POST   /api/disputes
GET    /api/disputes/me
GET    /api/disputes/[id]
POST   /api/disputes/[id]/respond
POST   /api/disputes/[id]/evidence
```

### Cashflow
```
GET    /api/cashflow/summary
GET    /api/cashflow/projection
GET    /api/cashflow/invoices
GET    /api/cashflow/invoices/[id]
GET    /api/cashflow/invoices/[id]/pdf
```

### Skill Tests
```
GET    /api/skill-tests
GET    /api/skill-tests/[id]
POST   /api/skill-tests/[id]/start
POST   /api/skill-tests/[id]/submit
GET    /api/skill-tests/me/attempts
```

### Notifications
```
GET    /api/notifications
PATCH  /api/notifications/[id]/read
PATCH  /api/notifications/read-all
GET    /api/notifications/preferences
PATCH  /api/notifications/preferences
```

### Admin (admin.gawe.id)
```
GET    /api/admin/users
PATCH  /api/admin/users/[id]
POST   /api/admin/users/[id]/suspend
POST   /api/admin/users/[id]/unsuspend
GET    /api/admin/kyc/queue
POST   /api/admin/kyc/[id]/approve
POST   /api/admin/kyc/[id]/reject
GET    /api/admin/projects/flagged
GET    /api/admin/disputes
POST   /api/admin/disputes/[id]/resolve
GET    /api/admin/transactions
GET    /api/admin/disbursements/queue
POST   /api/admin/disbursements/[id]/approve
POST   /api/admin/disbursements/[id]/reject
GET    /api/admin/finance/overview
GET    /api/admin/finance/reports
POST   /api/admin/notifications/broadcast
GET    /api/admin/audit-log
GET    /api/admin/settings/platform
PATCH  /api/admin/settings/platform
```

### Response Format Convention
```json
// Success
{
  "data": { ... },
  "meta": { "pagination": { ... } }
}

// Error
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Proyek tidak ditemukan",
    "details": { ... }
  }
}
```

### Rate Limiting
- Public endpoints: 60 req/min per IP
- Authenticated endpoints: 300 req/min per user
- Sensitive endpoints (login, password reset): 5 req/min per IP
- Webhook endpoints: no rate limit (verify signature instead)

---

## 10. Security &amp; Compliance

### Authentication &amp; Session
- Passwords: Argon2id hashing (not bcrypt)
- Session: JWT with short-lived access token (15 min) + refresh token (7 days, rotating)
- Tokens stored in httpOnly, Secure, SameSite=Lax cookies
- CSRF protection on state-changing requests (double-submit cookie pattern)
- Optional 2FA via TOTP (authenticator apps)

### Authorization
- Role-based access control (RBAC) enforced at API middleware
- Resource-level checks: e.g. only project owner or assigned freelancer can access project
- Admin actions logged to audit_log immutably

### Data Protection
- All PII encrypted at rest (database column encryption for KTP number, NPWP, etc)
- File uploads (KTP, selfie) stored in S3 with server-side encryption
- KTP files: pre-signed URLs only, expire in 5 min
- TLS 1.3 enforced everywhere (Cloudflare)
- HSTS, CSP headers configured
- No PII in logs or error messages

### Payment Security
- PCI-DSS not required (Midtrans handles card data)
- Webhook signatures verified on every callback
- Idempotency keys on all financial operations
- Database transactions for multi-table money movements
- Daily reconciliation job to detect discrepancies
- Withdrawals over Rp 5M require Finance Admin approval
- Withdrawals over Rp 50M require Super Admin approval
- Bank account changes require email + OTP confirmation

### Indonesian Compliance
- **OJK (Otoritas Jasa Keuangan)** — payment escrow may require Payment Service Provider license. Initially partner with Midtrans/Xendit who hold the license; later evaluate own license.
- **PDP Law (UU PDP 2022)** — privacy by design, data subject rights (access, deletion, portability), DPO designation if &gt;1000 data subjects
- **PPh 21/23** — withholding tax on freelancer payouts (kontroversial, biasanya tanggung jawab freelancer; konsultasi pajak)
- **PPN** — VAT 11% on platform commission (Gawe sebagai pemungut atau PMSE)
- **NPWP** required for freelancer to receive payouts &gt;Rp 4.5jt/month (or implement tax withholding)
- **Terms of Service** &amp; **Privacy Policy** must be in Bahasa Indonesia per regulation

### Operational Security
- Secrets management: AWS Secrets Manager or Doppler (not .env in production)
- Database backups: daily snapshots, retained 30 days, weekly full + monthly cold storage
- Disaster recovery: documented runbook, RTO 4 hours, RPO 1 hour
- Penetration testing: annual, third-party
- Vulnerability scanning: Snyk on every PR, weekly full scan
- Logging: structured JSON logs, 90-day retention, no PII

### User Trust Features
- Two-factor authentication option
- Login alerts via email
- Active sessions management page
- Login history audit
- Account deletion with cooldown period (30 days)
- Export all my data feature (GDPR-style)

---

## 11. Admin Operations

### Admin Roles &amp; Daily Workflows

#### Support Admin — Daily Tasks
- Monitor &amp; respond to support tickets (target: first response &lt;2h)
- Triage user reports (project flagging, review reports, harassment)
- Help users with onboarding issues
- Escalate to higher-level admins when needed
- Daily: review &amp; respond to 20–50 tickets

#### KYC Reviewer — Daily Tasks
- Review pending KYC submissions in `/admin/users/kyc-queue`
- Verify KTP photo quality, match with selfie
- Approve / reject with reason
- Target: process within 24h of submission
- Tool: side-by-side viewer (KTP image + selfie + user data form)

#### Dispute Mediator (Admin level) — Workflow
1. New dispute appears in `/admin/disputes` queue
2. Admin claims dispute (assignedAdminId)
3. Reviews:
   - Project messages full transcript
   - Submitted deliverables
   - Both parties' statements
   - Trust scores &amp; history of both
4. Optionally requests more info from either party
5. Makes decision:
   - **Resolved in freelancer's favor:** full payout
   - **Resolved in client's favor:** full refund
   - **Split resolution:** partial payout + partial refund
6. Resolution recorded with reasoning, both parties notified
7. SLA: resolve within 5 business days

#### Finance Admin — Daily Tasks
- Review &amp; approve disbursement queue (transactions &gt; Rp 5M)
- Process refund queue
- Daily reconciliation: Midtrans dashboard vs internal ledger
- Weekly: generate &amp; verify financial reports
- Monthly: PPh 21/23 tax report for freelancer payouts
- Quarterly: P&amp;L statement

#### Super Admin — Strategic
- Approve large disbursements (&gt; Rp 50M)
- Manage admin role assignments
- Set platform commission rate
- Approve refunds &gt; Rp 10M
- Review weekly KPI dashboard
- Approve policy changes

### Admin Tools Required

1. **User search &amp; lookup** — fast search by email, phone, name, project ID
2. **Impersonation mode** — log in as user (with full audit trail) to debug issues
3. **Bulk operations** — bulk email, bulk badge assignment, bulk refund (CSV upload)
4. **Communication template manager** — saved replies for support
5. **Macros &amp; canned responses** — quick replies for common issues
6. **Internal notes on users** — admins can add private notes
7. **Activity timeline per user** — chronological log of all user actions
8. **Financial reconciliation tool** — match Midtrans transactions to internal records
9. **Report generator** — date range pickers + CSV export

### Critical Admin Pages — Detail

#### `/admin/disputes/[id]` — Dispute Workspace
**Layout:** 3 panels.
- **Left:** project summary, both parties' profiles, transaction history
- **Center:** full message thread (read-only) + deliverable files preview
- **Right:** dispute details (reason, evidence from both sides), decision form

**Decision form:**
- Resolution radio: Freelancer / Client / Split
- If Split: input refund amount + payout amount (must sum to escrow)
- Reasoning text area (visible to both parties)
- Internal notes (admin only)
- Action buttons: "Resolve in favor of freelancer", "Resolve in favor of client", "Custom split"

#### `/admin/transactions/disbursements` — Disbursement Queue
**Layout:** Table view.
- Columns: User, Amount, Bank, Requested at, Age (hours pending), Risk score, Actions
- Filters: status, amount range, age
- Risk indicators:
  - 🔴 New user (&lt;30 days) + large amount
  - 🔴 Bank account just changed
  - 🟡 Unusual amount vs history
- Bulk action: approve all green-flagged

**Each row click → side panel:**
- User profile summary
- Transaction details
- Bank account verification status
- Recent transaction history
- Approve / Reject buttons with reason

#### `/admin/finance/reconciliation` — Reconciliation Tool
- Upload Midtrans settlement report CSV
- System auto-matches with internal `transactions` table
- Highlights discrepancies:
  - Internal record without Midtrans match → investigate
  - Midtrans record without internal match → critical alert
  - Amount mismatch → flag for review
- Generate reconciliation report (PDF/CSV)

---

## 12. Notification System

### Channels
- **In-app** — bell icon, notification center
- **Email** — for important events
- **SMS** — for OTP, payment confirmations only (cost-sensitive)
- **Push** — PWA push notifications (post-MVP for mobile native)

### Event → Channel Matrix

| Event                         | In-App | Email | SMS  |
|-------------------------------|:------:|:-----:|:----:|
| Email verification            |        | ✓     |      |
| Phone OTP                     |        |       | ✓    |
| New application received      | ✓      | ✓     |      |
| Application accepted          | ✓      | ✓     |      |
| Application rejected          | ✓      |       |      |
| Project funded                | ✓      | ✓     | ✓    |
| Project submitted             | ✓      | ✓     |      |
| Revision requested            | ✓      | ✓     |      |
| Project completed             | ✓      | ✓     |      |
| Payment received              | ✓      | ✓     | ✓    |
| Withdrawal processed          | ✓      | ✓     | ✓    |
| Message received              | ✓      | ✓ (digest, 1x/day) |   |
| KYC approved/rejected         | ✓      | ✓     |      |
| New review received           | ✓      | ✓     |      |
| Dispute opened (against you)  | ✓      | ✓     | ✓    |
| Dispute resolved              | ✓      | ✓     |      |
| Login from new device         |        | ✓     |      |
| Password changed              |        | ✓     |      |

### Email Templates (Indonesian)
Required templates (managed via Resend or custom system):
- Welcome (freelancer)
- Welcome (client)
- Verify email
- Password reset
- Project funded
- Project submitted
- Revision requested
- Project completed
- Payment received
- Withdrawal confirmation
- KYC approved
- KYC rejected (with reason)
- New review received
- Dispute notification
- Weekly digest (opt-in)

### User Preferences
Allow user to disable categories:
- Marketing emails (default off)
- Weekly digest (default off)
- Message digest emails (default on)
- All non-transactional emails (master toggle)
- Transactional emails: cannot disable (required for service)

---

## 13. File Storage &amp; Media

### Storage Structure (S3 / R2)
```
gawe-prod-bucket/
├── avatars/                    # Public, max 2MB, jpg/png/webp
│   └── {userId}/{hash}.webp
├── portfolios/                 # Public
│   └── {userId}/{itemId}/{hash}.{ext}
├── project-attachments/        # Private, signed URLs
│   └── {projectId}/{filename}
├── project-deliverables/       # Private
│   └── {projectId}/{submissionId}/{filename}
├── kyc-documents/              # PRIVATE + encrypted, short-lived URLs only
│   └── {userId}/ktp_{hash}.jpg
│   └── {userId}/selfie_{hash}.jpg
├── business-docs/              # Private
│   └── {userId}/npwp_{hash}.pdf
├── invoices/                   # User can access own
│   └── {userId}/{invoiceId}.pdf
└── dispute-evidence/           # Private
    └── {disputeId}/{evidenceId}.{ext}
```

### Upload Flow
1. Frontend requests signed upload URL: `POST /api/uploads/sign`
   - Body: `{ type: 'avatar' | 'portfolio' | 'deliverable' | 'kyc', fileName, contentType, size }`
2. Backend validates:
   - User authenticated
   - File size limits (avatars 2MB, deliverables 50MB, KYC 5MB)
   - Allowed content types per category
3. Backend generates pre-signed S3 URL (5 min expiry for PUT)
4. Frontend uploads directly to S3
5. Frontend confirms upload: `POST /api/uploads/confirm` with file key
6. Backend creates DB record linking file to entity

### Image Processing
- Avatars: resize to 256x256 webp, store thumbnail (64x64)
- Portfolio images: resize to max 1920x1920, generate 400x400 thumbnail
- Use Sharp.js in a background job (BullMQ)
- Original always kept, served versions are processed

### Virus Scanning
- KYC documents and deliverables: scan with ClamAV in background job before allowing download
- If infected: quarantine, notify admin, notify user

### File Access Control
- **Public files** (avatars, portfolios, project descriptions): served via CDN with caching
- **Private files**:
  - User can access own files
  - Project participants can access project files
  - Admins can access all
  - Always serve via signed URLs (5–10 min expiry)
- **KYC files**: even admins need to "elevate" with reason + audit log entry to view

---

## 14. Deployment &amp; Infrastructure

### Environments
```
local       → Developer machine, Docker compose for DB/Redis
preview     → Per-PR ephemeral environment (Vercel preview + Neon branch)
staging     → staging.gawe.id, separate Midtrans sandbox
production  → gawe.id, Midtrans production
```

### Production Hosting

**Frontend (Next.js):**
- Vercel Pro plan
- Edge functions for auth middleware
- ISR for landing pages, project listings
- SSR for authenticated routes
- Image optimization via Next.js Image

**Backend (Express API):**
- Railway / Render / DigitalOcean App Platform
- Auto-scaling: 1–10 instances based on CPU
- Health check endpoint: `GET /api/health`
- Graceful shutdown handling

**Background Workers:**
- Separate Railway service or AWS ECS task
- BullMQ workers: 2–5 instances
- Cron jobs:
  - Hourly: reconciliation check
  - Daily 02:00 WIB: financial reports prep
  - Every 5 min: dispute escalation check
  - Every 1 min: notification queue processing

**Database (PostgreSQL):**
- Supabase Pro / Neon Pro / AWS RDS
- Connection pooling via PgBouncer or Supabase's built-in pooler
- Read replica for analytics queries (post-MVP)
- Point-in-time recovery enabled
- Daily backups, 30-day retention

**Redis (Upstash):**
- Pay-per-request initially
- Use cases: sessions, rate limiting, BullMQ, cache

**File Storage:**
- Cloudflare R2 (cheaper than S3, no egress fees)
- Or AWS S3 with CloudFront

**DNS &amp; CDN:**
- Cloudflare for DNS, SSL, WAF, DDoS protection
- Custom domain: gawe.id (primary), api.gawe.id, admin.gawe.id

### CI/CD
- GitHub Actions
- On PR:
  - Lint (ESLint, Prettier)
  - Type check (tsc)
  - Run tests (Vitest)
  - Build check
  - Database migration dry-run
- On merge to main:
  - Run tests
  - Build
  - Deploy to staging
  - Smoke tests
  - Manual approval → production deploy

### Monitoring &amp; Alerting
- **APM**: Sentry for errors, Datadog or self-hosted Grafana for metrics
- **Uptime**: BetterStack or UptimeRobot, 1-min check on critical endpoints
- **Logs**: Centralized in Datadog or Grafana Loki
- **Alerts**:
  - p95 latency &gt; 1s → Slack
  - Error rate &gt; 1% → PagerDuty
  - Payment webhook failures → immediate Slack
  - DB connections &gt; 80% pool → warning
  - Disk usage &gt; 80% → warning

### Backup Strategy
- DB: daily snapshots, retained 30 days; weekly retained 12 weeks; monthly retained 12 months
- Files: S3/R2 versioning enabled, lifecycle to Glacier after 90 days
- Encryption keys: AWS KMS, rotated annually
- Disaster recovery drill: quarterly

---

## 15. Development Phases

### Phase 0 — Foundation (Week 1–2)
- Set up monorepo, CI/CD, environments
- Database schema implementation (Prisma)
- Auth system (register, login, JWT, email verification)
- Basic user roles &amp; permissions
- Health checks, logging, error tracking

### Phase 1 — Core User Flows (Week 3–6)
- Freelancer onboarding (profile, basic skill test, KYC submission)
- Client onboarding (basic profile, business verification optional)
- Project creation flow (client)
- Project browsing &amp; application flow (freelancer)
- Basic messaging (per project)
- Landing page + public pages

### Phase 2 — Payment &amp; Escrow (Week 7–10)
- Midtrans integration (Snap for checkout)
- Escrow funding flow
- Project submission &amp; approval
- Disbursement via Midtrans Iris
- Wallet system
- Withdrawal flow
- Basic invoice generation
- Webhook handling + idempotency

### Phase 3 — Trust &amp; Reputation (Week 11–13)
- Trust Score calculation engine
- Review system (post-project)
- Skill test taking + grading
- Badge system
- Public profile pages with full stats

### Phase 4 — Cashflow &amp; Tools (Week 14–16)
- Cashflow dashboard with charts
- Income projection
- Invoice PDF generation
- Notification system (in-app + email)
- Search &amp; filtering improvements

### Phase 5 — Admin Panel (Week 17–20)
- Admin app shell + auth
- User management
- KYC review queue
- Dispute system + workspace
- Disbursement approval queue
- Financial dashboards
- Audit log

### Phase 6 — Polish &amp; Launch Prep (Week 21–24)
- Performance optimization
- Mobile responsiveness audit
- Accessibility audit (WCAG AA)
- Security audit + penetration testing
- Load testing
- Documentation
- T&amp;C, Privacy Policy finalization
- Soft launch beta (closed, 100 users)

### Phase 7 — Public Launch (Week 25–26)
- Marketing site polished
- Onboarding email sequences
- Customer support tooling ready
- Public launch
- Monitor closely, daily standups for first 4 weeks

**Total estimated:** 26 weeks (~6 months) with 2 full-stack devs + 1 designer + 1 PM/founder.

---

## 16. Definition of Done

A feature is "done" only when:

- [ ] Code written + reviewed (PR approved by another dev)
- [ ] Unit tests cover happy path + edge cases (min 70% coverage on critical paths)
- [ ] Integration tests for any cross-system flows (e.g. payment)
- [ ] Manual QA on staging by PM/founder
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1280px+)
- [ ] Accessibility: keyboard nav works, screen reader labels present
- [ ] Loading states + error states designed and implemented
- [ ] Empty states designed (no projects, no transactions, etc.)
- [ ] Indonesian copy reviewed by native speaker (avoid awkward translations)
- [ ] Logged appropriately (info, warn, error)
- [ ] Sentry instrumented for error capture
- [ ] Analytics events fired for key user actions
- [ ] Documentation updated (API docs, user-facing help)
- [ ] Database migrations tested on staging with production-size dataset
- [ ] No new vulnerabilities introduced (Snyk passes)
- [ ] Performance: p95 &lt; 500ms for API, LCP &lt; 2.5s for pages

---

## Appendix A — Prompt untuk Claude Code

Setelah brief ini berada di repository, kamu bisa kerja secara bertahap:

```
# Phase 0 — Foundation
Read BRIEF.md, focus on Section 3 (Tech Stack), 4 (Database), and 15 (Phase 0).

Set up the monorepo structure as specified, initialize Next.js apps and Express API,
configure Prisma with the schema from Section 4, set up auth endpoints per Section 9
auth routes. Create Docker compose for local Postgres + Redis. Make sure TypeScript
strict mode is on everywhere.

Output: a working monorepo where I can run `pnpm dev` and have web, admin, and api
all running locally.
```

```
# Phase 2 — Payment Integration
Read BRIEF.md, focus on Section 7 (Payment & Escrow Flow) and Section 10 (Security).

Implement the full Midtrans integration:
1. Server-side: create-escrow endpoint, webhook handler with signature verification + idempotency
2. Client-side: Snap modal integration on /klien/proyek/[id]/danai
3. State machine for project status transitions
4. Disbursement flow via Iris API
5. Wallet balance updates with proper transactions

All financial operations must be atomic (DB transactions). All webhooks idempotent.
Log every state transition for audit.
```

```
# Phase 5 — Admin Panel
Read BRIEF.md, focus on Section 11 (Admin Operations) and Section 6 (Dashboard Specs).

Build the admin panel (separate Next.js app at admin.gawe.id):
- Auth gated to admin roles only
- All pages listed in Section 5 Admin Panel
- Dispute workspace with 3-panel layout
- Disbursement queue with risk indicators
- Financial reconciliation tool
- Audit log viewer

Every admin action must write to audit_log table.
```

---

## Appendix B — Open Questions / Decisions Needed

These need decision before relevant phase starts:

1. **Tax handling for freelancer payouts** — does Gawe withhold PPh? Need accountant consultation.
2. **OJK licensing path** — start as Midtrans's merchant, or pursue own PJP license? Consult legal.
3. **Pricing on day 1** — confirm 10% flat or tiered from start?
4. **Mobile app priority** — when does native iOS/Android become a priority vs PWA?
5. **i18n scope** — Indonesian only at launch, or include English from day 1?
6. **Project categories** — finalize list of categories &amp; subcategories (suggest start with 20 main).
7. **Minimum project value** — Rp 100k confirmed? Concern: too low for meaningful commission.
8. **Maximum project value at launch** — cap at Rp 10jt for first 6 months for risk management?

---

*Dokumen ini bersifat hidup. Update version + date saat ada perubahan major.*
*Owner: Gawe founding team. Reviewers: Tech lead, finance advisor, legal counsel.*
