import type { UserRole } from '../types'

export interface PersonGroup {
  key: string
  perfil: UserRole
  nomeExibido: string
  ids: string[]
  emails: string[]
  cpfsNaoNulos: string[]
  cpfConflitante: boolean
}

export function normalizarNomeIdentidade(nome: string | null | undefined): string {
  if (!nome) return ''
  return String(nome)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

type ProfileInput = {
  id: string
  email?: string | null
  nome_completo?: string | null
  perfil: UserRole
  cpf?: string | null
}

export function agruparPorPessoa(profiles: ProfileInput[]): PersonGroup[] {
  const grupos = new Map<string, PersonGroup>()

  for (const p of profiles) {
    const nome = normalizarNomeIdentidade(p.nome_completo)
    const email = (p.email || '').trim().toLowerCase()
    const perfilKey = String(p.perfil || '').trim().toLowerCase()

    let key: string
    if (nome) {
      key = `${perfilKey}|nome:${nome}`
    } else if (email) {
      key = `${perfilKey}|email:${email}`
    } else {
      key = `${perfilKey}|id:${p.id}`
    }

    let grupo = grupos.get(key)
    if (!grupo) {
      grupo = {
        key,
        perfil: p.perfil as UserRole,
        nomeExibido: '',
        ids: [],
        emails: [],
        cpfsNaoNulos: [],
        cpfConflitante: false,
      }
      grupos.set(key, grupo)
    }

    grupo.ids.push(p.id)
    if (p.email && p.email.trim()) grupo.emails.push(p.email.trim())
    const cpf = (p.cpf || '').replace(/\D/g, '')
    if (cpf) grupo.cpfsNaoNulos.push(cpf)
    if (!grupo.nomeExibido && p.nome_completo && p.nome_completo.trim()) {
      grupo.nomeExibido = p.nome_completo.trim()
    }
    if (!grupo.nomeExibido && p.email && p.email.trim()) {
      grupo.nomeExibido = p.email.trim()
    }
  }

  for (const grupo of grupos.values()) {
    if (!grupo.nomeExibido) grupo.nomeExibido = '(sem nome)'
    const cpfsDistintos = new Set(grupo.cpfsNaoNulos)
    grupo.cpfsNaoNulos = Array.from(cpfsDistintos)
    grupo.cpfConflitante = cpfsDistintos.size > 1
  }

  return Array.from(grupos.values())
}