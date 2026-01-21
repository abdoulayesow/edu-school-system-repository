import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "../ui/.env" });

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

const pool = new Pool({ connectionString, max: 5 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to safely run queries with error handling
async function safeCount(fn: () => Promise<number>): Promise<number> {
  try {
    return await fn();
  } catch (e) {
    return -1;
  }
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║              COMPREHENSIVE DATABASE ANALYSIS REPORT                          ║");
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 1: ALL TABLE RECORD COUNTS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
  console.log("│ SECTION 1: TABLE RECORD COUNTS (ALL TABLES)                                 │");
  console.log("└──────────────────────────────────────────────────────────────────────────────┘\n");

  // Batch 1: Core Identity & Profiles
  console.log("  IDENTITY & AUTH:");
  const userCount = await prisma.user.count();
  console.log(`    User                          ${userCount.toString().padStart(6)}`);
  const personCount = await prisma.person.count();
  console.log(`    Person                        ${personCount.toString().padStart(6)}`);
  const accountCount = await prisma.account.count();
  console.log(`    Account                       ${accountCount.toString().padStart(6)}`);
  const sessionCount = await prisma.session.count();
  console.log(`    Session                       ${sessionCount.toString().padStart(6)}`);
  const addressCount = await prisma.address.count();
  console.log(`    Address                       ${addressCount.toString().padStart(6)}`);
  console.log();

  console.log("  PROFILES:");
  const studentProfileCount = await prisma.studentProfile.count();
  console.log(`    StudentProfile                ${studentProfileCount.toString().padStart(6)}`);
  const teacherProfileCount = await prisma.teacherProfile.count();
  console.log(`    TeacherProfile                ${teacherProfileCount.toString().padStart(6)}`);
  const parentProfileCount = await prisma.parentProfile.count();
  console.log(`    ParentProfile                 ${parentProfileCount.toString().padStart(6)}`);
  const studentParentCount = await prisma.studentParent.count();
  console.log(`    StudentParent                 ${studentParentCount.toString().padStart(6)}`);
  const studentCount = await prisma.student.count();
  console.log(`    Student (Legacy)              ${studentCount.toString().padStart(6)}`);
  console.log();

  console.log("  ACADEMIC STRUCTURE:");
  const schoolYearCount = await prisma.schoolYear.count();
  console.log(`    SchoolYear                    ${schoolYearCount.toString().padStart(6)}`);
  const gradeCount = await prisma.grade.count();
  console.log(`    Grade                         ${gradeCount.toString().padStart(6)}`);
  const subjectCount = await prisma.subject.count();
  console.log(`    Subject                       ${subjectCount.toString().padStart(6)}`);
  const gradeSubjectCount = await prisma.gradeSubject.count();
  console.log(`    GradeSubject                  ${gradeSubjectCount.toString().padStart(6)}`);
  const trimesterCount = await prisma.trimester.count();
  console.log(`    Trimester                     ${trimesterCount.toString().padStart(6)}`);
  const timePeriodCount = await prisma.timePeriod.count();
  console.log(`    TimePeriod                    ${timePeriodCount.toString().padStart(6)}`);
  console.log();

  console.log("  ENROLLMENTS:");
  const enrollmentCount = await prisma.enrollment.count();
  console.log(`    Enrollment                    ${enrollmentCount.toString().padStart(6)}`);
  const gradeEnrollmentCount = await prisma.gradeEnrollment.count();
  console.log(`    GradeEnrollment               ${gradeEnrollmentCount.toString().padStart(6)}`);
  console.log();

  console.log("  ASSIGNMENTS:");
  const classAssignmentCount = await prisma.classAssignment.count();
  console.log(`    ClassAssignment               ${classAssignmentCount.toString().padStart(6)}`);
  const scheduleSlotCount = await prisma.scheduleSlot.count();
  console.log(`    ScheduleSlot                  ${scheduleSlotCount.toString().padStart(6)}`);
  const gradeRoomCount = await prisma.gradeRoom.count();
  console.log(`    GradeRoom                     ${gradeRoomCount.toString().padStart(6)}`);
  const studentRoomAssignmentCount = await prisma.studentRoomAssignment.count();
  console.log(`    StudentRoomAssignment         ${studentRoomAssignmentCount.toString().padStart(6)}`);
  console.log();

  console.log("  PAYMENTS & FINANCE:");
  const paymentCount = await prisma.payment.count();
  console.log(`    Payment                       ${paymentCount.toString().padStart(6)}`);
  const paymentScheduleCount = await prisma.paymentSchedule.count();
  console.log(`    PaymentSchedule               ${paymentScheduleCount.toString().padStart(6)}`);
  const cashDepositCount = await prisma.cashDeposit.count();
  console.log(`    CashDeposit                   ${cashDepositCount.toString().padStart(6)}`);
  const bankDepositCount = await prisma.bankDeposit.count();
  console.log(`    BankDeposit                   ${bankDepositCount.toString().padStart(6)}`);
  const expenseCount = await prisma.expense.count();
  console.log(`    Expense                       ${expenseCount.toString().padStart(6)}`);
  console.log();

  console.log("  TREASURY:");
  const treasuryBalanceCount = await prisma.treasuryBalance.count();
  console.log(`    TreasuryBalance               ${treasuryBalanceCount.toString().padStart(6)}`);
  const safeTransactionCount = await prisma.safeTransaction.count();
  console.log(`    SafeTransaction               ${safeTransactionCount.toString().padStart(6)}`);
  const bankTransferCount = await prisma.bankTransfer.count();
  console.log(`    BankTransfer                  ${bankTransferCount.toString().padStart(6)}`);
  const dailyVerificationCount = await prisma.dailyVerification.count();
  console.log(`    DailyVerification             ${dailyVerificationCount.toString().padStart(6)}`);
  const reconciliationEventCount = await prisma.reconciliationEvent.count();
  console.log(`    ReconciliationEvent           ${reconciliationEventCount.toString().padStart(6)}`);
  console.log();

  console.log("  CLUBS:");
  const clubCategoryCount = await prisma.clubCategory.count();
  console.log(`    ClubCategory                  ${clubCategoryCount.toString().padStart(6)}`);
  const clubCount = await prisma.club.count();
  console.log(`    Club                          ${clubCount.toString().padStart(6)}`);
  const clubEnrollmentCount = await prisma.clubEnrollment.count();
  console.log(`    ClubEnrollment                ${clubEnrollmentCount.toString().padStart(6)}`);
  const clubPaymentCount = await prisma.clubPayment.count();
  console.log(`    ClubPayment                   ${clubPaymentCount.toString().padStart(6)}`);
  const clubMonthlyPaymentCount = await prisma.clubMonthlyPayment.count();
  console.log(`    ClubMonthlyPayment            ${clubMonthlyPaymentCount.toString().padStart(6)}`);
  const clubEligibilityRuleCount = await prisma.clubEligibilityRule.count();
  console.log(`    ClubEligibilityRule           ${clubEligibilityRuleCount.toString().padStart(6)}`);
  console.log();

  console.log("  EVALUATIONS:");
  const evaluationCount = await prisma.evaluation.count();
  console.log(`    Evaluation                    ${evaluationCount.toString().padStart(6)}`);
  const subjectTrimesterAverageCount = await prisma.subjectTrimesterAverage.count();
  console.log(`    SubjectTrimesterAverage       ${subjectTrimesterAverageCount.toString().padStart(6)}`);
  const studentTrimesterCount = await prisma.studentTrimester.count();
  console.log(`    StudentTrimester              ${studentTrimesterCount.toString().padStart(6)}`);
  const classTrimesterStatsCount = await prisma.classTrimesterStats.count();
  console.log(`    ClassTrimesterStats           ${classTrimesterStatsCount.toString().padStart(6)}`);
  console.log();

  console.log("  ATTENDANCE:");
  const attendanceSessionCount = await prisma.attendanceSession.count();
  console.log(`    AttendanceSession             ${attendanceSessionCount.toString().padStart(6)}`);
  const attendanceRecordCount = await prisma.attendanceRecord.count();
  console.log(`    AttendanceRecord              ${attendanceRecordCount.toString().padStart(6)}`);
  console.log();

  console.log("  MISC:");
  const enrollmentNoteCount = await prisma.enrollmentNote.count();
  console.log(`    EnrollmentNote                ${enrollmentNoteCount.toString().padStart(6)}`);
  const userInvitationCount = await prisma.userInvitation.count();
  console.log(`    UserInvitation                ${userInvitationCount.toString().padStart(6)}`);
  console.log();

  console.log("  PERMISSIONS:");
  const rolePermissionCount = await prisma.rolePermission.count();
  console.log(`    RolePermission                ${rolePermissionCount.toString().padStart(6)}`);
  const permissionOverrideCount = await prisma.permissionOverride.count();
  console.log(`    PermissionOverride            ${permissionOverrideCount.toString().padStart(6)}`);
  const auditLogCount = await prisma.auditLog.count();
  console.log(`    AuditLog                      ${auditLogCount.toString().padStart(6)}`);
  console.log();

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 2: IDENTITY LAYER ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
  console.log("│ SECTION 2: IDENTITY LAYER ANALYSIS (User ↔ Person ↔ Profiles)              │");
  console.log("└──────────────────────────────────────────────────────────────────────────────┘\n");

  // Person ↔ Profile relationships
  const personsWithStudentProfile = await prisma.person.count({
    where: { studentProfile: { isNot: null } },
  });
  const personsWithTeacherProfile = await prisma.person.count({
    where: { teacherProfile: { isNot: null } },
  });
  const personsWithParentProfile = await prisma.person.count({
    where: { parentProfile: { isNot: null } },
  });

  console.log("  PERSON → PROFILE RELATIONSHIPS:");
  console.log(`    Persons with StudentProfile:  ${personsWithStudentProfile}`);
  console.log(`    Persons with TeacherProfile:  ${personsWithTeacherProfile}`);
  console.log(`    Persons with ParentProfile:   ${personsWithParentProfile}`);
  console.log(`    Persons with NO profile:      ${personCount - personsWithStudentProfile - personsWithTeacherProfile - personsWithParentProfile}`);
  console.log();

  // Check orphan StudentProfiles
  const allStudentProfiles = await prisma.studentProfile.findMany({
    select: { id: true, personId: true, studentId: true },
  });
  const allPersonIds = new Set(
    (await prisma.person.findMany({ select: { id: true } })).map((p) => p.id)
  );
  const orphanStudentProfiles = allStudentProfiles.filter(
    (sp) => !allPersonIds.has(sp.personId)
  );
  const studentProfilesWithStudentId = allStudentProfiles.filter(sp => sp.studentId !== null).length;

  console.log("  STUDENTPROFILE INTEGRITY:");
  console.log(`    Total StudentProfiles:        ${studentProfileCount}`);
  console.log(`    With valid personId:          ${studentProfileCount - orphanStudentProfiles.length}`);
  console.log(`    With studentId (legacy):      ${studentProfilesWithStudentId}`);
  console.log(`    ORPHAN (invalid personId):    ${orphanStudentProfiles.length} ⚠️`);
  console.log();

  // User ↔ TeacherProfile
  const usersWithStaffProfile = await prisma.user.count({
    where: { staffProfileId: { not: null } },
  });

  console.log("  USER ↔ TEACHERPROFILE (Staff Link):");
  console.log(`    Users with staffProfileId:    ${usersWithStaffProfile}`);
  console.log();

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 3: LEGACY STUDENT TABLE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
  console.log("│ SECTION 3: LEGACY STUDENT TABLE ANALYSIS                                    │");
  console.log("└──────────────────────────────────────────────────────────────────────────────┘\n");

  const studentsWithProfile = await prisma.student.count({
    where: { studentProfile: { isNot: null } },
  });

  // Check Student ↔ StudentProfile via studentId
  const allStudents = await prisma.student.findMany({ select: { id: true } });
  const studentIdsInProfiles = new Set(
    allStudentProfiles.filter(sp => sp.studentId).map((sp) => sp.studentId!)
  );
  const studentsLinkedToProfiles = allStudents.filter((s) =>
    studentIdsInProfiles.has(s.id)
  ).length;

  console.log("  STUDENT → STUDENTPROFILE BRIDGE:");
  console.log(`    Total Students (legacy):      ${studentCount}`);
  console.log(`    Students with profile link:   ${studentsWithProfile}`);
  console.log(`    Linked via StudentProfile.studentId: ${studentsLinkedToProfiles}`);
  console.log(`    Students WITHOUT profile:     ${studentCount - studentsWithProfile} ⚠️`);
  console.log();

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 4: ENROLLMENT DATA INTEGRITY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
  console.log("│ SECTION 4: ENROLLMENT DATA INTEGRITY                                        │");
  console.log("└──────────────────────────────────────────────────────────────────────────────┘\n");

  const enrollmentsWithStudentId = await prisma.enrollment.count({
    where: { studentId: { not: null } },
  });
  const enrollmentsWithoutStudentId = enrollmentCount - enrollmentsWithStudentId;

  // Verify Enrollment.studentId points to Student.id
  const enrollmentStudentIds = (
    await prisma.enrollment.findMany({
      where: { studentId: { not: null } },
      select: { studentId: true },
      distinct: ["studentId"],
    })
  ).map((e) => e.studentId!);

  const allStudentIds = new Set(allStudents.map((s) => s.id));
  const validEnrollmentStudentIds = enrollmentStudentIds.filter((id) =>
    allStudentIds.has(id)
  ).length;

  console.log("  ENROLLMENT.studentId ANALYSIS:");
  console.log(`    Total Enrollments:            ${enrollmentCount}`);
  console.log(`    With studentId:               ${enrollmentsWithStudentId}`);
  console.log(`    Without studentId (NULL):     ${enrollmentsWithoutStudentId} ⚠️`);
  console.log(`    Unique studentId values:      ${enrollmentStudentIds.length}`);
  console.log(`    Valid → Student.id:           ${validEnrollmentStudentIds}/${enrollmentStudentIds.length}`);
  console.log();

  // Enrollment status distribution
  const enrollmentByStatus = await prisma.enrollment.groupBy({
    by: ["status"],
    _count: true,
  });
  console.log("  ENROLLMENT STATUS DISTRIBUTION:");
  for (const item of enrollmentByStatus) {
    console.log(`    ${item.status.padEnd(15)} ${item._count}`);
  }
  console.log();

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 5: USER ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
  console.log("│ SECTION 5: USER & AUTHENTICATION ANALYSIS                                   │");
  console.log("└──────────────────────────────────────────────────────────────────────────────┘\n");

  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  });
  const usersByStatus = await prisma.user.groupBy({
    by: ["status"],
    _count: true,
  });

  console.log("  USER BY ROLE:");
  for (const item of usersByRole) {
    console.log(`    ${item.role.padEnd(20)} ${item._count}`);
  }
  console.log();

  console.log("  USER BY STATUS:");
  for (const item of usersByStatus) {
    console.log(`    ${item.status.padEnd(15)} ${item._count}`);
  }
  console.log();

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6: ACADEMIC STRUCTURE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
  console.log("│ SECTION 6: ACADEMIC STRUCTURE INTEGRITY                                     │");
  console.log("└──────────────────────────────────────────────────────────────────────────────┘\n");

  const schoolYearsByStatus = await prisma.schoolYear.groupBy({
    by: ["status"],
    _count: true,
  });
  const gradesByLevel = await prisma.grade.groupBy({
    by: ["level"],
    _count: true,
  });

  console.log("  SCHOOL YEAR STATUS:");
  for (const item of schoolYearsByStatus) {
    console.log(`    ${item.status.padEnd(15)} ${item._count}`);
  }
  console.log();

  console.log("  GRADES BY LEVEL:");
  for (const item of gradesByLevel) {
    console.log(`    ${item.level.padEnd(15)} ${item._count}`);
  }
  console.log();

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 7: PAYMENT ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
  console.log("│ SECTION 7: PAYMENT & FINANCIAL INTEGRITY                                    │");
  console.log("└──────────────────────────────────────────────────────────────────────────────┘\n");

  const paymentsByStatus = await prisma.payment.groupBy({
    by: ["status"],
    _count: true,
  });
  const paymentsByMethod = await prisma.payment.groupBy({
    by: ["method"],
    _count: true,
  });

  const paymentsWithEnrollment = await prisma.payment.count({
    where: { enrollmentId: { not: null } },
  });
  const paymentsWithClubEnrollment = await prisma.payment.count({
    where: { clubEnrollmentId: { not: null } },
  });
  const orphanPayments = paymentCount - paymentsWithEnrollment - paymentsWithClubEnrollment;

  console.log("  PAYMENT STATUS:");
  for (const item of paymentsByStatus) {
    console.log(`    ${item.status.padEnd(15)} ${item._count}`);
  }
  console.log();

  console.log("  PAYMENT METHOD:");
  for (const item of paymentsByMethod) {
    console.log(`    ${item.method.padEnd(15)} ${item._count}`);
  }
  console.log();

  console.log("  PAYMENT LINKAGE:");
  console.log(`    Linked to Enrollment:         ${paymentsWithEnrollment}`);
  console.log(`    Linked to ClubEnrollment:     ${paymentsWithClubEnrollment}`);
  console.log(`    ORPHAN (no link):             ${orphanPayments > 0 ? orphanPayments + " ⚠️" : "0"}`);
  console.log();

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 8: CLUB SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
  console.log("│ SECTION 8: CLUB SYSTEM ANALYSIS                                             │");
  console.log("└──────────────────────────────────────────────────────────────────────────────┘\n");

  const clubsByStatus = await prisma.club.groupBy({
    by: ["status"],
    _count: true,
  });

  console.log("  CLUB STATUS:");
  for (const item of clubsByStatus) {
    console.log(`    ${item.status.padEnd(15)} ${item._count}`);
  }
  console.log();

  console.log("  CLUB ENROLLMENT STATUS:");
  console.log(`    Total club enrollments:       ${clubEnrollmentCount}`);
  console.log(`    Total club payments:          ${clubPaymentCount}`);
  console.log();

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 9: TREASURY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
  console.log("│ SECTION 9: TREASURY SYSTEM ANALYSIS                                         │");
  console.log("└──────────────────────────────────────────────────────────────────────────────┘\n");

  const treasuryBalance = await prisma.treasuryBalance.findFirst();
  if (treasuryBalance) {
    console.log("  CURRENT BALANCES:");
    console.log(`    Registry:                     ${treasuryBalance.registryBalance.toLocaleString()} GNF`);
    console.log(`    Safe:                         ${treasuryBalance.safeBalance.toLocaleString()} GNF`);
    console.log(`    Bank:                         ${treasuryBalance.bankBalance.toLocaleString()} GNF`);
    console.log(`    Mobile Money:                 ${treasuryBalance.mobileMoneyBalance.toLocaleString()} GNF`);
  } else {
    console.log("  No treasury balance record found");
  }
  console.log();

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 10: DATA INTEGRITY ISSUES SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("╔══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║                    DATA INTEGRITY ISSUES SUMMARY                             ║");
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝\n");

  const issues: { severity: string; issue: string; count: number; recommendation: string }[] = [];

  if (orphanStudentProfiles.length > 0) {
    issues.push({
      severity: "HIGH",
      issue: "Orphan StudentProfiles (invalid personId)",
      count: orphanStudentProfiles.length,
      recommendation: "Create missing Person records or delete orphan profiles",
    });
  }

  if (enrollmentsWithoutStudentId > 0) {
    issues.push({
      severity: "MEDIUM",
      issue: "Enrollments without studentId",
      count: enrollmentsWithoutStudentId,
      recommendation: "Link enrollments to Student records",
    });
  }

  const studentsWithoutProfileCount = studentCount - studentsWithProfile;
  if (studentsWithoutProfileCount > 0) {
    issues.push({
      severity: "MEDIUM",
      issue: "Legacy Students without StudentProfile",
      count: studentsWithoutProfileCount,
      recommendation: "Create StudentProfile records for legacy students",
    });
  }

  if (orphanPayments > 0) {
    issues.push({
      severity: "LOW",
      issue: "Payments without enrollment link",
      count: orphanPayments,
      recommendation: "Investigate and link to appropriate enrollment",
    });
  }

  if (issues.length === 0) {
    console.log("  ✅ No critical data integrity issues found!\n");
  } else {
    console.log(`  Found ${issues.length} issue(s):\n`);
    for (const issue of issues) {
      const icon = issue.severity === "HIGH" ? "🔴" : issue.severity === "MEDIUM" ? "🟡" : "🟢";
      console.log(`  ${icon} [${issue.severity}] ${issue.issue}`);
      console.log(`     Count: ${issue.count}`);
      console.log(`     Fix: ${issue.recommendation}`);
      console.log();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 11: RELATIONSHIP DIAGRAM
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("┌──────────────────────────────────────────────────────────────────────────────┐");
  console.log("│ SECTION 11: DATABASE RELATIONSHIP DIAGRAM                                   │");
  console.log("└──────────────────────────────────────────────────────────────────────────────┘\n");

  console.log(`
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                           IDENTITY LAYER                                    │
  │                                                                             │
  │  ┌──────────┐     ┌──────────────┐     ┌───────────────┐     ┌──────────┐  │
  │  │   User   │     │    Person    │     │StudentProfile │     │ Student  │  │
  │  │ (${userCount.toString().padStart(3)})    │     │   (${personCount.toString().padStart(3)})      │     │    (${studentProfileCount.toString().padStart(3)})      │     │  (${studentCount.toString().padStart(3)})  │  │
  │  └────┬─────┘     └──────┬───────┘     └───────┬───────┘     └────┬─────┘  │
  │       │                  │ 1:1              1:1│                   │ 1:1   │
  │       │                  └──────→personId─────┘                   │       │
  │       │                                        │                   │       │
  │       │                                        └────studentId─────┘       │
  │       │                                                                    │
  │       └─────staffProfileId────→ TeacherProfile (${teacherProfileCount.toString().padStart(3)})                    │
  │                                                                             │
  └─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                          ENROLLMENT LAYER                                   │
  │                                                                             │
  │  ┌───────────────┐              ┌─────────────────┐                         │
  │  │  Enrollment   │──studentId──→│    Student      │ (Legacy reference)      │
  │  │    (${enrollmentCount.toString().padStart(3)})      │              │    (${studentCount.toString().padStart(3)})       │                         │
  │  └───────┬───────┘              └─────────────────┘                         │
  │          │                                                                  │
  │          ├──gradeId────→ Grade (${gradeCount.toString().padStart(3)})                                    │
  │          └──schoolYearId→ SchoolYear (${schoolYearCount.toString().padStart(2)})                              │
  │                                                                             │
  │  ┌─────────────────┐                                                        │
  │  │ GradeEnrollment │──studentProfileId──→ StudentProfile (Modern system)    │
  │  │      (${gradeEnrollmentCount.toString().padStart(3)})      │                                                        │
  │  └─────────────────┘                                                        │
  │                                                                             │
  └─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                           CLUB LAYER                                        │
  │                                                                             │
  │  ┌──────────┐     ┌────────────────┐     ┌─────────────────┐               │
  │  │   Club   │←────│ ClubEnrollment │────→│ StudentProfile  │               │
  │  │   (${clubCount.toString().padStart(2)})   │     │      (${clubEnrollmentCount.toString().padStart(3)})     │     │     (${studentProfileCount.toString().padStart(3)})      │               │
  │  └──────────┘     └────────────────┘     └─────────────────┘               │
  │       │                   │                                                 │
  │       └──eligibilityRule  └──payments──→ Payment / ClubPayment             │
  │                                                                             │
  └─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                         CRITICAL DATA FLOW                                  │
  │                                                                             │
  │  To get student info from Enrollment:                                       │
  │                                                                             │
  │  Enrollment.studentId  →  StudentProfile.studentId  →  StudentProfile       │
  │       (Student.id)           (matches above)              │                 │
  │                                                           ↓                 │
  │                                                    StudentProfile.personId  │
  │                                                           ↓                 │
  │                                                       Person                │
  │                                                   (name, contact info)      │
  │                                                                             │
  └─────────────────────────────────────────────────────────────────────────────┘
`);

  console.log("\n═══════════════════════════════════════════════════════════════════════════════");
  console.log("                            END OF ANALYSIS REPORT");
  console.log("═══════════════════════════════════════════════════════════════════════════════\n");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
