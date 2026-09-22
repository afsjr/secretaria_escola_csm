import { supabase } from './supabase'
import { normalizarCPF } from './validation'

export interface PerfilCpf {
  id: string
  nome_completo: string
  email?: string | null
  perfil?: string | null
  cpf?: string | null
  created_at?: string | null
}

export interface CpfDuplicado {
  cpf: string
  perfis: PerfilCpf[]
}

export interface InconsistenciasCPF {
  semCpf: PerfilCpf[]
  duplicados: CpfDuplicado[]
}

export const CpfService = {
  /**
   * Verifica se o CPF informado já existe em outro perfil.
   * A comparação é feita apenas pelos dígitos, tolerando dados legados formatados.
   */
  async cpfJaExiste(cpf: string, ignorarId?: string): Promise<{ data: boolean; error: { message: string } | null }> {
    const alvo = normalizarCPF(cpf)
    if (!alvo) return { data: false, error: null }

    const { data, error } = await supabase
      .from('perfis')
      .select('id, cpf')
      .not('cpf', 'is', null)

    if (error) return { data: false, error }

    const existe = (data || []).some((p: any) =>
      p.id !== ignorarId && normalizarCPF(p.cpf) === alvo
    )

    return { data: existe, error: null }
  },

  /**
   * Lista as inconsistências de CPF atuais: perfis sem CPF e CPFs duplicados.
   * Não altera nenhum registro.
   */
  async listarInconsistenciasCPF(): Promise<{ data: InconsistenciasCPF | null; error: { message: string } | null }> {
    const { data, error } = await supabase
      .from('perfis')
      .select('id, nome_completo, email, perfil, cpf, created_at')
      .order('nome_completo', { ascending: true })

    if (error) return { data: null, error }

    const semCpf: PerfilCpf[] = []
    const grupos = new Map<string, PerfilCpf[]>()

    for (const perfil of (data || []) as PerfilCpf[]) {
      const normalizado = normalizarCPF(perfil.cpf)
      if (!normalizado) {
        semCpf.push(perfil)
        continue
      }
      const lista = grupos.get(normalizado) || []
      lista.push(perfil)
      grupos.set(normalizado, lista)
    }

    const duplicados: CpfDuplicado[] = Array.from(grupos.entries())
      .filter(([, perfis]) => perfis.length > 1)
      .map(([cpf, perfis]) => ({ cpf, perfis }))

    return { data: { semCpf, duplicados }, error: null }
  }
}
