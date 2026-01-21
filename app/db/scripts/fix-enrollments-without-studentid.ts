/**
 * Fix Enrollments Without studentId
 *
 * This script investigates and fixes 254 enrollments that have NULL studentId.
 * Strategy:
 * 1. Analyze the enrollments to understand what data they have
 * 2. Try to match them to existing Student records by name + dateOfBirth
 * 3. Create new Student records for unmatched enrollments
 * 4. Link all enrollments to their Student records
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "../ui/.env" });

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

const pool = new Pool({ connectionString, max: 5 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Dry run mode - set to false to actually make changes
const DRY_RUN = false;

async function main() {
  console.log("=".repeat(80));
  console.log("FIX ENROLLMENTS WITHOUT studentId");
  console.log("=".repeat(80));
  console.log(`Mode: ${DRY_RUN ? "🔍 DRY RUN (no changes)" : "⚠️ LIVE (making changes)"}\n`);

  try {
    // ========================================================================
    // SECTION 1: Analyze orphan enrollments
    // ========================================================================
    console.log("\n" + "=".repeat(60));
    console.log("SECTION 1: Analyzing Enrollments without studentId");
    console.log("=".repeat(60));

    const orphanEnrollments = await prisma.enrollment.findMany({
      where: { studentId: null },
      include: {
        schoolYear: { select: { name: true } },
        grade: { select: { name: true } }
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
    });

    console.log(`\n📊 Found ${orphanEnrollments.length} enrollments without studentId\n`);

    // Analyze by status
    const byStatus: Record<string, number> = {};
    orphanEnrollments.forEach(e => {
      byStatus[e.status] = (byStatus[e.status] || 0) + 1;
    });
    console.log("By Status:");
    Object.entries(byStatus).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Analyze by school year
    const byYear: Record<string, number> = {};
    orphanEnrollments.forEach(e => {
      const year = e.schoolYear?.name || "Unknown";
      byYear[year] = (byYear[year] || 0) + 1;
    });
    console.log("\nBy School Year:");
    Object.entries(byYear).sort((a, b) => b[1] - a[1]).forEach(([year, count]) => {
      console.log(`  ${year}: ${count}`);
    });

    // Analyze by grade
    const byGrade: Record<string, number> = {};
    orphanEnrollments.forEach(e => {
      const grade = e.grade?.name || "Unknown";
      byGrade[grade] = (byGrade[grade] || 0) + 1;
    });
    console.log("\nBy Grade:");
    Object.entries(byGrade).sort((a, b) => b[1] - a[1]).forEach(([grade, count]) => {
      console.log(`  ${grade}: ${count}`);
    });

    // Sample of orphan enrollments
    console.log("\n📋 Sample of orphan enrollments (first 10):");
    orphanEnrollments.slice(0, 10).forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.firstName} ${e.lastName}`);
      console.log(`     DOB: ${e.dateOfBirth?.toISOString().split("T")[0] || "null"}`);
      console.log(`     Grade: ${e.grade?.name}, Year: ${e.schoolYear?.name}`);
      console.log(`     Status: ${e.status}`);
    });

    // ========================================================================
    // SECTION 2: Match to existing Students
    // ========================================================================
    console.log("\n" + "=".repeat(60));
    console.log("SECTION 2: Matching to Existing Student Records");
    console.log("=".repeat(60));

    // Get all existing students for matching
    const allStudents = await prisma.student.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        studentNumber: true
      }
    });

    console.log(`\n📊 ${allStudents.length} existing Student records to match against\n`);

    // Create lookup maps
    const studentNameOnlyMap = new Map<string, typeof allStudents[0][]>();

    allStudents.forEach(s => {
      const nameKey = `${s.firstName.trim().toLowerCase()}|${s.lastName.trim().toLowerCase()}`;
      if (!studentNameOnlyMap.has(nameKey)) {
        studentNameOnlyMap.set(nameKey, []);
      }
      studentNameOnlyMap.get(nameKey)!.push(s);
    });

    // Attempt to match each orphan enrollment
    const matched: { enrollment: typeof orphanEnrollments[0], student: typeof allStudents[0], matchType: string }[] = [];
    const unmatched: typeof orphanEnrollments = [];
    const ambiguous: { enrollment: typeof orphanEnrollments[0], candidates: typeof allStudents }[] = [];

    for (const enrollment of orphanEnrollments) {
      const nameKey = `${enrollment.firstName.trim().toLowerCase()}|${enrollment.lastName.trim().toLowerCase()}`;
      const enrollmentDOB = enrollment.dateOfBirth?.toISOString().split("T")[0] || null;

      const nameMatches = studentNameOnlyMap.get(nameKey) || [];

      if (nameMatches.length === 0) {
        // No student with this name - will need to create one
        unmatched.push(enrollment);
        continue;
      }

      if (nameMatches.length === 1) {
        const student = nameMatches[0];
        const studentDOB = student.dateOfBirth?.toISOString().split("T")[0] || null;

        // If both have DOB and they match, it's an exact match
        if (enrollmentDOB && studentDOB && enrollmentDOB === studentDOB) {
          matched.push({ enrollment, student, matchType: "exact (name + DOB)" });
          continue;
        }

        // If both have DOB but they're different, DON'T match (different people)
        if (enrollmentDOB && studentDOB && enrollmentDOB !== studentDOB) {
          unmatched.push(enrollment);
          continue;
        }

        // If one or both DOBs are null, safe to match by name only
        matched.push({ enrollment, student, matchType: "name only (DOB unavailable)" });
        continue;
      }

      // Multiple students with same name - try to match by DOB
      if (enrollmentDOB) {
        const dobMatch = nameMatches.find(s =>
          s.dateOfBirth?.toISOString().split("T")[0] === enrollmentDOB
        );
        if (dobMatch) {
          matched.push({ enrollment, student: dobMatch, matchType: "exact (name + DOB)" });
          continue;
        }
      }

      // Ambiguous - multiple students, can't match by DOB
      // Mark as needing new Student record (safer than random assignment)
      ambiguous.push({ enrollment, candidates: nameMatches });
      unmatched.push(enrollment);
    }

    console.log(`✅ Matched: ${matched.length}`);
    console.log(`  - Exact (name + DOB): ${matched.filter(m => m.matchType.includes("exact")).length}`);
    console.log(`  - Name only (unique): ${matched.filter(m => m.matchType.includes("name only")).length}`);
    console.log(`⚠️ Ambiguous (will create new): ${ambiguous.length}`);
    console.log(`❌ No match exists: ${unmatched.length - ambiguous.length}`);
    console.log(`📋 Total needing new Student: ${unmatched.length}`);

    // Show sample matches
    console.log("\n📋 Sample matches (first 10):");
    matched.slice(0, 10).forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.enrollment.firstName} ${m.enrollment.lastName}`);
      console.log(`     → Student ID: ${m.student.id}`);
      console.log(`     → Student #: ${m.student.studentNumber || "null"}`);
      console.log(`     → Match type: ${m.matchType}`);
    });

    // Show ambiguous cases
    if (ambiguous.length > 0) {
      console.log("\n⚠️ Ambiguous enrollments (first 5):");
      ambiguous.slice(0, 5).forEach((a, i) => {
        console.log(`  ${i + 1}. ${a.enrollment.firstName} ${a.enrollment.lastName}`);
        console.log(`     Enrollment DOB: ${a.enrollment.dateOfBirth?.toISOString().split("T")[0] || "null"}`);
        console.log(`     Candidate Students:`);
        a.candidates.forEach((c, j) => {
          console.log(`       ${j + 1}. ID: ${c.id}, DOB: ${c.dateOfBirth?.toISOString().split("T")[0] || "null"}`);
        });
      });
    }

    // Show unmatched (no student exists)
    const noMatchExists = unmatched.filter(e => {
      const nameKey = `${e.firstName.trim().toLowerCase()}|${e.lastName.trim().toLowerCase()}`;
      return (studentNameOnlyMap.get(nameKey) || []).length === 0;
    });

    if (noMatchExists.length > 0) {
      console.log("\n❌ No matching student exists (first 10):");
      noMatchExists.slice(0, 10).forEach((e, i) => {
        console.log(`  ${i + 1}. ${e.firstName} ${e.lastName}`);
        console.log(`     DOB: ${e.dateOfBirth?.toISOString().split("T")[0] || "null"}`);
        console.log(`     Grade: ${e.grade?.name}`);
      });
    }

    // ========================================================================
    // SECTION 3: Fix - Link matched enrollments
    // ========================================================================
    console.log("\n" + "=".repeat(60));
    console.log("SECTION 3: Linking Matched Enrollments to Students");
    console.log("=".repeat(60));

    if (matched.length > 0) {
      if (DRY_RUN) {
        console.log(`\n🔍 DRY RUN: Would update ${matched.length} enrollments\n`);
      } else {
        console.log(`\n⏳ Updating ${matched.length} enrollments...\n`);

        let updated = 0;
        let errors = 0;

        for (const m of matched) {
          try {
            await prisma.enrollment.update({
              where: { id: m.enrollment.id },
              data: { studentId: m.student.id }
            });
            updated++;
          } catch (error) {
            errors++;
            console.error(`  ❌ Error updating ${m.enrollment.firstName} ${m.enrollment.lastName}: ${error}`);
          }
        }

        console.log(`✅ Successfully updated: ${updated}`);
        if (errors > 0) {
          console.log(`❌ Errors: ${errors}`);
        }
      }
    }

    // ========================================================================
    // SECTION 4: Fix - Create Students for unmatched enrollments
    // ========================================================================
    console.log("\n" + "=".repeat(60));
    console.log("SECTION 4: Creating Students for Unmatched Enrollments");
    console.log("=".repeat(60));

    if (unmatched.length > 0) {
      if (DRY_RUN) {
        console.log(`\n🔍 DRY RUN: Would create ${unmatched.length} new Student records\n`);

        // Show what would be created
        console.log("Sample of Students that would be created:");
        unmatched.slice(0, 10).forEach((e, i) => {
          console.log(`  ${i + 1}. ${e.firstName} ${e.lastName}`);
          console.log(`     DOB: ${e.dateOfBirth?.toISOString().split("T")[0] || "null"}`);
        });
      } else {
        console.log(`\n⏳ Creating ${unmatched.length} new Student records...\n`);

        let created = 0;
        let linked = 0;
        let errors = 0;

        for (const enrollment of unmatched) {
          try {
            // Create new Student record
            const newStudent = await prisma.student.create({
              data: {
                firstName: enrollment.firstName,
                lastName: enrollment.lastName,
                dateOfBirth: enrollment.dateOfBirth,
                email: enrollment.email,
                guardianName: enrollment.fatherName || enrollment.motherName,
                guardianPhone: enrollment.fatherPhone || enrollment.motherPhone,
                guardianEmail: enrollment.fatherEmail || enrollment.motherEmail,
                grade: enrollment.grade?.name,
                status: "active"
              }
            });
            created++;

            // Link enrollment to new student
            await prisma.enrollment.update({
              where: { id: enrollment.id },
              data: { studentId: newStudent.id }
            });
            linked++;

          } catch (error) {
            errors++;
            console.error(`  ❌ Error creating student for ${enrollment.firstName} ${enrollment.lastName}: ${error}`);
          }
        }

        console.log(`✅ Students created: ${created}`);
        console.log(`✅ Enrollments linked: ${linked}`);
        if (errors > 0) {
          console.log(`❌ Errors: ${errors}`);
        }
      }
    } else {
      console.log("\n✅ No unmatched enrollments to process");
    }

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log("\n" + "=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));
    console.log(`\nTotal orphan enrollments: ${orphanEnrollments.length}`);
    console.log(`  - Can be matched to existing Students: ${matched.length}`);
    console.log(`  - Need new Student records: ${unmatched.length}`);

    if (DRY_RUN) {
      console.log(`\n🔍 This was a DRY RUN. No changes were made.`);
      console.log(`\nTo apply changes, edit the script and set DRY_RUN = false`);
    } else {
      console.log(`\n✅ All changes have been applied.`);
    }

  } finally {
    await pool.end();
  }
}

main()
  .catch(console.error);
