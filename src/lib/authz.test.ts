import { describe, it, expect } from 'vitest'
import { 
  isMasterAdmin, 
  isAdmin, 
  isSecretaria, 
  isFinanceiro, 
  isProfessor, 
  isAluno,
  hasPermission,
  hasRole,
  ROLES,
  PERMISSIONS
} from '../lib/authz'

describe('Authz - Role Helpers', () => {
  describe('isMasterAdmin', () => {
    it('deve retornar true para master_admin', () => {
      expect(isMasterAdmin('master_admin')).toBe(true)
    })

    it('deve retornar false para outros perfis', () => {
      expect(isMasterAdmin('admin')).toBe(false)
      expect(isMasterAdmin('secretaria')).toBe(false)
      expect(isMasterAdmin('professor')).toBe(false)
      expect(isMasterAdmin('aluno')).toBe(false)
    })

    it('deve retornar false para undefined/null', () => {
      expect(isMasterAdmin(undefined)).toBe(false)
      expect(isMasterAdmin(null)).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('deve retornar true para admin', () => {
      expect(isAdmin('admin')).toBe(true)
    })

    it('deve retornar true para master_admin (herança)', () => {
      expect(isAdmin('master_admin')).toBe(true)
    })

    it('deve retornar false para outros perfis', () => {
      expect(isAdmin('secretaria')).toBe(false)
      expect(isAdmin('professor')).toBe(false)
    })
  })

  describe('isSecretaria', () => {
    it('deve retornar true para secretaria', () => {
      expect(isSecretaria('secretaria')).toBe(true)
    })

    it('deve retornar false para outros', () => {
      expect(isSecretaria('admin')).toBe(false)
      expect(isSecretaria('professor')).toBe(false)
    })
  })

  describe('isProfessor', () => {
    it('deve retornar true para professor', () => {
      expect(isProfessor('professor')).toBe(true)
    })

    it('deve retornar false para altri', () => {
      expect(isProfessor('aluno')).toBe(false)
      expect(isProfessor('admin')).toBe(false)
    })
  })

  describe('isAluno', () => {
    it('deve retornar true para aluno', () => {
      expect(isAluno('aluno')).toBe(true)
    })

    it('deve retornar false para outros', () => {
      expect(isAluno('professor')).toBe(false)
    })
  })
})

describe('Authz - hasPermission', () => {
  it('deve retornar true para master_admin com view_dashboard', () => {
    expect(hasPermission('master_admin', 'view_dashboard')).toBe(true)
  })

  it('deve retornar true para admin com manage_users', () => {
    expect(hasPermission('admin', 'manage_users')).toBe(true)
  })

  it('deve retornar false para aluno com manage_users', () => {
    expect(hasPermission('aluno', 'manage_users')).toBe(false)
  })

  it('deve retornar false para perfil inexistente', () => {
    expect(hasPermission('perfil_invalido' as any, 'view_dashboard')).toBe(false)
  })

  it('deve retornar false para undefined', () => {
    expect(hasPermission(undefined, 'view_dashboard')).toBe(false)
  })
})

describe('Authz - hasRole', () => {
  it('deve retornar true para role exata', () => {
    expect(hasRole('admin', ['admin', 'master_admin'])).toBe(true)
  })

  it('deve retornar false para role não permitida', () => {
    expect(hasRole('aluno', ['admin', 'master_admin'])).toBe(false)
  })
})

describe('Authz - ROLES', () => {
  it('deve ter todos os perfis definidos', () => {
    expect(ROLES.MASTER_ADMIN).toBe('master_admin')
    expect(ROLES.ADMIN).toBe('admin')
    expect(ROLES.SECRETARIA).toBe('secretaria')
    expect(ROLES.FINANCEIRO).toBe('financeiro')
    expect(ROLES.PROFESSOR).toBe('professor')
    expect(ROLES.ALUNO).toBe('aluno')
  })
})

describe('Authz - PERMISSIONS', () => {
  it('deve ter permissões para master_admin', () => {
    expect(PERMISSIONS['master_admin']).toContain('view_dashboard')
    expect(PERMISSIONS['master_admin']).toContain('manage_instituicao')
  })

  it('deve ter permissões para admin (sem manage_instituicao)', () => {
    expect(PERMISSIONS['admin']).toContain('view_dashboard')
    expect(PERMISSIONS['admin']).not.toContain('manage_instituicao')
  })

  it('deve ter permissões limitadas para aluno', () => {
    expect(PERMISSIONS['aluno']).toContain('view_dashboard')
    expect(PERMISSIONS['aluno']).not.toContain('manage_users')
  })
})

describe('Authz - Hierarquia', () => {
  it('master_admin deve ter mais permissões que admin', () => {
    expect(PERMISSIONS['master_admin'].length).toBeGreaterThan(PERMISSIONS['admin'].length)
  })

  it('admin deve ter mais permissões que secretaria', () => {
    expect(PERMISSIONS['admin'].length).toBeGreaterThan(PERMISSIONS['secretaria'].length)
  })

  it('secretaria deve ter mais permissões que professor', () => {
    expect(PERMISSIONS['secretaria'].length).toBeGreaterThan(PERMISSIONS['professor'].length)
  })
})