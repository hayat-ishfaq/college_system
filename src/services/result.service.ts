import { prisma } from "@/lib/db";
import { calculateGrade } from "@/lib/utils";
import type { SaveMarksInput } from "@/lib/validations/mark.schema";

export interface StudentResultSummary {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  rollNumber: string | null;
  className: string;
  sectionName: string;
  totalMaxMarks: number;
  totalObtainedMarks: number;
  percentage: number;
  grade: string;
  status: "PASS" | "FAIL";
  rank: number;
  subjects: Array<{
    subjectCode: string;
    subjectName: string;
    maxMarks: number;
    obtainedMarks: number | null;
    isAbsent: boolean;
    percentage: number;
    grade: string;
    remarks: string | null;
  }>;
}

export class ResultService {
  /**
   * Save / Upsert marks entered by a teacher for a specific exam paper.
   */
  static async saveMarks(data: SaveMarksInput, userId?: string) {
    const schedule = await prisma.examSchedule.findUnique({
      where: { id: data.examScheduleId },
      include: { subject: true, section: { include: { class: true } } },
    });

    if (!schedule) throw new Error("Exam schedule paper not found.");
    if (schedule.isLocked) {
      throw new Error(
        "Marks entry for this exam paper is LOCKED by the administrator."
      );
    }

    // Validate no marks exceed maxMarks
    for (const entry of data.marks) {
      if (
        !entry.isAbsent &&
        entry.obtainedMarks !== null &&
        entry.obtainedMarks !== undefined
      ) {
        if (entry.obtainedMarks < 0 || entry.obtainedMarks > schedule.maxMarks) {
          throw new Error(
            `Obtained marks cannot exceed maximum marks (${schedule.maxMarks}) or be less than 0.`
          );
        }
      }
    }

    // Upsert marks in transaction
    const results = await prisma.$transaction(
      data.marks.map((entry) =>
        prisma.mark.upsert({
          where: {
            examScheduleId_studentId: {
              examScheduleId: data.examScheduleId,
              studentId: entry.studentId,
            },
          },
          update: {
            obtainedMarks: entry.isAbsent ? null : entry.obtainedMarks,
            isAbsent: entry.isAbsent,
            remarks: entry.remarks || null,
          },
          create: {
            examScheduleId: data.examScheduleId,
            studentId: entry.studentId,
            obtainedMarks: entry.isAbsent ? null : entry.obtainedMarks,
            isAbsent: entry.isAbsent,
            remarks: entry.remarks || null,
          },
        })
      )
    );

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "MARKS_ENTERED",
          entity: "ExamSchedule",
          entityId: schedule.id,
          details: `Recorded marks for ${schedule.subject.name} (${schedule.section.class.name} - ${schedule.section.name}) for ${results.length} students.`,
        },
      });
    }

    return { savedCount: results.length };
  }

  /**
   * Get student roster with current marks for teacher entry portal.
   */
  static async getScheduleMarksRoster(examScheduleId: string) {
    const schedule = await prisma.examSchedule.findUnique({
      where: { id: examScheduleId },
      include: {
        subject: true,
        section: { include: { class: true } },
        exam: true,
        marks: true,
      },
    });

    if (!schedule) throw new Error("Exam schedule paper not found.");

    const students = await prisma.student.findMany({
      where: { sectionId: schedule.sectionId, isActive: true },
      orderBy: [{ rollNumber: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
        rollNumber: true,
      },
    });

    const marksMap = new Map(schedule.marks.map((m) => [m.studentId, m]));

    const roster = students.map((student) => {
      const mark = marksMap.get(student.id);
      return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        admissionNumber: student.admissionNumber,
        rollNumber: student.rollNumber,
        obtainedMarks: mark?.obtainedMarks ?? null,
        isAbsent: mark?.isAbsent ?? false,
        remarks: mark?.remarks ?? "",
      };
    });

    return {
      schedule: {
        id: schedule.id,
        maxMarks: schedule.maxMarks,
        isLocked: schedule.isLocked,
        subjectName: schedule.subject.name,
        subjectCode: schedule.subject.code,
        className: schedule.section.class.name,
        sectionName: schedule.section.name,
        examName: schedule.exam.name,
      },
      roster,
    };
  }

  /**
   * Calculate complete exam results for an exam term across sections/classes.
   */
  static async calculateExamResults(
    examId: string,
    filter?: { classId?: string; sectionId?: string }
  ): Promise<StudentResultSummary[]> {
    // 1. Get all schedules for this exam
    const scheduleWhere: any = { examId };
    if (filter?.sectionId) scheduleWhere.sectionId = filter.sectionId;
    else if (filter?.classId) scheduleWhere.section = { classId: filter.classId };

    const schedules = await prisma.examSchedule.findMany({
      where: scheduleWhere,
      include: {
        subject: true,
        section: { include: { class: true } },
        marks: true,
      },
    });

    if (schedules.length === 0) return [];

    // 2. Collect all active students across relevant sections
    const sectionIds = Array.from(new Set(schedules.map((s) => s.sectionId)));
    const students = await prisma.student.findMany({
      where: { sectionId: { in: sectionIds }, isActive: true },
      include: {
        section: { include: { class: true } },
      },
      orderBy: [{ rollNumber: "asc" }, { firstName: "asc" }],
    });

    // 3. Build student results
    const results: StudentResultSummary[] = [];

    for (const student of students) {
      const studentSchedules = schedules.filter(
        (s) => s.sectionId === student.sectionId
      );

      let totalMaxMarks = 0;
      let totalObtainedMarks = 0;
      let hasFailedSubject = false;

      const subjectsBreakdown = studentSchedules.map((sched) => {
        const mark = sched.marks.find((m) => m.studentId === student.id);
        const maxMarks = sched.maxMarks;
        totalMaxMarks += maxMarks;

        const obtained = mark?.isAbsent ? 0 : mark?.obtainedMarks ?? 0;
        totalObtainedMarks += obtained;

        const percentage = maxMarks > 0 ? Math.round((obtained / maxMarks) * 100) : 0;
        const grade = mark?.isAbsent ? "F" : calculateGrade(percentage);

        if (percentage < 33 || mark?.isAbsent) {
          hasFailedSubject = true;
        }

        return {
          subjectCode: sched.subject.code,
          subjectName: sched.subject.name,
          maxMarks,
          obtainedMarks: mark?.obtainedMarks ?? (mark?.isAbsent ? 0 : null),
          isAbsent: mark?.isAbsent ?? false,
          percentage,
          grade,
          remarks: mark?.remarks || null,
        };
      });

      const aggregatePercentage =
        totalMaxMarks > 0
          ? Math.round((totalObtainedMarks / totalMaxMarks) * 100)
          : 0;

      const overallGrade = calculateGrade(aggregatePercentage);
      const status: "PASS" | "FAIL" =
        aggregatePercentage >= 40 && !hasFailedSubject ? "PASS" : "FAIL";

      results.push({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        rollNumber: student.rollNumber,
        className: student.section?.class.name || "—",
        sectionName: student.section?.name || "—",
        totalMaxMarks,
        totalObtainedMarks,
        percentage: aggregatePercentage,
        grade: overallGrade,
        status,
        rank: 0, // Assigned below
        subjects: subjectsBreakdown,
      });
    }

    // 4. Assign ranks sorted by total obtained marks descending
    results.sort((a, b) => b.totalObtainedMarks - a.totalObtainedMarks);
    results.forEach((r, idx) => {
      r.rank = idx + 1;
    });

    return results;
  }

  /**
   * Get single student transcript report card data.
   */
  static async getStudentReportCard(studentId: string, examId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        section: { include: { class: true } },
        academicYear: true,
      },
    });

    if (!student) throw new Error("Student record not found.");

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { academicYear: true },
    });

    if (!exam) throw new Error("Exam record not found.");

    // Calculate section results to compute class rank
    const allSectionResults = await this.calculateExamResults(examId, {
      sectionId: student.sectionId || undefined,
    });

    const studentResult = allSectionResults.find(
      (r) => r.studentId === student.id
    );

    return {
      student,
      exam,
      result: studentResult || null,
      totalStudentsInSection: allSectionResults.length,
    };
  }
}
