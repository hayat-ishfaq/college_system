import { requireTeacher } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Mail, Phone, Award, Calendar, MapPin, BookOpen, User } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";

export const metadata = {
  title: "Faculty Profile",
};

export default async function TeacherProfilePage() {
  const session = await requireTeacher();

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      teacherAssignments: {
        where: { isActive: true },
        include: {
          class: true,
          section: true,
          subject: true,
        },
      },
    },
  });

  if (!teacher) {
    return (
      <div className="p-8 text-center text-slate-400">
        Teacher record not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Faculty Profile"
        description="Your personal information, teaching assignments, and employee credentials."
      />

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 p-8 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl font-bold shadow-inner shrink-0">
              {getInitials(`${teacher.firstName} ${teacher.lastName}`)}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-bold">
                  {teacher.firstName} {teacher.lastName}
                </h2>
                <span className="bg-white/20 text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                  {teacher.employeeId}
                </span>
              </div>
              <p className="text-emerald-100 text-sm mt-1">
                {teacher.specialization || "Faculty Member"}
              </p>
              <p className="text-emerald-200 text-xs mt-0.5">
                {teacher.qualification || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-6">
          {/* Key Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div>
              <span className="text-xs text-slate-400 block">Official Email</span>
              <span className="font-semibold text-slate-800">{teacher.email}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Phone Number</span>
              <span className="font-semibold text-slate-800">{teacher.phone || "Not provided"}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Joining Date</span>
              <span className="font-semibold text-slate-800">{formatDate(teacher.joiningDate)}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Gender</span>
              <span className="font-semibold text-slate-800 capitalize">{teacher.gender?.toLowerCase() || "—"}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">City</span>
              <span className="font-semibold text-slate-800">{teacher.city || "Islamabad"}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Account Status</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                ● Active Faculty
              </span>
            </div>
          </div>

          {/* Assigned Classes */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Active Teaching Assignments ({teacher.teacherAssignments.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teacher.teacherAssignments.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-900 block text-sm">
                      {a.class.name} — Section {a.section.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {a.subject.name} ({a.subject.code})
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    Assigned
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
