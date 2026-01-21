// Check existing club enrollments
import { prisma } from './prisma.js';

async function checkClubEnrollments() {
  try {
    const clubId = 'cmkibs7pt00062cu83ks8w0p0';

    const activeEnrollments = await prisma.clubEnrollment.count({
      where: {
        clubId,
        status: 'active'
      }
    });

    console.log(`\n=== CLUB ENROLLMENT STATUS ===`);
    console.log(`Active enrollments in this club: ${activeEnrollments}`);

    // Check how many eligible students exist
    const eligibleEnrollments = await prisma.enrollment.findMany({
      where: {
        schoolYear: { isActive: true },
        status: 'completed'
      },
      distinct: ['studentId'],
      select: { studentId: true }
    });

    const eligibleStudentsCount = eligibleEnrollments.length;

    console.log(`Total eligible students (completed enrollments): ${eligibleStudentsCount}`);
    console.log(`Students NOT yet enrolled: ${eligibleStudentsCount - activeEnrollments}`);

    if (activeEnrollments >= eligibleStudentsCount) {
      console.log('\n⚠️  All eligible students are already enrolled in this club!');
      console.log('This is why no students appear in the enrollment wizard.');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkClubEnrollments();
