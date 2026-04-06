/**
 * Camada de Autorização Baseada em Roles (RBAC)
 * 
 * Fornece verificações de permissão para garantir que apenas usuários
 * autorizados acessem determinadas funcionalidades.
 */

/**
 * Roles disponíveis no sistema
 */
export const ROLES = {
  ADMIN: 'admin',
  SECRETARIA: 'secretaria',
  PROFESSOR: 'professor',
  ALUNO: 'aluno'
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
  ],
  [ROLES.PROFESSOR]: [
    'view_dashboard',
    'view_colegas',
    'view_documentos',
    'view_matriz',
    'view_academico',
    'view_professor',
    'view_perfil',
    'manage_notas',
    'manage_aulas'
  ],
  [ROLES.ALUNO]: [
    'view_dashboard',
    'view_colegas',
    'view_documentos',
    'view_matriz',
    'view_academico',
    'view_perfil'
  ]
}

/**
 * Verificar se um usuário tem uma permissão específica
 * @param {string} userRole - Role do usuário
 * @param {string} permission - Permissão a verificar
 * @returns {boolean}
 */
export function hasPermission(userRole, permission) {
  const rolePermissions = PERMISSIONS[userRole?.toLowerCase()]
  if (!rolePermissions) return false
  return rolePermissions.includes(permission)
}

/**
 * Verificar se um usuário tem uma das roles especificadas
 * @param {string} userRole - Role do usuário
 * @param {string[]} allowedRoles - Roles permitidas
 * @returns {boolean}
 */
export function hasRole(userRole, allowedRoles) {
  return allowedRoles.includes(userRole?.toLowerCase())
}

/**
 * Verificar se o usuário é admin ou secretaria
 * @param {string} userRole - Role do usuário
 * @returns {boolean}
 */
export function isAdmin(userRole) {
  return hasRole(userRole, [ROLES.ADMIN, ROLES.SECRETARIA])
}

/**
 * Verificar se o usuário é professor
 * @param {string} userRole - Role do usuário
 * @returns {boolean}
 */
export function isProfessor(userRole) {
  return hasRole(userRole, [ROLES.PROFESSOR])
}

/**
 * Verificar se o usuário é aluno
 * @param {string} userRole - Role do usuário
 * @returns {boolean}
 */
export function isAluno(userRole) {
  return hasRole(userRole, [ROLES.ALUNO])
}

/**
 * Middleware de proteção de rota
 * Redireciona se o usuário não tiver permissão
 * @param {string} userRole - Role do usuário
 * @param {string} requiredRole - Role mínima necessária
 * @param {string} redirectPath - Path para redirecionar se não autorizado
 * @returns {boolean} True se autorizado, false caso contrário
 */
export function protectRoute(userRole, requiredRole, redirectPath = '#/') {
  if (!hasRole(userRole, [requiredRole])) {
    console.warn(`Acesso negado: role '${userRole}' não tem permissão para '${requiredRole}'`)
    window.location.hash = redirectPath
    return false
  }
  return true
}

/**
 * Obter todas as permissões de um usuário
 * @param {string} userRole - Role do usuário
 * @returns {string[]} Lista de permissões
 */
export function getUserPermissions(userRole) {
  return PERMISSIONS[userRole?.toLowerCase()] || []
}

/**
 * Decorador para proteger funções baseadas em roles
 * Uso: const safeFn = requireRole('admin', originalFn)
 * @param {string[]} allowedRoles - Roles permitidas
 * @param {Function} fn - Função a proteger
 * @returns {Function} Função protegida
 */
export function requireRole(allowedRoles, fn) {
  return function(...args) {
    // Assumes profile is passed in args or available in context
    const profile = args.find(arg => arg?.perfil) || args.find(arg => arg?.userRole)
    const userRole = profile?.perfil || profile?.userRole
    
    if (!hasRole(userRole, allowedRoles)) {
      console.error(`Acesso negado: role '${userRole}' requer uma das roles: ${allowedRoles.join(', ')}`)
      throw new Error('Acesso negado: permissões insuficientes')
    }
    
    return fn.apply(this, args)
  }
}
