/**
 * Camada de Autorização Baseada em Roles (RBAC) - SGE CSM
 * Atualizada em 2026-04-12: adicionado perfil master_admin.
 *
 * Hierarquia de Acesso (maior → menor):
 * master_admin → admin → secretaria/financeiro → professor → aluno
 */

export const ROLES = {
  MASTER_ADMIN: 'master_admin', // Proprietário do Sistema — Acesso Total + Configurações
  ADMIN:        'admin',        // Administrador — Acesso Total exceto Configurações
  SECRETARIA:   'secretaria',   // Pedagógico Total, Zero Financeiro
  FINANCEIRO:   'financeiro',   // Financeiro Total, Pedagógico Consulta
  PROFESSOR:    'professor',    // Notas/Faltas, Consulta Aluno
  ALUNO:        'aluno'         // Consulta Própria
}

/**
 * Permissões por role
 */
const PERMISSIONS = {
  [ROLES.MASTER_ADMIN]: [
    'view_dashboard',
    'view_colegas',
    'view_documentos',
    'view_matriz',
    'view_secretaria',
    'view_turmas',
    'view_academico',
    'view_professor',
    'view_perfil',
    'view_financeiro',
    'manage_users',
    'manage_turmas',
    'manage_matriculas',
    'manage_notas',
    'manage_cursos',
    'manage_documentos',
    'manage_professores',
    'manage_financeiro',
    'manage_instituicao'  // ← EXCLUSIVO: Configurações da Instituição
  ],
  [ROLES.ADMIN]: [
    'view_dashboard',
    'view_colegas',
    'view_documentos',
    'view_matriz',
    'view_secretaria',
    'view_turmas',
    'view_academico',
    'view_professor',
    'view_perfil',
    'view_financeiro',
    'manage_users',
    'manage_turmas',
    'manage_matriculas',
    'manage_notas',
    'manage_cursos',
    'manage_documentos',
    'manage_professores',
    'manage_financeiro'
    // Sem 'manage_instituicao' — não acessa Configurações
  ],
  [ROLES.SECRETARIA]: [
    'view_dashboard',
    'view_colegas',
    'view_documentos',
    'view_matriz',
    'view_secretaria',
    'view_turmas',
    'view_academico',
    'view_perfil',
    'manage_users',
    'manage_turmas',
    'manage_matriculas',
    'manage_cursos',
    'manage_documentos'
  ],
  [ROLES.FINANCEIRO]: [
    'view_dashboard',
    'view_financeiro',
    'view_secretaria',
    'view_academico',
    'view_perfil',
    'manage_financeiro'
  ],
  [ROLES.PROFESSOR]: [
    'view_dashboard',
    'view_academico',
    'view_professor',
    'view_perfil',
    'manage_notas',
    'manage_aulas'
  ],
  [ROLES.ALUNO]: [
    'view_dashboard',
    'view_matriz',
    'view_academico',
    'view_documentos',
    'view_perfil'
  ]
}

export function hasPermission(userRole, permission) {
  const rolePermissions = PERMISSIONS[userRole?.toLowerCase()]
  if (!rolePermissions) return false
  return rolePermissions.includes(permission)
}

export function hasRole(userRole, allowedRoles) {
  return allowedRoles.includes(userRole?.toLowerCase())
}

// Helpers de conveniência
export const isMasterAdmin = (role) => role === ROLES.MASTER_ADMIN
export const isAdmin       = (role) => role === ROLES.ADMIN || role === ROLES.MASTER_ADMIN
export const isSecretaria  = (role) => role === ROLES.SECRETARIA
export const isFinanceiro  = (role) => role === ROLES.FINANCEIRO
export const isProfessor   = (role) => role === ROLES.PROFESSOR
export const isAluno       = (role) => role === ROLES.ALUNO

// Verificações específicas de funcionalidades
export const canViewFinanceiro    = (role) => hasPermission(role, 'view_financeiro')
export const canViewSecretaria    = (role) => hasPermission(role, 'view_secretaria')
export const canManageInstituicao = (role) => hasPermission(role, 'manage_instituicao')

