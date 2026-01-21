/**
 * Fix Students Without StudentProfile
 *
 * Creates StudentProfile + Person records for Students that don't have a StudentProfile.
 * This ensures all Students are linked to the modern data model.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "../ui/.env" });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const DRY_RUN = false;

async function main() {
  console.log("=".repeat(60));
  console.log("FIX STUDENTS WITHOUT STUDENTPROFILE");
  console.log("=".repeat(60));
  console.log(`Mode: ${DRY_RUN ? "🔍 DRY RUN" : "⚠️ LIVE"}\n`);

  try {
    // Find Students without StudentProfile
    const studentsWithoutProfile = await prisma.student.findMany({
      where: {
        studentProfile: null
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        email: true,
        guardianName: true,
        guardianPhone: true,
        guardianEmail: true
      }
    });

    console.log(`📊 Students without StudentProfile: ${studentsWithoutProfile.length}`);

    if (studentsWithoutProfile.length === 0) {
      console.log("\n✅ All Students have a StudentProfile!");
      return;
    }

    console.log("\n📋 Sample Students without profile (first 10):");
    studentsWithoutProfile.slice(0, 10).forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.firstName} ${s.lastName}`);
      console.log(`     DOB: ${s.dateOfBirth?.toISOString().split("T")[0] || "null"}`);
    });

    if (DRY_RUN) {
      console.log(`\n🔍 DRY RUN: Would create ${studentsWithoutProfile.length} Person + StudentProfile records`);
      console.log("\nTo apply changes, edit the script and set DRY_RUN = false");
      return;
    }

    console.log(`\n⏳ Creating ${studentsWithoutProfile.length} Person + StudentProfile records...`);

    let created = 0;
    let errors = 0;

    for (const student of studentsWithoutProfile) {
      try {
        // Check if Person with same email already exists (email is unique)
        let existingPerson = null;
        if (student.email) {
          existingPerson = await prisma.person.findUnique({
            where: { email: student.email }
          });
        }

        let person;
        if (existingPerson) {
          // Check if this Person already has a StudentProfile
          const existingProfile = await prisma.studentProfile.findUnique({
            where: { personId: existingPerson.id }
          });

          if (existingProfile) {
            // Update existing profile to link to this Student
            await prisma.studentProfile.update({
              where: { id: existingProfile.id },
              data: { studentId: student.id }
            });
            console.log(`  ℹ️ Updated existing StudentProfile for ${student.firstName} ${student.lastName}`);
            created++;
            continue;
          }

          person = existingPerson;
          console.log(`  ℹ️ Using existing Person for ${student.firstName} ${student.lastName} (email match)`);
        } else {
          // Create new Person record (without email to avoid duplicates)
          person = await prisma.person.create({
            data: {
              firstName: student.firstName,
              lastName: student.lastName,
              dateOfBirth: student.dateOfBirth
              // Skip email to avoid unique constraint issues
            }
          });
        }

        // Create StudentProfile linking Person and Student
        await prisma.studentProfile.create({
          data: {
            personId: person.id,
            studentId: student.id
          }
        });

        created++;
      } catch (error) {
        errors++;
        console.error(`  ❌ Error for ${student.firstName} ${student.lastName}: ${error}`);
      }
    }

    console.log(`\n✅ Created: ${created}`);
    if (errors > 0) {
      console.log(`❌ Errors: ${errors}`);
    }

    // Verify
    const remaining = await prisma.student.count({
      where: { studentProfile: null }
    });
    console.log(`\nStudents still without profile: ${remaining}`);

  } finally {
    await pool.end();
  }
}

main().catch(console.error);
