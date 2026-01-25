import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "../ui/.env" });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  try {
    // Find students without profile
    const studentsWithoutProfile = await prisma.student.findMany({
      where: { studentProfile: null }
    });

    console.log(`Students without StudentProfile: ${studentsWithoutProfile.length}`);

    for (const student of studentsWithoutProfile) {
      console.log(`\nStudent ID: ${student.id}`);
      console.log(`Name: ${student.firstName} ${student.lastName}`);
      console.log(`Email: ${student.email}`);

      // Check if there's a StudentProfile with this studentId
      const profileByStudentId = await prisma.studentProfile.findFirst({
        where: { studentId: student.id }
      });
      console.log(`Profile by studentId: ${profileByStudentId ? profileByStudentId.id : "NOT FOUND"}`);

      // Check if there's a Person with this email
      if (student.email) {
        const personByEmail = await prisma.person.findUnique({
          where: { email: student.email },
          include: { studentProfile: true }
        });
        console.log(`Person by email: ${personByEmail ? personByEmail.id : "NOT FOUND"}`);
        if (personByEmail?.studentProfile) {
          console.log(`Person's StudentProfile: ${personByEmail.studentProfile.id}`);
          console.log(`Person's StudentProfile.studentId: ${personByEmail.studentProfile.studentId}`);
        }
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
