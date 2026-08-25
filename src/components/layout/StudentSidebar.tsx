"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  UserCircle,
  CalendarCheck,
  Award,
  FileText,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/profile", label: "My Profile", icon: UserCircle },
  { href: "/student/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/student/results", label: "Results", icon: Award },
  { href: "/student/challans", label: "Fee Challans", icon: FileText },
  { href: "/student/announcements", label: "Announcements", icon: Megaphone },
];

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full w-56 bg-slate-900 text-white shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
        <div className="flex items-center justify-center w-8 h-8 bg-violet-500 rounded-lg shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">EduManage</p>
          <p className="text-slate-400 text-[10px] leading-tight">Student Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/student/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-slate-400">Student</span>
        </div>
      </div>
    </aside>
  );
}
