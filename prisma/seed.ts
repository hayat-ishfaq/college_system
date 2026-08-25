import { PrismaClient, Role, Gender, BloodGroup, AttendanceStatus, ChallanStatus, PaymentMethod, FeeType, ExamStatus, AnnouncementTarget, AnnouncementPriority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting EduManage database seeding...");

  // 1. Clear existing records safely
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.mark.deleteMany();
  await prisma.examSchedule.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.feeItem.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.teacherAssignment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.section.deleteMany();
  await prisma.class.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.institutionSetting.deleteMany();
  await prisma.user.deleteMany();

  // 2. Institution Settings
  await prisma.institutionSetting.createMany({
    data: [
      { key: "INSTITUTION_NAME", value: "Bright Future College" },
      { key: "TAGLINE", value: "Smart School & College Management Platform" },
      { key: "ADDRESS", value: "Plot 42, Education Boulevard, H-8/4, Islamabad, Pakistan" },
      { key: "PHONE", value: "+92 51 9283741" },
      { key: "EMAIL", value: "info@brightfuture.edu.pk" },
      { key: "CURRENCY", value: "PKR" },
      { key: "PRINCIPAL_NAME", value: "Prof. Dr. Tariq Mahmood" },
    ],
  });

  // 3. Academic Year
  const currentYear = await prisma.academicYear.create({
    data: {
      name: "2025-2026",
      startDate: new Date("2025-08-15"),
      endDate: new Date("2026-06-30"),
      isCurrent: true,
    },
  });

  // 4. Classes & Sections
  const classConfigs = [
    { name: "Grade 9", sections: ["A", "B"] },
    { name: "Grade 10", sections: ["A", "B"] },
    { name: "ICS Part-I", sections: ["A", "B"] },
    { name: "ICS Part-II", sections: ["A"] },
    { name: "Pre-Engineering Part-I", sections: ["A"] },
    { name: "Pre-Engineering Part-II", sections: ["A"] },
    { name: "Pre-Medical Part-I", sections: ["A"] },
    { name: "Pre-Medical Part-II", sections: ["A"] },
  ];

  const createdClasses: Record<string, any> = {};
  const createdSections: Record<string, any> = {};

  for (const item of classConfigs) {
    const cls = await prisma.class.create({
      data: { name: item.name, description: `Academic Program for ${item.name}` },
    });
    createdClasses[item.name] = cls;

    for (const secName of item.sections) {
      const sec = await prisma.section.create({
        data: {
          name: secName,
          classId: cls.id,
          capacity: 40,
          room: `Room ${item.name.replace(/\D/g, "") || "10"}-${secName}`,
        },
      });
      createdSections[`${item.name}-${secName}`] = sec;
    }
  }

  // 5. Subjects
  const subjectList = [
    { code: "ENG101", name: "English Language & Literature", creditHours: 4 },
    { code: "MTH101", name: "Mathematics", creditHours: 5 },
    { code: "PHY101", name: "Physics", creditHours: 4 },
    { code: "CHM101", name: "Chemistry", creditHours: 4 },
    { code: "BIO101", name: "Biology", creditHours: 4 },
    { code: "CSC101", name: "Computer Science", creditHours: 4 },
    { code: "URD101", name: "Urdu", creditHours: 3 },
    { code: "PST101", name: "Pakistan Studies", creditHours: 2 },
  ];

  const createdSubjects: Record<string, any> = {};
  for (const s of subjectList) {
    const sub = await prisma.subject.create({ data: s });
    createdSubjects[s.code] = sub;
  }

  // 6. Users & Credentials
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const teacherPasswordHash = await bcrypt.hash("Teacher@123", 10);
  const studentPasswordHash = await bcrypt.hash("Student@123", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@edumanage.demo",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      email: "teacher@edumanage.demo",
      passwordHash: teacherPasswordHash,
      role: Role.TEACHER,
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: "student@edumanage.demo",
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
    },
  });

  // 7. Teacher Profile
  const teacherProfile = await prisma.teacher.create({
    data: {
      userId: teacherUser.id,
      employeeId: "EMP251001",
      firstName: "Muhammad",
      lastName: "Ali",
      email: "teacher@edumanage.demo",
      phone: "+92 300 1234567",
      qualification: "M.Sc. Mathematics & Computer Science",
      specialization: "Calculus & Algorithmic Design",
      joiningDate: new Date("2022-09-01"),
      gender: Gender.MALE,
      address: "House 14, Street 7, F-10/2, Islamabad",
      city: "Islamabad",
    },
  });

  // Extra Faculty Members
  const additionalTeachers = [
    { firstName: "Fatima", lastName: "Zahra", email: "fatima.zahra@brightfuture.edu.pk", spec: "Physics", emp: "EMP251002" },
    { firstName: "Kamran", lastName: "Ahmed", email: "kamran.ahmed@brightfuture.edu.pk", spec: "Chemistry", emp: "EMP251003" },
    { firstName: "Saima", lastName: "Malik", email: "saima.malik@brightfuture.edu.pk", spec: "English", emp: "EMP251004" },
  ];

  for (const t of additionalTeachers) {
    const u = await prisma.user.create({
      data: { email: t.email, passwordHash: teacherPasswordHash, role: Role.TEACHER },
    });
    await prisma.teacher.create({
      data: {
        userId: u.id,
        employeeId: t.emp,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        qualification: "M.Phil",
        specialization: t.spec,
        gender: Gender.FEMALE,
      },
    });
  }

  // 8. Teacher Assignments
  const grade10A = createdSections["Grade 10-A"];
  const grade10B = createdSections["Grade 10-B"];
  const icsPart1A = createdSections["ICS Part-I-A"];

  await prisma.teacherAssignment.createMany({
    data: [
      {
        teacherId: teacherProfile.id,
        subjectId: createdSubjects["MTH101"].id,
        classId: createdClasses["Grade 10"].id,
        sectionId: grade10A.id,
        academicYearId: currentYear.id,
      },
      {
        teacherId: teacherProfile.id,
        subjectId: createdSubjects["MTH101"].id,
        classId: createdClasses["Grade 10"].id,
        sectionId: grade10B.id,
        academicYearId: currentYear.id,
      },
      {
        teacherId: teacherProfile.id,
        subjectId: createdSubjects["CSC101"].id,
        classId: createdClasses["ICS Part-I"].id,
        sectionId: icsPart1A.id,
        academicYearId: currentYear.id,
      },
    ],
  });

  // 9. Demo Student (Grade 10-A)
  const demoStudent = await prisma.student.create({
    data: {
      userId: studentUser.id,
      admissionNumber: "ADM25001",
      rollNumber: "101",
      firstName: "Ahmed",
      lastName: "Raza",
      gender: Gender.MALE,
      bloodGroup: BloodGroup.B_POS,
      dateOfBirth: new Date("2009-04-12"),
      sectionId: grade10A.id,
      academicYearId: currentYear.id,
      fatherName: "Tariq Raza",
      guardianName: "Tariq Raza",
      guardianPhone: "+92 321 9876543",
      guardianEmail: "tariq.raza@example.com",
      address: "House 28, Street 4, G-9/1",
      city: "Islamabad",
      province: "Federal Capital",
    },
  });

  // Additional 24 Students
  const sampleStudents = [
    { first: "Bilal", last: "Khan", gender: Gender.MALE, blood: BloodGroup.A_POS, roll: "102", sec: "Grade 10-A" },
    { first: "Ayesha", last: "Siddiqui", gender: Gender.FEMALE, blood: BloodGroup.O_POS, roll: "103", sec: "Grade 10-A" },
    { first: "Hamza", last: "Tariq", gender: Gender.MALE, blood: BloodGroup.AB_POS, roll: "104", sec: "Grade 10-A" },
    { first: "Zainab", last: "Bibi", gender: Gender.FEMALE, blood: BloodGroup.B_NEG, roll: "105", sec: "Grade 10-A" },
    { first: "Usman", last: "Ghani", gender: Gender.MALE, blood: BloodGroup.O_NEG, roll: "106", sec: "Grade 10-A" },
    { first: "Mariam", last: "Nawaz", gender: Gender.FEMALE, blood: BloodGroup.A_POS, roll: "101", sec: "Grade 10-B" },
    { first: "Saad", last: "Farooq", gender: Gender.MALE, blood: BloodGroup.B_POS, roll: "102", sec: "Grade 10-B" },
    { first: "Hassan", last: "Ali", gender: Gender.MALE, blood: BloodGroup.AB_NEG, roll: "101", sec: "Grade 9-A" },
    { first: "Hira", last: "Mani", gender: Gender.FEMALE, blood: BloodGroup.O_POS, roll: "102", sec: "Grade 9-A" },
    { first: "Danish", last: "Taimoor", gender: Gender.MALE, blood: BloodGroup.A_NEG, roll: "101", sec: "ICS Part-I-A" },
    { first: "Saba", last: "Qamar", gender: Gender.FEMALE, blood: BloodGroup.B_POS, roll: "102", sec: "ICS Part-I-A" },
    { first: "Fahad", last: "Mustafa", gender: Gender.MALE, blood: BloodGroup.O_POS, roll: "101", sec: "ICS Part-II-A" },
    { first: "Mahira", last: "Khan", gender: Gender.FEMALE, blood: BloodGroup.A_POS, roll: "101", sec: "Pre-Engineering Part-I-A" },
    { first: "Humayun", last: "Saeed", gender: Gender.MALE, blood: BloodGroup.B_POS, roll: "101", sec: "Pre-Medical Part-I-A" },
  ];

  const allCreatedStudents = [demoStudent];

  for (let i = 0; i < sampleStudents.length; i++) {
    const s = sampleStudents[i];
    const u = await prisma.user.create({
      data: {
        email: `student${i + 2}@edumanage.demo`,
        passwordHash: studentPasswordHash,
        role: Role.STUDENT,
      },
    });

    const studentRecord = await prisma.student.create({
      data: {
        userId: u.id,
        admissionNumber: `ADM25${(i + 2).toString().padStart(3, "0")}`,
        rollNumber: s.roll,
        firstName: s.first,
        lastName: s.last,
        gender: s.gender,
        bloodGroup: s.blood,
        sectionId: createdSections[s.sec].id,
        academicYearId: currentYear.id,
        fatherName: `${s.last} Sr.`,
        guardianName: `${s.last} Sr.`,
        guardianPhone: `+92 300 555${(i + 100).toString()}`,
        city: "Islamabad",
      },
    });
    allCreatedStudents.push(studentRecord);
  }

  // 10. Fee Structures
  const grade10Fee = await prisma.feeStructure.create({
    data: {
      classId: createdClasses["Grade 10"].id,
      academicYearId: currentYear.id,
      name: "Grade 10 Standard Fee 2025-2026",
      feeType: FeeType.MONTHLY,
      effectiveDate: new Date("2025-08-01"),
      feeItems: {
        create: [
          { name: "Tuition Fee", amount: 5000 },
          { name: "Computer Laboratory Fee", amount: 1000 },
          { name: "Examination & Assessment Fee", amount: 800 },
          { name: "Library & Sports Fund", amount: 700 },
        ],
      },
    },
  });

  const icsFee = await prisma.feeStructure.create({
    data: {
      classId: createdClasses["ICS Part-I"].id,
      academicYearId: currentYear.id,
      name: "ICS Part-I Standard Fee 2025-2026",
      feeType: FeeType.MONTHLY,
      effectiveDate: new Date("2025-08-01"),
      feeItems: {
        create: [
          { name: "Tuition Fee", amount: 6500 },
          { name: "Computer Science Lab", amount: 1500 },
          { name: "Examination Fee", amount: 1000 },
        ],
      },
    },
  });

  // 11. Challans & Payments
  const now = new Date();
  const currentMonthNum = now.getMonth() + 1;
  const currentYearNum = now.getFullYear();

  // Create challans for all students for current month
  for (let i = 0; i < allCreatedStudents.length; i++) {
    const student = allCreatedStudents[i];
    const isPaid = i % 2 === 0 && student.id !== demoStudent.id; // Demo student is unpaid for testing

    const challan = await prisma.challan.create({
      data: {
        challanNumber: `CHN-${currentYearNum}${currentMonthNum.toString().padStart(2, "0")}-${(i + 101).toString()}`,
        studentId: student.id,
        sectionId: student.sectionId,
        academicYearId: currentYear.id,
        month: currentMonthNum,
        year: currentYearNum,
        issueDate: new Date(currentYearNum, currentMonthNum - 1, 1),
        dueDate: new Date(currentYearNum, currentMonthNum - 1, 15),
        status: isPaid ? ChallanStatus.PAID : ChallanStatus.UNPAID,
        totalAmount: 7500,
        discount: 0,
        fine: 0,
        challanItems: {
          create: [
            { name: "Tuition Fee", amount: 5000 },
            { name: "Computer Lab Fee", amount: 1000 },
            { name: "Assessment Fee", amount: 800 },
            { name: "Sports Fund", amount: 700 },
          ],
        },
      },
    });

    if (isPaid) {
      await prisma.payment.create({
        data: {
          challanId: challan.id,
          paymentDate: new Date(currentYearNum, currentMonthNum - 1, 8),
          amountReceived: 7500,
          paymentMethod: PaymentMethod.BANK,
          transactionRef: `HBL-TRX-${i + 90001}`,
          remarks: "Monthly fee deposited via HBL Online Portal",
          collectedBy: adminUser.id,
        },
      });
    }
  }

  // 12. Attendance Records (Last 10 weekdays)
  for (let d = 1; d <= 10; d++) {
    const attDate = new Date();
    attDate.setDate(now.getDate() - d);
    attDate.setHours(0, 0, 0, 0);

    // Skip weekends
    if (attDate.getDay() === 0 || attDate.getDay() === 6) continue;

    for (const student of allCreatedStudents) {
      const isAbsent = Math.random() < 0.08;
      const isLate = !isAbsent && Math.random() < 0.05;
      const status = isAbsent
        ? AttendanceStatus.ABSENT
        : isLate
        ? AttendanceStatus.LATE
        : AttendanceStatus.PRESENT;

      await prisma.attendance.create({
        data: {
          studentId: student.id,
          sectionId: student.sectionId,
          academicYearId: currentYear.id,
          date: attDate,
          status,
          markedById: teacherUser.id,
        },
      });
    }
  }

  // 13. Examination, Schedules & Marks
  const midTermExam = await prisma.exam.create({
    data: {
      name: "Mid Term Examination 2026",
      type: "MID_TERM",
      academicYearId: currentYear.id,
      classId: createdClasses["Grade 10"].id,
      startDate: new Date("2026-03-10"),
      endDate: new Date("2026-03-22"),
      status: ExamStatus.SCHEDULED,
    },
  });

  const mathSchedule = await prisma.examSchedule.create({
    data: {
      examId: midTermExam.id,
      sectionId: grade10A.id,
      subjectId: createdSubjects["MTH101"].id,
      date: new Date("2026-03-12"),
      startTime: "09:00",
      endTime: "12:00",
      room: "Hall-A",
      maxMarks: 100,
    },
  });

  const csSchedule = await prisma.examSchedule.create({
    data: {
      examId: midTermExam.id,
      sectionId: grade10A.id,
      subjectId: createdSubjects["CSC101"].id,
      date: new Date("2026-03-15"),
      startTime: "09:00",
      endTime: "11:30",
      room: "Lab-1",
      maxMarks: 75,
    },
  });

  // Seed marks for demo student and grade 10-A students
  const grade10Students = allCreatedStudents.filter(
    (s) => s.sectionId === grade10A.id
  );

  for (const s of grade10Students) {
    const mathScore = Math.floor(Math.random() * 25 + 72); // 72-97
    const csScore = Math.floor(Math.random() * 18 + 55);   // 55-73

    await prisma.mark.create({
      data: {
        examScheduleId: mathSchedule.id,
        studentId: s.id,
        obtainedMarks: mathScore,
        remarks: "Excellent grasp of algebra and geometry.",
      },
    });

    await prisma.mark.create({
      data: {
        examScheduleId: csSchedule.id,
        studentId: s.id,
        obtainedMarks: csScore,
        remarks: "Strong programming fundamentals.",
      },
    });
  }

  // 14. Campus Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: "Mid Term Examination 2026 Date Sheet Announced",
        content:
          "The official date sheet for Mid Term Examinations has been published. All students are advised to check their schedules and ensure full clearance of fee dues.",
        target: AnnouncementTarget.EVERYONE,
        priority: AnnouncementPriority.HIGH,
        publishDate: new Date(),
      },
      {
        title: "Monthly Fee Challan Submission Deadline",
        content:
          "Please deposit monthly tuition fees by the 15th of the current month to avoid late fee surcharges. Triplicate receipts can be downloaded from the student portal.",
        target: AnnouncementTarget.STUDENTS,
        priority: AnnouncementPriority.URGENT,
        publishDate: new Date(),
      },
      {
        title: "Faculty Academic Coordination Meeting",
        content:
          "All teaching staff are requested to attend the term review meeting on Friday at 02:00 PM in the Principal's Conference Hall.",
        target: AnnouncementTarget.TEACHERS,
        priority: AnnouncementPriority.NORMAL,
        publishDate: new Date(),
      },
    ],
  });

  // 15. Audit Logs for Realistic Dashboard Events
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: "CHALLAN_BATCH_GENERATED",
        entity: "Challan",
        details: "Generated 15 monthly fee challans for current term cycle.",
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        userId: adminUser.id,
        action: "PAYMENT_RECORDED",
        entity: "Payment",
        details: "Challan #CHN-202609-102 marked paid via HBL Bank.",
        createdAt: new Date(Date.now() - 1000 * 60 * 120),
      },
      {
        userId: adminUser.id,
        action: "STUDENT_ADMITTED",
        entity: "Student",
        details: "New student Ahmed Raza (ADM25001) enrolled in Grade 10-A.",
        createdAt: new Date(Date.now() - 1000 * 60 * 360),
      },
      {
        userId: teacherUser.id,
        action: "MARKS_SUBMITTED",
        entity: "Mark",
        details: "Mathematics Mid Term marks entered for Grade 10-A.",
        createdAt: new Date(Date.now() - 1000 * 60 * 720),
      },
    ],
  });

  console.log("✅ EduManage database seeded successfully with realistic data!");
  console.log(`
  ═════════════════════════════════════════════════════════════════
  🎓 DEMO CREDENTIALS:
  ─────────────────────────────────────────────────────────────────
  Admin:   admin@edumanage.demo   /  Admin@123
  Teacher: teacher@edumanage.demo /  Teacher@123
  Student: student@edumanage.demo /  Student@123
  ═════════════════════════════════════════════════════════════════
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
