/**
 * Camada de Autorização Baseada em Roles (RBAC) - SGE CSM
 * Atualizada em 2026-04-11 conforme novos requisitos de isolamento.
 */

export const ROLES = {
  ADMIN: 'admin',           // Acesso Total
  SECRETARIA: 'secretaria', // Pedagógico Total, Zero Financeiro
  FINANCEIRO: 'financeiro', // Financeiro Total, Pedagógico Consulta
  PROFESSOR: 'professor',   // Notas/Faltas, Consulta Aluno
  ALUNO: 'aluno'            // Consulta Própria
}

/**
 * Permissões por role
 */
const PERMISSIONS = {
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
    // Sem permissões financeiras
  ],
  [ROLES.FINANCEIRO]: [
    'view_dashboard',
    'view_financeiro',
    'view_secretaria', // Consulta para identificar alunos
    'view_academico',  // Consulta para ver turmas do aluno
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
    // Sem acesso a documentos ou dados sensíveis de cadastro
  ],
  [ROLES.ALUNO]: [
    'view_dashboard',
    'view_matriz',
    'view_academico', // Apenas consulta de notas
    'view_documentos', // Apenas solicitação
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
export const isAdmin = (role) => role === ROLES.ADMIN
export const isSecretaria = (role) => role === ROLES.SECRETARIA
export const isFinanceiro = (role) => role === ROLES.FINANCEIRO
export const isProfessor = (role) => role === ROLES.PROFESSOR
export const isAluno = (role) => role === ROLES.ALUNO

// Verificação para menus laterais
export const canViewFinanceiro = (role) => hasPermission(role, 'view_financeiro')
export const canViewSecretaria = (role) => hasPermission(role, 'view_secretaria')
