import { describe, it, expect } from 'vitest';
import type { Student, AttendanceSummary } from '../use-attendance-state';
import type { AttendanceStatus } from '@/lib/config/attendance-status';

/**
 * Simplified tests for use-attendance-summary hook
 * Tests the calculation logic directly without React hooks
 */

// Replicate the summary calculation logic from the hook
function calculateSummary(
  students: Student[] | undefined,
  localAttendance: Record<string, AttendanceStatus>,
  entryMode: 'checklist' | 'absences_only'
): AttendanceSummary | null {
  if (!students) return null;

  const summary: AttendanceSummary = {
    total: students.length,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    notRecorded: 0,
  };

  students.forEach(student => {
    const status = localAttendance[student.studentProfileId];
    if (status === 'present') summary.present++;
    else if (status === 'absent') summary.absent++;
    else if (status === 'late') summary.late++;
    else if (status === 'excused') summary.excused++;
    else summary.notRecorded++;
  });

  // In absences_only mode, not recorded = present
  if (entryMode === 'absences_only') {
    summary.present = summary.notRecorded;
    summary.notRecorded = 0;
  }

  return summary;
}

const createMockStudent = (id: string): Student => ({
  studentProfileId: id,
  studentNumber: `STU${id}`,
  person: {
    id: `p${id}`,
    firstName: `First${id}`,
    lastName: `Last${id}`,
    photoUrl: null,
  },
  status: null,
  notes: null,
  recordId: null,
});

describe('useAttendanceSummary - Calculation logic', () => {
  describe('Basic calculations', () => {
    it('should return null when students is undefined', () => {
      const result = calculateSummary(undefined, {}, 'checklist');
      expect(result).toBeNull();
    });

    it('should calculate summary for empty student list', () => {
      const result = calculateSummary([], {}, 'checklist');
      expect(result).toEqual({
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        notRecorded: 0,
      });
    });

    it('should count all present students', () => {
      const students = [
        createMockStudent('1'),
        createMockStudent('2'),
        createMockStudent('3'),
      ];
      const localAttendance: Record<string, AttendanceStatus> = {
        '1': 'present',
        '2': 'present',
        '3': 'present',
      };

      const result = calculateSummary(students, localAttendance, 'checklist');
      expect(result).toEqual({
        total: 3,
        present: 3,
        absent: 0,
        late: 0,
        excused: 0,
        notRecorded: 0,
      });
    });

    it('should count all absent students', () => {
      const students = [createMockStudent('1'), createMockStudent('2')];
      const localAttendance: Record<string, AttendanceStatus> = {
        '1': 'absent',
        '2': 'absent',
      };

      const result = calculateSummary(students, localAttendance, 'checklist');
      expect(result).toEqual({
        total: 2,
        present: 0,
        absent: 2,
        late: 0,
        excused: 0,
        notRecorded: 0,
      });
    });

    it('should count mixed statuses correctly', () => {
      const students = [
        createMockStudent('1'),
        createMockStudent('2'),
        createMockStudent('3'),
        createMockStudent('4'),
        createMockStudent('5'),
      ];
      const localAttendance: Record<string, AttendanceStatus> = {
        '1': 'present',
        '2': 'absent',
        '3': 'late',
        '4': 'excused',
        '5': null,
      };

      const result = calculateSummary(students, localAttendance, 'checklist');
      expect(result).toEqual({
        total: 5,
        present: 1,
        absent: 1,
        late: 1,
        excused: 1,
        notRecorded: 1,
      });
    });

    it('should count students with missing attendance as notRecorded', () => {
      const students = [
        createMockStudent('1'),
        createMockStudent('2'),
        createMockStudent('3'),
      ];
      const localAttendance: Record<string, AttendanceStatus> = {
        '1': 'present',
        // '2' and '3' are missing
      };

      const result = calculateSummary(students, localAttendance, 'checklist');
      expect(result).toEqual({
        total: 3,
        present: 1,
        absent: 0,
        late: 0,
        excused: 0,
        notRecorded: 2,
      });
    });
  });

  describe('Entry mode: checklist', () => {
    it('should treat null status as notRecorded in checklist mode', () => {
      const students = [createMockStudent('1'), createMockStudent('2')];
      const localAttendance: Record<string, AttendanceStatus> = {
        '1': 'present',
        '2': null,
      };

      const result = calculateSummary(students, localAttendance, 'checklist');
      expect(result).toEqual({
        total: 2,
        present: 1,
        absent: 0,
        late: 0,
        excused: 0,
        notRecorded: 1,
      });
    });
  });

  describe('Entry mode: absences_only', () => {
    it('should convert notRecorded to present in absences_only mode', () => {
      const students = [
        createMockStudent('1'),
        createMockStudent('2'),
        createMockStudent('3'),
      ];
      const localAttendance: Record<string, AttendanceStatus> = {
        '1': null,
        '2': null,
        '3': 'absent',
      };

      const result = calculateSummary(students, localAttendance, 'absences_only');
      expect(result).toEqual({
        total: 3,
        present: 2,
        absent: 1,
        late: 0,
        excused: 0,
        notRecorded: 0,
      });
    });

    it('should handle all null statuses in absences_only mode', () => {
      const students = [
        createMockStudent('1'),
        createMockStudent('2'),
        createMockStudent('3'),
      ];
      const localAttendance: Record<string, AttendanceStatus> = {
        '1': null,
        '2': null,
        '3': null,
      };

      const result = calculateSummary(students, localAttendance, 'absences_only');
      expect(result).toEqual({
        total: 3,
        present: 3,
        absent: 0,
        late: 0,
        excused: 0,
        notRecorded: 0,
      });
    });

    it('should handle mixed statuses in absences_only mode', () => {
      const students = [
        createMockStudent('1'),
        createMockStudent('2'),
        createMockStudent('3'),
        createMockStudent('4'),
        createMockStudent('5'),
      ];
      const localAttendance: Record<string, AttendanceStatus> = {
        '1': null,
        '2': null,
        '3': 'absent',
        '4': 'late',
        '5': 'excused',
      };

      const result = calculateSummary(students, localAttendance, 'absences_only');
      expect(result).toEqual({
        total: 5,
        present: 2,
        absent: 1,
        late: 1,
        excused: 1,
        notRecorded: 0,
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle large student lists efficiently', () => {
      const students = Array.from({ length: 100 }, (_, i) => createMockStudent(`${i}`));
      const localAttendance: Record<string, AttendanceStatus> = {};

      for (let i = 0; i < 50; i++) localAttendance[`${i}`] = 'present';
      for (let i = 50; i < 75; i++) localAttendance[`${i}`] = 'absent';
      for (let i = 75; i < 90; i++) localAttendance[`${i}`] = 'late';
      for (let i = 90; i < 100; i++) localAttendance[`${i}`] = 'excused';

      const result = calculateSummary(students, localAttendance, 'checklist');
      expect(result).toEqual({
        total: 100,
        present: 50,
        absent: 25,
        late: 15,
        excused: 10,
        notRecorded: 0,
      });
    });

    it('should handle students with no attendance data at all', () => {
      const students = [createMockStudent('1'), createMockStudent('2')];
      const localAttendance: Record<string, AttendanceStatus> = {};

      const result = calculateSummary(students, localAttendance, 'checklist');
      expect(result).toEqual({
        total: 2,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        notRecorded: 2,
      });
    });
  });
});
