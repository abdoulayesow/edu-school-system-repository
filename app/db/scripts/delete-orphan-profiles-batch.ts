/**
 * Delete Orphan StudentProfiles (Batch)
 *
 * Efficiently deletes orphan StudentProfiles using raw SQL
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "../ui/.env" });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log("=".repeat(60));
  console.log("DELETE ORPHAN STUDENT PROFILES (BATCH)");
  console.log("=".repeat(60));

  try {
    // Count before
    const beforeCount = await prisma.studentProfile.count();
    console.log(`\nStudentProfiles before: ${beforeCount}`);

    // Get valid Person IDs
    const persons = await prisma.person.findMany({ select: { id: true } });
    const validPersonIds = persons.map(p => p.id);
    console.log(`Valid Person records: ${validPersonIds.length}`);

    // Delete orphan StudentProfiles (those with personId NOT in valid Person IDs)
    // We need to find orphans first since deleteMany doesn't support NOT IN on relations
    const orphans = await prisma.studentProfile.findMany({
      where: {
        personId: {
          notIn: validPersonIds
        }
      },
      select: { id: true }
    });

    console.log(`\nOrphan StudentProfiles found: ${orphans.length}`);

    if (orphans.length > 0) {
      const orphanIds = orphans.map(o => o.id);

      // Batch delete
      const result = await prisma.studentProfile.deleteMany({
        where: {
          id: { in: orphanIds }
        }
      });

      console.log(`\n✅ Deleted ${result.count} orphan StudentProfiles`);
    }

    // Count after
    const afterCount = await prisma.studentProfile.count();
    console.log(`\nStudentProfiles after: ${afterCount}`);
    console.log(`Difference: ${beforeCount - afterCount}`);

  } finally {
    await pool.end();
  }
}

main().catch(console.error);
