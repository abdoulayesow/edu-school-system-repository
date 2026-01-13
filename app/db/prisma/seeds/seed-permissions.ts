/**
 * Permission Seeder
 *
 * Seeds default role permissions for the 13 staff roles.
 * Based on ROLES_AND_PERMISSIONS_SYSTEM.md documentation.
 *
 * Usage: npx tsx app/db/prisma/seeds/seed-permissions.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, StaffRole, PermissionResource, PermissionAction, PermissionScope } from "@prisma/client"
import pg from "pg"
import fs from "fs"
import path from "path"

const { Pool } = pg

// Load .env from app/ui if DATABASE_URL not set
if (!process.env.DATABASE_URL) {
  const envPath = path.join(process.cwd(), "app", "ui", ".env")
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8")
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=")
        const value = valueParts.join("=").replace(/^["']|["']$/g, "")
        if (key && !process.env[key]) {
          process.env[key] = value
        }
      }
    }
  }
}

// Permission definition type
interface PermissionDef {
  role: StaffRole
  resource: PermissionResource
  action: PermissionAction
  scope: PermissionScope
}

// Default permissions for all 13 roles
// Based on the permission matrix in ROLES_AND_PERMISSIONS_SYSTEM.md
const DEFAULT_PERMISSIONS: PermissionDef[] = [
  // ========================================================================
  // PROVISEUR (Principal - Secondary School)
  // Full oversight of secondary education (own_level scope for Secondaire)
  // ========================================================================
  { role: StaffRole.proviseur, resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.students, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.students, action: PermissionAction.delete, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.student_enrollment, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.student_enrollment, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.student_enrollment, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.student_enrollment, action: PermissionAction.approve, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.student_transfer, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.student_transfer, action: PermissionAction.approve, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.student_documents, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.student_documents, action: PermissionAction.update, scope: PermissionScope.own_level },

  { role: StaffRole.proviseur, resource: PermissionResource.classes, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.classes, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.classes, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.subjects, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.subjects, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.teachers_assignment, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.teachers_assignment, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.schedule, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.schedule, action: PermissionAction.update, scope: PermissionScope.own_level },

  { role: StaffRole.proviseur, resource: PermissionResource.grades, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.report_cards, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.report_cards, action: PermissionAction.export, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.grade_approval, action: PermissionAction.approve, scope: PermissionScope.own_level },

  { role: StaffRole.proviseur, resource: PermissionResource.attendance, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.attendance_justification, action: PermissionAction.approve, scope: PermissionScope.own_level },

  { role: StaffRole.proviseur, resource: PermissionResource.discipline_records, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.discipline_records, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.sanctions, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.sanctions, action: PermissionAction.approve, scope: PermissionScope.own_level },

  { role: StaffRole.proviseur, resource: PermissionResource.student_balance, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.receipts, action: PermissionAction.view, scope: PermissionScope.own_level },

  { role: StaffRole.proviseur, resource: PermissionResource.staff, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.staff_assignment, action: PermissionAction.update, scope: PermissionScope.own_level },

  { role: StaffRole.proviseur, resource: PermissionResource.sms, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.announcements, action: PermissionAction.create, scope: PermissionScope.own_level },

  { role: StaffRole.proviseur, resource: PermissionResource.academic_reports, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.academic_reports, action: PermissionAction.export, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.attendance_reports, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.proviseur, resource: PermissionResource.attendance_reports, action: PermissionAction.export, scope: PermissionScope.own_level },

  // ========================================================================
  // CENSEUR (Vice Principal - Secondary School)
  // Academic programs and teacher management (own_level scope for Secondaire)
  // ========================================================================
  { role: StaffRole.censeur, resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.students, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.student_enrollment, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.student_transfer, action: PermissionAction.view, scope: PermissionScope.own_level },

  { role: StaffRole.censeur, resource: PermissionResource.classes, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.classes, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.classes, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.subjects, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.subjects, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.teachers_assignment, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.teachers_assignment, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.schedule, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.schedule, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.schedule, action: PermissionAction.update, scope: PermissionScope.own_level },

  { role: StaffRole.censeur, resource: PermissionResource.grades, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.grades, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.report_cards, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.report_cards, action: PermissionAction.export, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.grade_approval, action: PermissionAction.approve, scope: PermissionScope.own_level },

  { role: StaffRole.censeur, resource: PermissionResource.attendance, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.attendance_justification, action: PermissionAction.view, scope: PermissionScope.own_level },

  { role: StaffRole.censeur, resource: PermissionResource.staff, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.staff_assignment, action: PermissionAction.update, scope: PermissionScope.own_level },

  { role: StaffRole.censeur, resource: PermissionResource.academic_reports, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.academic_reports, action: PermissionAction.export, scope: PermissionScope.own_level },
  { role: StaffRole.censeur, resource: PermissionResource.attendance_reports, action: PermissionAction.view, scope: PermissionScope.own_level },

  // ========================================================================
  // SURVEILLANT_GENERAL (Dean of Students - Secondary School)
  // Discipline and daily supervision (own_level scope for Secondaire)
  // ========================================================================
  { role: StaffRole.surveillant_general, resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.surveillant_general, resource: PermissionResource.student_enrollment, action: PermissionAction.view, scope: PermissionScope.own_level },

  { role: StaffRole.surveillant_general, resource: PermissionResource.classes, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.surveillant_general, resource: PermissionResource.schedule, action: PermissionAction.view, scope: PermissionScope.own_level },

  { role: StaffRole.surveillant_general, resource: PermissionResource.attendance, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.surveillant_general, resource: PermissionResource.attendance, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.surveillant_general, resource: PermissionResource.attendance, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.surveillant_general, resource: PermissionResource.attendance_justification, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.surveillant_general, resource: PermissionResource.attendance_justification, action: PermissionAction.approve, scope: PermissionScope.own_level },

  { role: StaffRole.surveillant_general, resource: PermissionResource.discipline_records, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.surveillant_general, resource: PermissionResource.discipline_records, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.surveillant_general, resource: PermissionResource.discipline_records, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.surveillant_general, resource: PermissionResource.sanctions, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.surveillant_general, resource: PermissionResource.sanctions, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.surveillant_general, resource: PermissionResource.sanctions, action: PermissionAction.update, scope: PermissionScope.own_level },

  { role: StaffRole.surveillant_general, resource: PermissionResource.sms, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.surveillant_general, resource: PermissionResource.announcements, action: PermissionAction.create, scope: PermissionScope.own_level },

  { role: StaffRole.surveillant_general, resource: PermissionResource.attendance_reports, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.surveillant_general, resource: PermissionResource.attendance_reports, action: PermissionAction.export, scope: PermissionScope.own_level },

  // ========================================================================
  // DIRECTEUR (Director - Primary School)
  // Full oversight of primary education (own_level scope for Primaire & Maternelle)
  // ========================================================================
  { role: StaffRole.directeur, resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.students, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.students, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.students, action: PermissionAction.delete, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.student_enrollment, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.student_enrollment, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.student_enrollment, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.student_enrollment, action: PermissionAction.approve, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.student_transfer, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.student_transfer, action: PermissionAction.approve, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.student_documents, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.student_documents, action: PermissionAction.update, scope: PermissionScope.own_level },

  { role: StaffRole.directeur, resource: PermissionResource.classes, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.classes, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.classes, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.subjects, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.subjects, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.teachers_assignment, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.teachers_assignment, action: PermissionAction.update, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.schedule, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.schedule, action: PermissionAction.update, scope: PermissionScope.own_level },

  { role: StaffRole.directeur, resource: PermissionResource.grades, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.report_cards, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.report_cards, action: PermissionAction.export, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.grade_approval, action: PermissionAction.approve, scope: PermissionScope.own_level },

  { role: StaffRole.directeur, resource: PermissionResource.attendance, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.attendance, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.attendance_justification, action: PermissionAction.approve, scope: PermissionScope.own_level },

  { role: StaffRole.directeur, resource: PermissionResource.discipline_records, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.discipline_records, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.sanctions, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.sanctions, action: PermissionAction.approve, scope: PermissionScope.own_level },

  { role: StaffRole.directeur, resource: PermissionResource.student_balance, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.receipts, action: PermissionAction.view, scope: PermissionScope.own_level },

  { role: StaffRole.directeur, resource: PermissionResource.staff, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.staff_assignment, action: PermissionAction.update, scope: PermissionScope.own_level },

  { role: StaffRole.directeur, resource: PermissionResource.sms, action: PermissionAction.create, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.announcements, action: PermissionAction.create, scope: PermissionScope.own_level },

  { role: StaffRole.directeur, resource: PermissionResource.academic_reports, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.academic_reports, action: PermissionAction.export, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.attendance_reports, action: PermissionAction.view, scope: PermissionScope.own_level },
  { role: StaffRole.directeur, resource: PermissionResource.attendance_reports, action: PermissionAction.export, scope: PermissionScope.own_level },

  // ========================================================================
  // SECRETARIAT (Secretary)
  // Administrative support, enrollment processing (all scope)
  // ========================================================================
  { role: StaffRole.secretariat, resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.secretariat, resource: PermissionResource.students, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.secretariat, resource: PermissionResource.students, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.secretariat, resource: PermissionResource.student_enrollment, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.secretariat, resource: PermissionResource.student_enrollment, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.secretariat, resource: PermissionResource.student_enrollment, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.secretariat, resource: PermissionResource.student_documents, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.secretariat, resource: PermissionResource.student_documents, action: PermissionAction.update, scope: PermissionScope.all },

  { role: StaffRole.secretariat, resource: PermissionResource.classes, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.secretariat, resource: PermissionResource.schedule, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.secretariat, resource: PermissionResource.student_balance, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.secretariat, resource: PermissionResource.receipts, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.secretariat, resource: PermissionResource.sms, action: PermissionAction.create, scope: PermissionScope.all },

  // ========================================================================
  // COMPTABLE (Accountant)
  // Financial management, safe/bank oversight (all scope)
  // ========================================================================
  { role: StaffRole.comptable, resource: PermissionResource.student_balance, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.payment_recording, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.payment_recording, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.payment_recording, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.receipts, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.receipts, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.receipts, action: PermissionAction.export, scope: PermissionScope.all },

  { role: StaffRole.comptable, resource: PermissionResource.safe_balance, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.safe_balance, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.safe_income, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.safe_income, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.safe_expense, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.safe_expense, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.safe_expense, action: PermissionAction.approve, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.bank_transfers, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.bank_transfers, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.daily_verification, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.daily_verification, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.financial_reports, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.financial_reports, action: PermissionAction.export, scope: PermissionScope.all },

  { role: StaffRole.comptable, resource: PermissionResource.fee_structure, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.fee_assignment, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.comptable, resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.student_enrollment, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.comptable, resource: PermissionResource.financial_analytics, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.comptable, resource: PermissionResource.financial_analytics, action: PermissionAction.export, scope: PermissionScope.all },

  // ========================================================================
  // AGENT_RECOUVREMENT (Collections Agent)
  // Fee collection (all scope)
  // ========================================================================
  { role: StaffRole.agent_recouvrement, resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.agent_recouvrement, resource: PermissionResource.student_enrollment, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.agent_recouvrement, resource: PermissionResource.student_balance, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.agent_recouvrement, resource: PermissionResource.receipts, action: PermissionAction.view, scope: PermissionScope.all },

  // ========================================================================
  // COORDINATEUR (Operations Coordinator)
  // Cross-level operations (all scope)
  // ========================================================================
  { role: StaffRole.coordinateur, resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.coordinateur, resource: PermissionResource.student_enrollment, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.coordinateur, resource: PermissionResource.classes, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.coordinateur, resource: PermissionResource.schedule, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.coordinateur, resource: PermissionResource.attendance, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.coordinateur, resource: PermissionResource.attendance_reports, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.coordinateur, resource: PermissionResource.student_balance, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.coordinateur, resource: PermissionResource.staff, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.coordinateur, resource: PermissionResource.academic_reports, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.coordinateur, resource: PermissionResource.financial_analytics, action: PermissionAction.view, scope: PermissionScope.all },

  // ========================================================================
  // ENSEIGNANT (Teacher)
  // Teaching, grading own classes (own_classes scope)
  // ========================================================================
  { role: StaffRole.enseignant, resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.own_classes },

  { role: StaffRole.enseignant, resource: PermissionResource.classes, action: PermissionAction.view, scope: PermissionScope.own_classes },
  { role: StaffRole.enseignant, resource: PermissionResource.schedule, action: PermissionAction.view, scope: PermissionScope.own_classes },

  { role: StaffRole.enseignant, resource: PermissionResource.grades, action: PermissionAction.view, scope: PermissionScope.own_classes },
  { role: StaffRole.enseignant, resource: PermissionResource.grades, action: PermissionAction.create, scope: PermissionScope.own_classes },
  { role: StaffRole.enseignant, resource: PermissionResource.grades, action: PermissionAction.update, scope: PermissionScope.own_classes },
  { role: StaffRole.enseignant, resource: PermissionResource.report_cards, action: PermissionAction.view, scope: PermissionScope.own_classes },

  { role: StaffRole.enseignant, resource: PermissionResource.attendance, action: PermissionAction.view, scope: PermissionScope.own_classes },
  { role: StaffRole.enseignant, resource: PermissionResource.attendance, action: PermissionAction.create, scope: PermissionScope.own_classes },
  { role: StaffRole.enseignant, resource: PermissionResource.attendance, action: PermissionAction.update, scope: PermissionScope.own_classes },

  // ========================================================================
  // PROFESSEUR_PRINCIPAL (Homeroom Teacher)
  // Teacher + class oversight (own_classes scope)
  // ========================================================================
  { role: StaffRole.professeur_principal, resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.own_classes },
  { role: StaffRole.professeur_principal, resource: PermissionResource.students, action: PermissionAction.update, scope: PermissionScope.own_classes },

  { role: StaffRole.professeur_principal, resource: PermissionResource.classes, action: PermissionAction.view, scope: PermissionScope.own_classes },
  { role: StaffRole.professeur_principal, resource: PermissionResource.schedule, action: PermissionAction.view, scope: PermissionScope.own_classes },

  { role: StaffRole.professeur_principal, resource: PermissionResource.grades, action: PermissionAction.view, scope: PermissionScope.own_classes },
  { role: StaffRole.professeur_principal, resource: PermissionResource.grades, action: PermissionAction.create, scope: PermissionScope.own_classes },
  { role: StaffRole.professeur_principal, resource: PermissionResource.grades, action: PermissionAction.update, scope: PermissionScope.own_classes },
  { role: StaffRole.professeur_principal, resource: PermissionResource.report_cards, action: PermissionAction.view, scope: PermissionScope.own_classes },
  { role: StaffRole.professeur_principal, resource: PermissionResource.report_cards, action: PermissionAction.export, scope: PermissionScope.own_classes },

  { role: StaffRole.professeur_principal, resource: PermissionResource.attendance, action: PermissionAction.view, scope: PermissionScope.own_classes },
  { role: StaffRole.professeur_principal, resource: PermissionResource.attendance, action: PermissionAction.create, scope: PermissionScope.own_classes },
  { role: StaffRole.professeur_principal, resource: PermissionResource.attendance, action: PermissionAction.update, scope: PermissionScope.own_classes },
  { role: StaffRole.professeur_principal, resource: PermissionResource.attendance_justification, action: PermissionAction.view, scope: PermissionScope.own_classes },

  { role: StaffRole.professeur_principal, resource: PermissionResource.discipline_records, action: PermissionAction.view, scope: PermissionScope.own_classes },
  { role: StaffRole.professeur_principal, resource: PermissionResource.discipline_records, action: PermissionAction.create, scope: PermissionScope.own_classes },

  { role: StaffRole.professeur_principal, resource: PermissionResource.student_balance, action: PermissionAction.view, scope: PermissionScope.own_classes },

  { role: StaffRole.professeur_principal, resource: PermissionResource.sms, action: PermissionAction.create, scope: PermissionScope.own_classes },

  // ========================================================================
  // GARDIEN (Day/Night Guard)
  // Campus security - minimal system access (none scope for most)
  // ========================================================================
  { role: StaffRole.gardien, resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.none },

  // ========================================================================
  // PROPRIETAIRE (Owner)
  // Strategic oversight, financial visibility (all scope)
  // ========================================================================
  { role: StaffRole.proprietaire, resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.student_enrollment, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.proprietaire, resource: PermissionResource.classes, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.schedule, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.proprietaire, resource: PermissionResource.grades, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.report_cards, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.proprietaire, resource: PermissionResource.attendance, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.proprietaire, resource: PermissionResource.fee_structure, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.fee_structure, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.fee_assignment, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.student_balance, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.payment_recording, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.receipts, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.receipts, action: PermissionAction.export, scope: PermissionScope.all },

  { role: StaffRole.proprietaire, resource: PermissionResource.safe_balance, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.safe_income, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.safe_expense, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.bank_transfers, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.daily_verification, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.financial_reports, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.financial_reports, action: PermissionAction.export, scope: PermissionScope.all },

  { role: StaffRole.proprietaire, resource: PermissionResource.staff, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.proprietaire, resource: PermissionResource.academic_reports, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.academic_reports, action: PermissionAction.export, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.attendance_reports, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.attendance_reports, action: PermissionAction.export, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.financial_analytics, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.financial_analytics, action: PermissionAction.export, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.data_export, action: PermissionAction.export, scope: PermissionScope.all },

  { role: StaffRole.proprietaire, resource: PermissionResource.school_settings, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.proprietaire, resource: PermissionResource.school_settings, action: PermissionAction.update, scope: PermissionScope.all },

  // ========================================================================
  // ADMIN_SYSTEME (System Admin)
  // Technical management, full access (all scope)
  // ========================================================================
  { role: StaffRole.admin_systeme, resource: PermissionResource.students, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.students, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.students, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.students, action: PermissionAction.delete, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.student_enrollment, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.student_enrollment, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.student_enrollment, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.student_enrollment, action: PermissionAction.delete, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.student_enrollment, action: PermissionAction.approve, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.student_transfer, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.student_transfer, action: PermissionAction.approve, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.student_documents, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.student_documents, action: PermissionAction.update, scope: PermissionScope.all },

  { role: StaffRole.admin_systeme, resource: PermissionResource.classes, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.classes, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.classes, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.classes, action: PermissionAction.delete, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.subjects, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.subjects, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.subjects, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.subjects, action: PermissionAction.delete, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.academic_year, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.academic_year, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.academic_year, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.teachers_assignment, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.teachers_assignment, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.schedule, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.schedule, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.schedule, action: PermissionAction.update, scope: PermissionScope.all },

  { role: StaffRole.admin_systeme, resource: PermissionResource.grades, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.grades, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.report_cards, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.report_cards, action: PermissionAction.export, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.grade_approval, action: PermissionAction.approve, scope: PermissionScope.all },

  { role: StaffRole.admin_systeme, resource: PermissionResource.attendance, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.attendance, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.attendance_justification, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.attendance_justification, action: PermissionAction.approve, scope: PermissionScope.all },

  { role: StaffRole.admin_systeme, resource: PermissionResource.fee_structure, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.fee_structure, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.fee_structure, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.fee_assignment, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.fee_assignment, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.student_balance, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.payment_recording, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.payment_recording, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.receipts, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.receipts, action: PermissionAction.export, scope: PermissionScope.all },

  { role: StaffRole.admin_systeme, resource: PermissionResource.safe_balance, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.safe_balance, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.safe_income, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.safe_expense, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.bank_transfers, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.daily_verification, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.financial_reports, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.financial_reports, action: PermissionAction.export, scope: PermissionScope.all },

  { role: StaffRole.admin_systeme, resource: PermissionResource.staff, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.staff, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.staff, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.staff_assignment, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.staff_assignment, action: PermissionAction.update, scope: PermissionScope.all },

  { role: StaffRole.admin_systeme, resource: PermissionResource.user_accounts, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.user_accounts, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.user_accounts, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.user_accounts, action: PermissionAction.delete, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.role_assignment, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.role_assignment, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.permission_overrides, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.permission_overrides, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.permission_overrides, action: PermissionAction.delete, scope: PermissionScope.all },

  { role: StaffRole.admin_systeme, resource: PermissionResource.discipline_records, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.sanctions, action: PermissionAction.view, scope: PermissionScope.all },

  { role: StaffRole.admin_systeme, resource: PermissionResource.sms, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.announcements, action: PermissionAction.create, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.announcements, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.announcements, action: PermissionAction.delete, scope: PermissionScope.all },

  { role: StaffRole.admin_systeme, resource: PermissionResource.academic_reports, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.academic_reports, action: PermissionAction.export, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.attendance_reports, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.attendance_reports, action: PermissionAction.export, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.financial_analytics, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.financial_analytics, action: PermissionAction.export, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.data_export, action: PermissionAction.export, scope: PermissionScope.all },

  { role: StaffRole.admin_systeme, resource: PermissionResource.school_settings, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.school_settings, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.system_settings, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.system_settings, action: PermissionAction.update, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.audit_logs, action: PermissionAction.view, scope: PermissionScope.all },
  { role: StaffRole.admin_systeme, resource: PermissionResource.audit_logs, action: PermissionAction.export, scope: PermissionScope.all },
]

async function main() {
  console.log("🔐 Seeding role permissions...")

  // Create Prisma client with pg adapter
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    // Track statistics
    let created = 0
    let updated = 0
    let skipped = 0

    console.log(`   Processing ${DEFAULT_PERMISSIONS.length} default permissions...`)

    // Process each permission definition
    for (const perm of DEFAULT_PERMISSIONS) {
      // Check if permission already exists
      const existing = await prisma.rolePermission.findUnique({
        where: {
          role_resource_action: {
            role: perm.role,
            resource: perm.resource,
            action: perm.action,
          },
        },
      })

      if (existing) {
        // Update if scope changed
        if (existing.scope !== perm.scope) {
          await prisma.rolePermission.update({
            where: { id: existing.id },
            data: { scope: perm.scope },
          })
          updated++
        } else {
          skipped++
        }
      } else {
        // Create new permission
        await prisma.rolePermission.create({
          data: {
            role: perm.role,
            resource: perm.resource,
            action: perm.action,
            scope: perm.scope,
          },
        })
        created++
      }
    }

    // Summary by role
    console.log("\n" + "=".repeat(60))
    console.log("✅ Permission seeding completed!")
    console.log("=".repeat(60))
    console.log(`   Created: ${created}`)
    console.log(`   Updated: ${updated}`)
    console.log(`   Skipped: ${skipped}`)
    console.log("\n📊 Permissions by role:")

    const roles = Object.values(StaffRole)
    for (const role of roles) {
      const count = await prisma.rolePermission.count({
        where: { role },
      })
      console.log(`   ${role}: ${count} permissions`)
    }

    console.log("=".repeat(60))
  } catch (error) {
    console.error("❌ Failed to seed permissions:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
