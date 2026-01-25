// Check club eligibility rules
import { prisma } from './prisma.js';

async function checkClubEligibility() {
  try {
    const clubId = 'cmkibs7pt00062cu83ks8w0p0';

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        category: true,
        eligibilityRule: {
          include: {
            gradeRules: {
              include: {
                grade: true
              }
            }
          }
        }
      }
    });

    if (!club) {
      console.log('Club not found');
      await prisma.$disconnect();
      return;
    }

    console.log('\n=== CLUB DETAILS ===');
    console.log(`Name: ${club.name}`);
    console.log(`Category: ${club.category?.name}`);
    console.log(`Eligibility Rule Type: ${club.eligibilityRule?.ruleType || 'NONE'}`);

    if (club.eligibilityRule?.gradeRules && club.eligibilityRule.gradeRules.length > 0) {
      console.log('\nAllowed Grades:');
      club.eligibilityRule.gradeRules.forEach(r => {
        console.log(`  - ${r.grade.name} (Level: ${r.grade.level})`);
      });
    } else {
      console.log('\nNo grade restrictions (all grades allowed)');
    }

    // Now check what grades have completed enrollments
    console.log('\n=== GRADES WITH COMPLETED ENROLLMENTS ===');

    const gradesWithStudents = await prisma.enrollment.groupBy({
      by: ['gradeId'],
      where: {
        schoolYear: { isActive: true },
        status: 'completed'
      },
      _count: true
    });

    const gradeIds = gradesWithStudents.map(g => g.gradeId);
    const grades = await prisma.grade.findMany({
      where: { id: { in: gradeIds } },
      select: { id: true, name: true, level: true }
    });

    const gradeMap = new Map(grades.map(g => [g.id, g]));

    gradesWithStudents.forEach(g => {
      const grade = gradeMap.get(g.gradeId);
      if (grade) {
        console.log(`${grade.name} (${grade.level}): ${g._count} students`);
      }
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkClubEligibility();
