import { supabase } from './supabase'
import { AuditService } from './audit-service'
import { updateWithLock } from './concurrency-control'
import type { Boletim } from '../types'

interface AulaData {
  turma_disciplina_id: string
  professor_id: string
  data?: string
  conteudo: string
}

interface AlunoComNotas {
  matricula_id: string
  aluno_id: string
  aluno_nome: string
  aluno_email: string
  status: string
  nota: Boletim | null
  versao: number
  pendente?: boolean
}

interface NotaData {
  faltas: number | string
  n1: number | string
  n2: number | string
  n3: number | string
  rec: number | string
}

export const ProfessorService = {
  // === DISCIPLINAS E OFERTAS ===

  // Buscar ofertas (turma+disciplina) de um professor específico
  async getDisciplinasDoProfessor(professorId: string) {
    const { data, error } = await supabase
      .from('turma_disciplinas')
      .select(`
        *,
        disciplinas_base (id, nome, modulo, carga_horaria, curso_id),
        turmas (id, nome, periodo, cursos(id, nome))
      `)
      .eq('professor_id', professorId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Buscar todas as ofertas (para secretaria)
  async getAllOfertas() {
    const { data, error } = await supabase
      .from('turma_disciplinas')
      .select(`
        *,
        turmas(id, nome, periodo),
        disciplinas_base(id, nome, modulo),
        perfis(id, nome_completo)
      `)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Vincular professor a uma oferta específica
  async vincularProfessorAOferta(ofertaId: string, professorId: string) {
    const { data, error } = await supabase
      .from('turma_disciplinas')
      .update({ professor_id: professorId })
      .eq('id', ofertaId)
      .select()
      .single()

    return { data, error }
  },

  // === NOTAS (BOLETIM) ===

  // Buscar notas de uma turma para uma disciplina do catálogo
  async getNotasDaDisciplina(disciplinaBaseId: string, turmaId: string): Promise<{ data: AlunoComNotas[] | null; error: { message: string } | null }> {
    // 1. Buscar alunos da turma
    const { data: matriculas, error: errorMatriculas } = await supabase
      .from('matriculas')
      .select(`
        id, status_aluno,
        perfis(id, nome_completo, email)
      `)
      .eq('turma_id', turmaId)
      .eq('status_aluno', 'ativo')
      .order('perfis(nome_completo)', { ascending: true })

    if (errorMatriculas) return { data: null, error: errorMatriculas }

    // 2. Buscar notas vinculadas ao disciplina_base_id
    const alunosComNotas: AlunoComNotas[] = await Promise.all(matriculas.map(async (m) => {
      const perfilData = Array.isArray(m.perfis) ? m.perfis[0] : m.perfis as any
      const perfil = perfilData || { id: '', nome_completo: 'N/A', email: '' }
      
      const { data: nota } = await supabase
        .from('boletim')
        .select('*')
        .eq('aluno_id', perfil.id)
        .eq('disciplina_base_id', disciplinaBaseId)
        .single()

      const pendente = nota?.status === 'pendente'

      return {
        matricula_id: m.id,
        aluno_id: perfil.id,
        aluno_nome: perfil.nome_completo,
        aluno_email: perfil.email,
        status: m.status_aluno,
        nota: pendente ? null : (nota || null),
        versao: nota?.versao ?? 1,
        pendente
      }
    }))

    return { data: alunosComNotas, error: null }
  },

  // Salvar nota vinculada ao catálogo
  async salvarNota(alunoId: string, disciplinaBaseId: string, { faltas, n1, n2, n3, rec }: NotaData, versaoAtual: number = 1) {
    // Buscar nome da disciplina para manter compatibilidade com campo TEXT antigo se necessário
    const { data: discBase } = await supabase
      .from('disciplinas_base')
      .select('nome')
      .eq('id', disciplinaBaseId)
      .single()

    const { data: notaExistente } = await supabase
      .from('boletim')
      .select('id')
      .eq('aluno_id', alunoId)
      .eq('disciplina_base_id', disciplinaBaseId)
      .single()

    const dados = {
      aluno_id: alunoId,
      disciplina_base_id: disciplinaBaseId,
      disciplina: discBase?.nome || 'N/A', // Mantém o campo texto atualizado
      faltas: parseFloat(faltas as string) || 0,
      n1: parseFloat(n1 as string) || 0,
      n2: parseFloat(n2 as string) || 0,
      n3: parseFloat(n3 as string) || 0,
      rec: parseFloat(rec as string) || 0
    }

    if (notaExistente?.id) {
      const resultado = await updateWithLock('boletim', notaExistente.id, dados, versaoAtual)
      return { data: resultado.data, error: resultado.error }
    } else {
      const { data, error } = await supabase
        .from('boletim')
        .insert([{ ...dados, versao: 1 }])
        .select()
        .single()
      return { data, error }
    }
  },

  // Salvar várias notas de uma vez (Batch)
  async salvarNotasEmLote(disciplinaBaseId: string, notas: any[]) {
    // Buscar nome da disciplina uma vez só
    const { data: discBase } = await supabase
      .from('disciplinas_base')
      .select('nome')
      .eq('id', disciplinaBaseId)
      .single()

    const promises = notas.map(n => 
      this.salvarNota(n.aluno_id, disciplinaBaseId, {
        faltas: n.faltas,
        n1: n.n1,
        n2: n.n2,
        n3: n.n3,
        rec: n.rec
      }, n.versao)
    )

    const results = await Promise.all(promises)
    const error = results.find(r => r.error)?.error

    return { data: results.map(r => r.data), error }
  },

  // === REGISTRO DE AULAS ===

  // Registrar aula vinculada à oferta (turma_disciplina)
  async registrarAula({ turma_disciplina_id, professor_id, data, conteudo }: AulaData) {
    const { data: aulaData, error } = await supabase
      .from('aulas')
      .insert([{
        turma_disciplina_id,
        professor_id,
        data: data || new Date().toISOString().split('T')[0],
        conteudo
      }])
      .select()
      .single()

    if (!error) {
      await AuditService.log({
        acao: 'registrar_aula',
        tabela_afetada: 'aulas',
        registro_id: aulaData?.id,
        descricao: `Aula registrada no novo modelo: "${conteudo}"`,
        dados_novos: { turma_disciplina_id, professor_id, data, conteudo }
      })
    }

    return { data: aulaData, error }
  },

  // Buscar aulas de uma oferta específica
  async getAulasDaOferta(ofertaId: string) {
    const { data, error } = await supabase
      .from('aulas')
      .select(`
        *,
        perfis(id, nome_completo)
      `)
      .eq('turma_disciplina_id', ofertaId)
      .order('data', { ascending: false })

    return { data, error }
  },

  // Buscar todas as aulas de um professor
  async getAulasDoProfessor(professorId: string) {
    const { data, error } = await supabase
      .from('aulas')
      .select(`
        *,
        turma_disciplinas (
          id,
          disciplinas_base (nome, modulo),
          turmas (nome)
        )
      `)
      .eq('professor_id', professorId)
      .order('data', { ascending: false })

    return { data, error }
  },

  // === AUXILIARES ===

  async getProfessores() {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('perfil', 'professor')
      .order('nome_completo', { ascending: true })
    return { data, error }
  },

  async getAlunosDaTurma(turmaId: string) {
    const { data, error } = await supabase
      .from('matriculas')
      .select(`
        id, status_aluno,
        perfis(id, nome_completo, email)
      `)
      .eq('turma_id', turmaId)
      .eq('status_aluno', 'ativo')
    return { data, error }
  },

  async contarAlunosTurma(turmaId: string) {
    const { count, error } = await supabase
      .from('matriculas')
      .select('*', { count: 'exact', head: true })
      .eq('turma_id', turmaId)
      .eq('status_aluno', 'ativo')
    return { count: count || 0, error }
  },

  // Alias para compatibilidade com visões legadas
  async getAulasDaDisciplina(ofertaId: string) {
    return this.getAulasDaOferta(ofertaId)
  },

  async atualizarAula(aulaId: string, updates: Partial<AulaData>) {
    const { data, error } = await supabase
      .from('aulas')
      .update(updates)
      .eq('id', aulaId)
      .select()
      .single()
    return { data, error }
  },

  async excluirAula(aulaId: string) {
    const { error } = await supabase
      .from('aulas')
      .delete()
      .eq('id', aulaId)
    return { error }
  },

  async salvarFrequencia(turmaId: string, disciplinaId: string, data: string, presencas: any[]) {
    // Implementação simplificada para compatibilidade
    // Na prática, isso deve inserir na tabela de frequencia se existir
    console.log('Frequencia recebida:', { turmaId, disciplinaId, data, count: presencas.length })
    return { data: true, error: null }
  }
}

