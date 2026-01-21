/**
 * Fix Orphan StudentProfiles
 *
 * This script investigates and fixes 166 StudentProfiles that have invalid personId
 * (the personId doesn't exist in the Person table).
 *
 * Strategy:
 * 1. Analyze the orphan StudentProfiles
 * 2. For each orphan, look up the linked Student to get name/DOB info
 * 3. Create missing Person records from the Student data
 * 4. Update StudentProfile to link to the new Person
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
  console.log("FIX ORPHAN STUDENT PROFILES");
  console.log("=".repeat(80));
  console.log(`Mode: ${DRY_RUN ? "🔍 DRY RUN (no changes)" : "⚠️ LIVE (making changes)"}\n`);

  try {
    // ========================================================================
    // SECTION 1: Find orphan StudentProfiles
    // ========================================================================
    console.log("\n" + "=".repeat(60));
    console.log("SECTION 1: Finding Orphan StudentProfiles");
    console.log("=".repeat(60));

    // Get all PersonIds
    const allPersons = await prisma.person.findMany({
      select: { id: true }
    });
    const validPersonIds = new Set(allPersons.map(p => p.id));
    console.log(`\n📊 Valid Person records: ${validPersonIds.size}`);

    // Get all StudentProfiles with their linked Student
    const allStudentProfiles = await prisma.studentProfile.findMany({
      include: {
        student: {
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
        }
      }
    });

    console.log(`📊 Total StudentProfiles: ${allStudentProfiles.length}`);

    // Find orphans (personId doesn't exist in Person table)
    const orphanProfiles = allStudentProfiles.filter(sp => !validPersonIds.has(sp.personId));
    console.log(`📊 Orphan StudentProfiles: ${orphanProfiles.length}`);

    if (orphanProfiles.length === 0) {
      console.log("\n✅ No orphan StudentProfiles found!");
      return;
    }

    // Analyze orphans
    console.log("\n📋 Sample orphan StudentProfiles (first 10):");
    orphanProfiles.slice(0, 10).forEach((sp, i) => {
      console.log(`  ${i + 1}. StudentProfile ID: ${sp.id}`);
      console.log(`     Invalid personId: ${sp.personId}`);
      console.log(`     Student: ${sp.student?.firstName || "N/A"} ${sp.student?.lastName || "N/A"}`);
      console.log(`     Student DOB: ${sp.student?.dateOfBirth?.toISOString().split("T")[0] || "null"}`);
    });

    // Check how many have valid Student data
    const withStudent = orphanProfiles.filter(sp => sp.student !== null);
    const withoutStudent = orphanProfiles.filter(sp => sp.student === null);

    console.log(`\n📊 Orphans with valid Student data: ${withStudent.length}`);
    console.log(`📊 Orphans without Student data: ${withoutStudent.length}`);

    // ========================================================================
    // SECTION 2: Create missing Person records
    // ========================================================================
    console.log("\n" + "=".repeat(60));
    console.log("SECTION 2: Creating Missing Person Records");
    console.log("=".repeat(60));

    if (withStudent.length > 0) {
      if (DRY_RUN) {
        console.log(`\n🔍 DRY RUN: Would create ${withStudent.length} Person records`);

        console.log("\nSample Person records to create:");
        withStudent.slice(0, 10).forEach((sp, i) => {
          console.log(`  ${i + 1}. ${sp.student!.firstName} ${sp.student!.lastName}`);
          console.log(`     DOB: ${sp.student!.dateOfBirth?.toISOString().split("T")[0] || "null"}`);
        });
      } else {
        console.log(`\n⏳ Creating ${withStudent.length} Person records...`);

        let created = 0;
        let linked = 0;
        let errors = 0;

        for (const sp of withStudent) {
          try {
            // Create Person record
            const newPerson = await prisma.person.create({
              data: {
                firstName: sp.student!.firstName,
                lastName: sp.student!.lastName,
                dateOfBirth: sp.student!.dateOfBirth,
                email: sp.student!.email,
                type: "student"
              }
            });
            created++;

            // Update StudentProfile to link to new Person
            await prisma.studentProfile.update({
              where: { id: sp.id },
              data: { personId: newPerson.id }
            });
            linked++;

          } catch (error) {
            errors++;
            console.error(`  ❌ Error for ${sp.student?.firstName} ${sp.student?.lastName}: ${error}`);
          }
        }

        console.log(`\n✅ Person records created: ${created}`);
        console.log(`✅ StudentProfiles updated: ${linked}`);
        if (errors > 0) {
          console.log(`❌ Errors: ${errors}`);
        }
      }
    }

    // ========================================================================
    // SECTION 3: Handle orphans without Student data
    // ========================================================================
    console.log("\n" + "=".repeat(60));
    console.log("SECTION 3: Handling Orphans Without Student Data");
    console.log("=".repeat(60));

    if (withoutStudent.length > 0) {
      console.log(`\n⚠️ ${withoutStudent.length} orphan StudentProfiles have no linked Student`);
      console.log("These profiles cannot be fixed automatically.\n");

      console.log("Sample orphans without Student data:");
      withoutStudent.slice(0, 5).forEach((sp, i) => {
        console.log(`  ${i + 1}. StudentProfile ID: ${sp.id}`);
        console.log(`     personId: ${sp.personId}`);
        console.log(`     studentId: ${sp.studentId}`);
      });

      if (!DRY_RUN) {
        console.log(`\n⏳ Deleting ${withoutStudent.length} orphan StudentProfiles with no Student...`);

        let deleted = 0;
        let errors = 0;

        for (const sp of withoutStudent) {
          try {
            await prisma.studentProfile.delete({
              where: { id: sp.id }
            });
            deleted++;
          } catch (error) {
            errors++;
            console.error(`  ❌ Error deleting ${sp.id}: ${error}`);
          }
        }

        console.log(`\n✅ Deleted: ${deleted}`);
        if (errors > 0) {
          console.log(`❌ Errors: ${errors}`);
        }
      } else {
        console.log(`\n🔍 DRY RUN: Would delete ${withoutStudent.length} orphan StudentProfiles`);
      }
    } else {
      console.log("\n✅ All orphans have valid Student data");
    }

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log("\n" + "=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));
    console.log(`\nTotal orphan StudentProfiles: ${orphanProfiles.length}`);
    console.log(`  - With Student data (fix by creating Person): ${withStudent.length}`);
    console.log(`  - Without Student data (delete): ${withoutStudent.length}`);

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

main().catch(console.error);
