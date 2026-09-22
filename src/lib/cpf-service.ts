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
   * Verifica se o CPF informado já existe em outro perfil ativo.
   * Usa a RPC `cpf_ja_existe` (funciona também no autocadastro sob RLS);
   * se a RPC não existir, cai no fallback de leitura direta da tabela.
   */
  async cpfJaExiste(cpf: string, ignorarId?: string): Promise<{ data: boolean; error: { message: string } | null }> {
    const alvo = normalizarCPF(cpf)
    if (!alvo) return { data: false, error: null }

    let rpcData: unknown = null
    let rpcError: { message: string } | null = null
    if (typeof (supabase as any).rpc === 'function') {
      try {
        const res = await supabase.rpc('cpf_ja_existe', { p_cpf: alvo })
        rpcData = res.data
        rpcError = res.error
      } catch {
        rpcError = { message: 'rpc indisponível' }
      }
    } else {
      rpcError = { message: 'rpc indisponível' }
    }

    if (!rpcError && typeof rpcData === 'boolean') {
      if (!rpcData) return { data: false, error: null }
      if (ignorarId) {
        const { data } = await supabase.from('perfis').select('id, cpf').not('cpf', 'is', null)
        const outros = (data || []).some((p: any) => p.id !== ignorarId && normalizarCPF(p.cpf) === alvo)
        return { data: outros, error: null }
      }
      return { data: true, error: null }
    }

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
      .or('status.is.null,status.neq.inativo')
      .not('cadastro_desativado', 'is', true)
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
