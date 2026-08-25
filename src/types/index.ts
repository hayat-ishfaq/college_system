import type { DefaultSession } from "next-auth";
import type { JWT } from "@auth/core/jwt";

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
}

declare module "next-auth" {
  interface Session {
    user: SessionUser & DefaultSession["user"];
  }
  interface User {
    role: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: UserRole;
    id: string;
  }
}

export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
