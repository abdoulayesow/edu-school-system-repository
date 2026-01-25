// Update enrollment statuses to 'completed' for testing
import { prisma } from './prisma.js';

async function updateEnrollments() {
  try {
    // First, check current enrollment statuses
    const statusCounts = await prisma.enrollment.groupBy({
      by: ['status'],
      where: {
        schoolYear: { isActive: true }
      },
      _count: true
    });

    console.log('\n=== CURRENT ENROLLMENT STATUS COUNTS ===\n');
    statusCounts.forEach(status => {
      console.log(`${status.status}: ${status._count} enrollments`);
    });

    // Find some enrollments to update (take first 10 non-completed)
    const enrollmentsToUpdate = await prisma.enrollment.findMany({
      where: {
        schoolYear: { isActive: true },
        status: { not: 'completed' }
      },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        status: true,
        grade: {
          select: { name: true }
        }
      }
    });

    if (enrollmentsToUpdate.length === 0) {
      console.log('\nNo enrollments found to update.');
      await prisma.$disconnect();
      return;
    }

    console.log(`\n\n=== UPDATING ${enrollmentsToUpdate.length} ENROLLMENTS TO 'completed' ===\n`);

    enrollmentsToUpdate.forEach(e => {
      console.log(`${e.firstName} ${e.lastName} (${e.grade.name}) - ${e.status} → completed`);
    });

    const enrollmentIds = enrollmentsToUpdate.map(e => e.id);

    // Update the enrollments
    const result = await prisma.enrollment.updateMany({
      where: {
        id: { in: enrollmentIds }
      },
      data: {
        status: 'completed',
        approvedAt: new Date()
      }
    });

    console.log(`\n✓ Updated ${result.count} enrollments to 'completed' status`);
    console.log('\nYou can now test club enrollment with these students!');

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

updateEnrollments();
