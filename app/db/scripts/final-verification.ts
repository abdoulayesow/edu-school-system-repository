/**
 * Final Database Integrity Verification
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "../ui/.env" });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log("=".repeat(70));
  console.log("FINAL DATABASE INTEGRITY VERIFICATION");
  console.log("=".repeat(70));

  try {
    // Count records
    const personCount = await prisma.person.count();
    const studentProfileCount = await prisma.studentProfile.count();
    const studentCount = await prisma.student.count();
    const enrollmentCount = await prisma.enrollment.count();

    console.log("\n📊 Record Counts:");
    console.log(`  Person: ${personCount}`);
    console.log(`  StudentProfile: ${studentProfileCount}`);
    console.log(`  Student (legacy): ${studentCount}`);
    console.log(`  Enrollment: ${enrollmentCount}`);

    // Issue 1: Enrollments without studentId
    console.log("\n" + "-".repeat(50));
    console.log("Issue 1: Enrollments without studentId");
    const enrollmentsWithoutStudent = await prisma.enrollment.count({
      where: { studentId: null }
    });
    console.log(`  Enrollments without studentId: ${enrollmentsWithoutStudent}`);
    console.log(`  Status: ${enrollmentsWithoutStudent === 0 ? "✅ FIXED" : "❌ STILL BROKEN"}`);

    // Issue 2: Orphan StudentProfiles (invalid personId)
    console.log("\n" + "-".repeat(50));
    console.log("Issue 2: Orphan StudentProfiles (invalid personId)");
    const validPersonIds = new Set(
      (await prisma.person.findMany({ select: { id: true } })).map(p => p.id)
    );
    const allProfiles = await prisma.studentProfile.findMany({ select: { personId: true } });
    const orphanProfiles = allProfiles.filter(sp => !validPersonIds.has(sp.personId));
    console.log(`  Orphan StudentProfiles: ${orphanProfiles.length}`);
    console.log(`  Status: ${orphanProfiles.length === 0 ? "✅ FIXED" : "❌ STILL BROKEN"}`);

    // Issue 3: Students without StudentProfile
    console.log("\n" + "-".repeat(50));
    console.log("Issue 3: Students without StudentProfile");
    const studentsWithoutProfile = await prisma.student.count({
      where: { studentProfile: null }
    });
    console.log(`  Students without StudentProfile: ${studentsWithoutProfile}`);
    console.log(`  Status: ${studentsWithoutProfile === 0 ? "✅ FIXED" : "❌ STILL BROKEN"}`);

    // Additional checks
    console.log("\n" + "-".repeat(50));
    console.log("Additional Data Flow Verification");

    // Sample enrollment data flow
    const sampleEnrollments = await prisma.enrollment.findMany({
      take: 5,
      where: { studentId: { not: null } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentId: true
      }
    });

    let successfulFlows = 0;
    for (const enrollment of sampleEnrollments) {
      // Follow the data flow: Enrollment → Student → StudentProfile → Person
      const studentProfile = await prisma.studentProfile.findFirst({
        where: { studentId: enrollment.studentId! },
        include: { person: true }
      });

      if (studentProfile?.person) {
        successfulFlows++;
      }
    }

    console.log(`  Sample data flow test: ${successfulFlows}/${sampleEnrollments.length} successful`);
    console.log(`  Status: ${successfulFlows === sampleEnrollments.length ? "✅ WORKING" : "⚠️ PARTIAL"}`);

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("SUMMARY");
    console.log("=".repeat(70));

    const allFixed =
      enrollmentsWithoutStudent === 0 &&
      orphanProfiles.length === 0 &&
      studentsWithoutProfile === 0;

    if (allFixed) {
      console.log("\n🎉 ALL DATA INTEGRITY ISSUES HAVE BEEN FIXED!");
      console.log("\nDatabase is now in a healthy state:");
      console.log(`  - All ${enrollmentCount} enrollments have valid studentId`);
      console.log(`  - All ${studentProfileCount} StudentProfiles have valid personId`);
      console.log(`  - All ${studentCount} Students have a StudentProfile`);
    } else {
      console.log("\n⚠️ Some issues remain:");
      if (enrollmentsWithoutStudent > 0) {
        console.log(`  - ${enrollmentsWithoutStudent} enrollments need studentId`);
      }
      if (orphanProfiles.length > 0) {
        console.log(`  - ${orphanProfiles.length} orphan StudentProfiles`);
      }
      if (studentsWithoutProfile > 0) {
        console.log(`  - ${studentsWithoutProfile} Students need StudentProfile`);
      }
    }

  } finally {
    await pool.end();
  }
}

main().catch(console.error);
