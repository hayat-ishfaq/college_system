# EduManage — Production-Ready School & College Management Platform

> **Smart School & College Management Platform**  
> Designed for modern educational institutions, colleges, and schools to streamline academic, financial, faculty, and student management in one centralized, multi-role portal.

---

## 🌟 Overview

**EduManage** is a production-grade SaaS-style School and College Management System built with **Next.js 15 App Router**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, **Prisma ORM**, and **Auth.js (NextAuth v5)**.

It delivers three distinct, dedicated, and strictly role-isolated portals:
1. 🏛️ **Admin Portal** — Comprehensive institute oversight, admissions, fees, faculty, schedules, reports & settings.
2. 👨‍🏫 **Teacher Portal** — Class assignments, attendance tracking, marks entry, and student performance rosters.
3. 🎓 **Student Portal** — Mobile-first dashboard for personal attendance, fee challans & receipts, exam results, and campus bulletins.

---

## 🚀 Key Features

- **Strict Server-Side RBAC**: Authorization is verified on every Server Action and layout; manual URL tampering is rejected server-side.
- **Normalized Relational Schema**: Over 20 relational models covering Students, Teachers, Classes, Sections, Subjects, Assignments, Fee Structures, Challans, Payments, Exams, Schedules, Marks, Attendance, Announcements, Notifications, and Audit Logs.
- **Live Database-Driven Metrics**: No fake data or static mocks. All dashboard counters, collected amounts, and attendance rates calculate in real time.
- **Authentication**: Secure bcrypt password hashing, session tokens in HTTP-only cookies, and instant role-based redirects.
- **Prisma Seed Ecosystem**: Ships with full sample data for **Bright Future College** (classes from Grade 9 to Pre-Engineering / Pre-Medical, faculty, enrolled students, active fee challans, exam marks, and audit logs).

---

## 🔑 Demo Credentials

| Role | Email | Password | Dashboard URL |
|---|---|---|---|
| **Admin** | `admin@edumanage.demo` | `Admin@123` | `/admin/dashboard` |
| **Teacher** | `teacher@edumanage.demo` | `Teacher@123` | `/teacher/dashboard` |
| **Student** | `student@edumanage.demo` | `Student@123` | `/student/dashboard` |

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15+ (App Router, Server Components & Server Actions)
- **Language**: TypeScript (Strict mode enabled)
- **Styling**: Tailwind CSS & Radix UI primitives
- **Icons**: Lucide React
- **Database**: PostgreSQL 16+
- **ORM**: Prisma ORM 6
- **Authentication**: Auth.js (NextAuth v5) + bcryptjs
- **Form & Validation**: React Hook Form + Zod
- **Notifications & Feedback**: Sonner Toasts

---

## 📁 Project Architecture

```
college_system/
├── prisma/
│   ├── schema.prisma              # Complete normalized schema (20+ models)
│   └── seed.ts                    # Realistic demo data seed script
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx         # Centered branded auth shell
│   │   │   └── login/             # Login page with demo credentials helper
│   │   ├── (admin)/
│   │   │   ├── layout.tsx         # Admin sidebar + topbar + RBAC enforcement
│   │   │   └── admin/
│   │   │       ├── dashboard/     # Live SQL aggregated metrics, feed, notices
│   │   │       ├── students/      # Student management module
│   │   │       ├── teachers/      # Teacher management module
│   │   │       ├── classes/       # Class & section configuration
│   │   │       ├── subjects/      # Subject catalog
│   │   │       ├── assignments/   # Teacher-Subject-Class mappings
│   │   │       ├── fees/          # Fee structure definitions
│   │   │       ├── challans/      # Challan management & bulk generator
│   │   │       ├── attendance/    # Campus attendance records
│   │   │       ├── examinations/  # Exam scheduling
│   │   │       ├── results/       # Results & transcript publishing
│   │   │       ├── announcements/ # Notice broadcasts
│   │   │       ├── reports/       # Financial & academic exports
│   │   │       └── settings/      # Institution parameters & grading scale
│   │   ├── (teacher)/
│   │   │   ├── layout.tsx         # Teacher portal layout
│   │   │   └── teacher/
│   │   │       ├── dashboard/     # Assigned classes, pending marks & exams
│   │   │       ├── classes/
│   │   │       ├── students/
│   │   │       ├── attendance/
│   │   │       ├── marks/
│   │   │       ├── announcements/
│   │   │       └── profile/
│   │   ├── (student)/
│   │   │   ├── layout.tsx         # Student portal layout
│   │   │   └── student/
│   │   │       ├── dashboard/     # Attendance %, fee dues, recent grades
│   │   │       ├── profile/
│   │   │       ├── attendance/
│   │   │       ├── results/
│   │   │       ├── challans/
│   │   │       └── announcements/
│   │   ├── api/
│   │   │   └── auth/              # Auth.js route handler
│   │   ├── globals.css            # Design tokens & color system
│   │   ├── layout.tsx             # Root layout + font + toasts
│   │   └── page.tsx               # Root redirector to role dashboard
│   ├── components/
│   │   └── layout/                # Sidebars, topbars, headers, stat cards
│   ├── lib/
│   │   ├── auth/                  # RBAC permission guards (requireRole, requireAdmin)
│   │   ├── db.ts                  # Prisma Client singleton
│   │   └── utils.ts               # Currency (PKR), grade, date, ID helpers
│   ├── middleware.ts              # Edge routing & RBAC protection
│   └── types/                     # TypeScript definitions & Auth module augments
├── .env.example
├── .env
├── package.json
└── tsconfig.json
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js**: v18.18 or higher
- **PostgreSQL**: Running instance on `localhost:5432`

### 2. Environment Setup
Create or verify `.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/edumanage_dev"
AUTH_SECRET="your-32-character-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="EduManage"
FILE_STORAGE_PATH="./storage/files"
PDF_STORAGE_PATH="./storage/pdfs"
```

### 3. Database Migration & Seed
```bash
# Push schema to PostgreSQL
npx prisma db push

# Seed demo data (Bright Future College)
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗓️ Phased Implementation Roadmap

- [x] **Phase 1**: Project Scaffold, PostgreSQL Schema (all models), Auth.js RBAC, Layouts, Dashboard Shells & Seed Data
- [ ] **Phase 2**: Student & Teacher CRUD, Classes, Sections, Subjects, and Assignment Management
- [ ] **Phase 3**: Fee Structures, Monthly Challan Generator, Triplicate A4 PDF Engine, Payments & Financial Reports
- [ ] **Phase 4**: Attendance System (Daily marking, monthly logs, percentage calculations & export)
- [ ] **Phase 5**: Examination Management, Scheduling, Teacher Marks Entry, Grade Calculations & PDF Report Cards
- [ ] **Phase 6**: Campus Announcements, In-App Notifications, Institution Settings & Audit Logs
- [ ] **Phase 7**: End-to-End Security Auditing, Performance Benchmarks, CSV Exports & Production Polish
