import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "../ui/.env" });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  try {
    const studentId = "cmjt6svci0001n4u875x6c36v";
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      console.log("Student not found");
      return;
    }
    console.log("Fixing student:", student.firstName, student.lastName);

    // Create new Person (without email to avoid conflict)
    const person = await prisma.person.create({
      data: {
        firstName: student.firstName,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth
      }
    });
    console.log("Created Person:", person.id);

    // Create StudentProfile
    const profile = await prisma.studentProfile.create({
      data: {
        personId: person.id,
        studentId: student.id
      }
    });
    console.log("Created StudentProfile:", profile.id);

    // Verify
    const remaining = await prisma.student.count({ where: { studentProfile: null } });
    console.log("Students without profile after fix:", remaining);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
