import Link from "next/link";
import { auth } from "@/auth";
import {
  GraduationCap,
  ShieldCheck,
  CreditCard,
  CalendarCheck,
  Award,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  Users,
  Layers,
  Sparkles,
  FileText,
  FileCheck2,
  BarChart3,
  Lock,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  const demoRoles = [
    {
      title: "Administrator Portal",
      desc: "Full institution oversight: admissions, fee structures, bulk challans, exam schedules, and financial reports.",
      role: "ADMIN",
      email: "admin@edumanage.demo",
      badge: "Full Control",
      href: "/admin/dashboard",
      color: "border-blue-500 bg-blue-50/40 hover:border-blue-600",
      btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      title: "Faculty & Teacher Portal",
      desc: "Section management, daily attendance rosters with 1-click shortcuts, and examination marks entry.",
      role: "TEACHER",
      email: "teacher@edumanage.demo",
      badge: "Classroom Ops",
      href: "/teacher/dashboard",
      color: "border-emerald-500 bg-emerald-50/40 hover:border-emerald-600",
      btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    {
      title: "Student & Guardian Portal",
      desc: "Real-time attendance percentage, Triplicate fee challans download, and official academic report cards.",
      role: "STUDENT",
      email: "student@edumanage.demo",
      badge: "Self-Service",
      href: "/student/dashboard",
      color: "border-purple-500 bg-purple-50/40 hover:border-purple-600",
      btnColor: "bg-purple-600 hover:bg-purple-700 text-white",
    },
  ];

  const features = [
    {
      title: "Student Information System (SIS)",
      desc: "Streamlined 4-step admission wizard, multi-section allocations, guardian directory, and roll number conflict protection.",
      icon: Users,
      color: "bg-blue-500 text-white",
    },
    {
      title: "Fee & Triplicate Challan Engine",
      desc: "Class fee structures, bulk monthly challan generator with duplicate protection, payment recording, and A4 3-copy PDF prints.",
      icon: CreditCard,
      color: "bg-emerald-500 text-white",
    },
    {
      title: "Daily Attendance Tracker",
      desc: "Interactive section rosters, Present/Absent/Late/Leave toggles, monthly summaries, and exam eligibility gauges (75% threshold).",
      icon: CalendarCheck,
      color: "bg-amber-500 text-white",
    },
    {
      title: "Examinations & Report Cards",
      desc: "Term schedules, teacher marks entry with max-mark validation, automated ranking engine, and printable A4 report cards.",
      icon: Award,
      color: "bg-purple-500 text-white",
    },
    {
      title: "Campus Broadcasts & Alerts",
      desc: "Role-targeted circulars (Faculty, Students, All Campus) with priority escalation tiers and auto notification triggers.",
      icon: Megaphone,
      color: "bg-indigo-500 text-white",
    },
    {
      title: "Enterprise Audit Logs & Security",
      desc: "Immutable database audit trails recording admissions, payments, marks, and settings with Auth.js v5 RBAC.",
      icon: ShieldCheck,
      color: "bg-slate-800 text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
                EduManage
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                SaaS Enterprise
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <Link
                href={
                  session.user.role === "ADMIN"
                    ? "/admin/dashboard"
                    : session.user.role === "TEACHER"
                    ? "/teacher/dashboard"
                    : "/student/dashboard"
                }
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
              >
                Sign In to Platform <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Production-Ready School & College Management Operating System
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Centralized Institutional Operations with{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Automated Precision
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Eliminate operational friction across admissions, fee collection, triplicate challan generation, daily attendance, examination tabulation, and official student report cards.
          </p>

          {/* Quick Demo Access Bar */}
          <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {demoRoles.map((role) => (
              <div
                key={role.role}
                className={`bg-white rounded-2xl border-2 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${role.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-900 text-white">
                      {role.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {role.role}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                    {role.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {role.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100/80">
                  <div className="text-[11px] font-mono text-slate-500 mb-3 bg-slate-100/70 p-2 rounded-lg">
                    User: <span className="font-bold text-slate-800">{role.email}</span>
                  </div>
                  <Link
                    href="/login"
                    className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${role.btnColor}`}
                  >
                    Open {role.role.toLowerCase()} Demo <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              Comprehensive Feature Set
            </h2>
            <p className="text-3xl font-black text-slate-900">
              Engineered for Complete Institutional Governance
            </p>
            <p className="text-sm text-slate-500 mt-3">
              Every workflow from student admission to final examination transcripts runs on a single unified database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-blue-300 hover:bg-white hover:shadow-lg transition-all space-y-3"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs ${f.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 pt-1">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture & Tech Badges */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-lg font-bold tracking-tight">
            Commercial SaaS Architecture & Technology Stack
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-blue-300">
              Next.js 15 App Router
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-indigo-300">
              TypeScript
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-300">
              PostgreSQL
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-teal-300">
              Prisma ORM
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-purple-300">
              Auth.js v5 RBAC
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-pink-300">
              Tailwind CSS
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300">
              Print-Ready A4 Engine
            </span>
          </div>

          <div className="pt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Launch Live Platform Demo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} EduManage. Built for Real-World School & College Operations.</p>
        </div>
      </footer>
    </div>
  );
}
