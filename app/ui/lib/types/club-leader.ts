/**
 * Type guards and utility functions for polymorphic club leaders
 */

export type ClubLeaderType = 'teacher' | 'staff' | 'student'

/**
 * Format staff role for display
 */
export function formatStaffRole(role: string): string {
  const roleMap: Record<string, string> = {
    proviseur: 'Principal',
    censeur: 'Vice Principal',
    surveillant_general: 'Dean of Students',
    directeur: 'Director',
    secretariat: 'Secretary',
    comptable: 'Accountant',
    agent_recouvrement: 'Collections Agent',
    coordinateur: 'Coordinator',
    gardien: 'Guard',
    proprietaire: 'Owner',
    admin_systeme: 'System Admin',
  }
  return roleMap[role] || role
}

/**
 * Format staff role for display in French
 */
export function formatStaffRoleFr(role: string): string {
  const roleMap: Record<string, string> = {
    proviseur: 'Proviseur',
    censeur: 'Censeur',
    surveillant_general: 'Surveillant Général',
    directeur: 'Directeur',
    secretariat: 'Secrétariat',
    comptable: 'Comptable',
    agent_recouvrement: 'Agent de Recouvrement',
    coordinateur: 'Coordinateur',
    gardien: 'Gardien',
    proprietaire: 'Propriétaire',
    admin_systeme: 'Admin Système',
  }
  return roleMap[role] || role
}
