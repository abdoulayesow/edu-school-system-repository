import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "../ui/.env" });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  try {
    console.log("Verifying enrollment fix...\n");

    const nullStudentId = await prisma.enrollment.count({ where: { studentId: null } });
    const totalEnrollments = await prisma.enrollment.count();
    const totalStudents = await prisma.student.count();

    console.log("=".repeat(50));
    console.log("VERIFICATION RESULTS");
    console.log("=".repeat(50));
    console.log(`Enrollments without studentId: ${nullStudentId}`);
    console.log(`Total Enrollments: ${totalEnrollments}`);
    console.log(`Total Students: ${totalStudents}`);

    if (nullStudentId === 0) {
      console.log("\n✅ SUCCESS: All enrollments now have a studentId!");
    } else {
      console.log(`\n⚠️ WARNING: ${nullStudentId} enrollments still have null studentId`);
    }
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
