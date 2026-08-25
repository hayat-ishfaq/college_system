import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types";

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) {
    redirect(`/${session.user.role.toLowerCase()}/dashboard`);
  }
  return session;
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

export async function requireTeacher() {
  return requireRole(["TEACHER", "ADMIN"]);
}

export async function requireStudent() {
  return requireRole(["STUDENT"]);
}

export function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "TEACHER":
      return "/teacher/dashboard";
    case "STUDENT":
      return "/student/dashboard";
    default:
      return "/login";
  }
}
