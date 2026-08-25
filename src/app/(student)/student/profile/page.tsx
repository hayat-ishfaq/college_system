import { requireStudent } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { User, BookOpen, Calendar, MapPin, HeartPulse, ShieldCheck, Mail, Phone } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";

export const metadata = {
  title: "My Student Profile",
};

export default async function StudentProfilePage() {
  const session = await requireStudent();

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      section: {
        include: {
          class: true,
        },
      },
      academicYear: true,
    },
  });

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-400">
        Student profile not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Student Profile"
        description="Official academic record, personal details, and guardian contacts."
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-700 p-8 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl font-bold shadow-inner shrink-0">
              {getInitials(`${student.firstName} ${student.lastName}`)}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-bold">
                  {student.firstName} {student.lastName}
                </h2>
                <span className="bg-white/20 text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                  {student.admissionNumber}
                </span>
              </div>
              <p className="text-violet-100 text-sm mt-1">
                {student.section?.class.name} — Section {student.section?.name} · Roll Number: {student.rollNumber || "—"}
              </p>
              <p className="text-violet-200 text-xs mt-0.5">
                Academic Session: {student.academicYear?.name || "2025-2026"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm">
          {/* Personal Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <span className="text-xs text-slate-400 block">Date of Birth</span>
                <span className="font-semibold text-slate-800">{formatDate(student.dateOfBirth)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Gender</span>
                <span className="font-semibold text-slate-800 capitalize">{student.gender?.toLowerCase() || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Blood Group</span>
                <span className="font-semibold text-slate-800">{student.bloodGroup?.replace("_", " ") || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Admission Date</span>
                <span className="font-semibold text-slate-800">{formatDate(student.admissionDate)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Portal Email</span>
                <span className="font-semibold text-slate-800">{student.user?.email}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Enrollment Status</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                  ● Enrolled & Active
                </span>
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Guardian & Family Record
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <span className="text-xs text-slate-400 block">Guardian / Father Name</span>
                <span className="font-semibold text-slate-800">{student.guardianName || student.fatherName || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Guardian Phone</span>
                <span className="font-semibold text-slate-800">{student.guardianPhone || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Emergency Contact</span>
                <span className="font-semibold text-slate-800">{student.emergencyContact || student.guardianPhone || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Address</span>
                <span className="font-semibold text-slate-800">{student.address ? `${student.address}, ${student.city || ""}` : "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
