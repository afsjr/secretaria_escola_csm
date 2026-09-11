import { supabase } from './supabase'
import { AuditService } from './audit-service'

interface CursoData {
  nome: string
  descricao?: string
  tipo?: 'tecnico' | 'formacao'
}

interface DisciplinaBaseData {
  nome: string
  modulo: string
  cursoId: string
  cargaHoraria?: number
}

export const CourseService = {

  // =====================================================
  // CURSOS
  // =====================================================

  async getCursos(tipo?: 'tecnico' | 'formacao') {
    let query = supabase
      .from('cursos')
      .select('*')
      .order('nome', { ascending: true })

    if (tipo) {
      query = query.eq('tipo_curso', tipo)
    }

    const { data, error } = await query
    return { data, error }
  },

  async getCursosAtivos(tipo?: 'tecnico' | 'formacao') {
    let query = supabase
      .from('cursos')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true })

    if (tipo) {
      query = query.eq('tipo_curso', tipo)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createCurso({ nome, descricao, tipo }: CursoData) {
    const { data, error } = await supabase
      .from('cursos')
      .insert([{ nome, descricao, tipo: tipo || 'tecnico' }])
      .select()
      .single()

    if (!error && data) {
      AuditService.log({
        acao: 'criar_curso',
        tabela_afetada: 'cursos',
        registro_id: data.id,
        descricao: `Curso criado: ${nome} (${tipo || 'tecnico'})`,
        dados_novos: { nome, descricao, tipo: tipo || 'tecnico' }
      })
    }

    return { data, error }
  },

  async updateCurso(cursoId: string, updates: { nome?: string; descricao?: string; tipo_curso?: 'tecnico' | 'formacao' }) {
    if (updates.tipo_curso) {
      const { data: turmasAtivas } = await supabase
        .from('turmas')
        .select('id')
        .eq('curso_id', cursoId)
        .limit(1)

      if (turmasAtivas && turmasAtivas.length > 0) {
        return { data: null, error: { message: 'Não é possível mudar tipo com turmas ativas' } }
      }
    }

    const { data, error } = await supabase
      .from('cursos')
      .update(updates)
      .eq('id', cursoId)
      .select()
      .single()

    if (!error && data) {
      AuditService.log({
        acao: 'atualizar_curso',
        tabela_afetada: 'cursos',
        registro_id: cursoId,
        descricao: `Curso atualizado: ${data.nome}`,
        dados_novos: updates
      })
    }

    return { data, error }
  },

  async desativarCurso(cursoId: string) {
    const { data, error } = await supabase
      .from('cursos')
      .update({ ativo: false })
      .eq('id', cursoId)
    return { data, error }
  },

  async reativarCurso(cursoId: string) {
    const { data, error } = await supabase
      .from('cursos')
      .update({ ativo: true })
      .eq('id', cursoId)
    return { data, error }
  },

  // =====================================================
  // MATRIZ CURRICULAR (Disciplinas Base)
  // =====================================================

  // Buscar todas as disciplinas do catálogo de um curso
  async getMatrizCurricular(cursoId: string) {
    const { data, error } = await supabase
      .from('disciplinas_base')
      .select('*')
      .eq('curso_id', cursoId)
      .order('modulo', { ascending: true })
      .order('nome', { ascending: true })
    return { data, error }
  },

  // Adicionar disciplina ao catálogo do curso
  async addDisciplinaAoCatalogo({ nome, modulo, cursoId, cargaHoraria = 40 }: DisciplinaBaseData) {
    const { data, error } = await supabase
      .from('disciplinas_base')
      .insert([{ 
        nome, 
        modulo, 
        curso_id: cursoId,
        carga_horaria: cargaHoraria 
      }])
      .select()
      .single()
    return { data, error }
  },

  // =====================================================
  // TURMAS E OFERTAS (Alocações)
  // =====================================================

  // Atualizar datas de início/fim de uma oferta
  async atualizarDatasOferta(ofertaId: string, data_inicio: string, data_fim: string) {
    const { data, error } = await supabase
      .from('turma_disciplinas')
      .update({ data_inicio, data_fim })
      .eq('id', ofertaId)
      .select()
      .single()
    return { data, error }
  },

  // Buscar ofertas de uma turma incluindo datas
  async getOfertasDaTurmaComDatas(turmaId: string) {
    const { data, error } = await supabase
      .from('turma_disciplinas')
      .select(`
        *,
        disciplinas_base (id, nome, modulo, carga_horaria, ordem),
        perfis (id, nome_completo)
      `)
      .eq('turma_id', turmaId)
      .order('data_inicio', { ascending: true, nullsFirst: false })
    return { data, error }
  },

  async getTurmasDoCurso(cursoId: string) {
    const { data, error } = await supabase
      .from('turmas')
      .select(`
        *,
        matriculas ( count )
      `)
      .eq('curso_id', cursoId)
      .order('periodo', { ascending: false })
    return { data, error }
  },

  // Buscar o que uma turma específica está cursando (Ofertas)
  async getOfertasDaTurma(turmaId: string) {
    const { data, error } = await supabase
      .from('turma_disciplinas')
      .select(`
        *,
        disciplinas_base (id, nome, modulo, carga_horaria),
        perfis (id, nome_completo)
      `)
      .eq('turma_id', turmaId)
    return { data, error }
  },

  // Criar uma nova oferta (Vincular disciplina do catálogo a uma turma e professor)
  async criarOfertaDisciplina(turmaId: string, disciplinaBaseId: string, professorId?: string, data_inicio?: string, data_fim?: string) {
    const { data: existente } = await supabase
      .from('turma_disciplinas')
      .select('id')
      .eq('turma_id', turmaId)
      .eq('disciplina_base_id', disciplinaBaseId)
      .maybeSingle()

    if (existente) {
      return { data: null, error: { message: 'Esta disciplina já foi ofertada para esta turma.' } }
    }

    const { data, error } = await supabase
      .from('turma_disciplinas')
      .insert([{
        turma_id: turmaId,
        disciplina_base_id: disciplinaBaseId,
        professor_id: professorId,
        data_inicio,
        data_fim
      }])
      .select()
      .single()
    return { data, error }
  },

  // Atualizar professor de uma oferta
  async atribuirProfessorAEstrutura(ofertaId: string, professorId: string) {
    const { data, error } = await supabase
      .from('turma_disciplinas')
      .update({ professor_id: professorId })
      .eq('id', ofertaId)
    return { data, error }
  },

  async getCursoDaTurma(turmaId: string) {
    const { data, error } = await supabase
      .from('turmas')
      .select(`
        *,
        cursos(id, nome, descricao, tipo_curso)
      `)
      .eq('id', turmaId)
      .single()
    return { data, error }
  },

  async removerOfertaDisciplina(ofertaId: string) {
    const { data, error } = await supabase
      .from('turma_disciplinas')
      .delete()
      .eq('id', ofertaId)
      .select()
    return { data, error }
  },

  // Vincular (ou substituir) o professor responsável por uma disciplina da turma
  async vincularProfessorDisciplina(turmaId: string, disciplinaBaseId: string, professorId: string) {
    const { data: existente } = await supabase
      .from('turma_disciplinas')
      .select('id, professor_id')
      .eq('turma_id', turmaId)
      .eq('disciplina_base_id', disciplinaBaseId)
      .maybeSingle()

    let data: any = null
    let error: { message: string } | null = null

    if (existente?.id) {
      const result = await supabase
        .from('turma_disciplinas')
        .update({ professor_id: professorId })
        .eq('id', existente.id)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      const result = await supabase
        .from('turma_disciplinas')
        .insert([{
          turma_id: turmaId,
          disciplina_base_id: disciplinaBaseId,
          professor_id: professorId
        }])
        .select()
        .single()
      data = result.data
      error = result.error
    }

    if (!error && data) {
      AuditService.log({
        acao: 'vincular_professor',
        tabela_afetada: 'turma_disciplinas',
        registro_id: data.id,
        descricao: `Professor vinculado à disciplina (turma ${turmaId})`,
        dados_antigos: existente ? { professor_id: existente.professor_id ?? null } : null,
        dados_novos: { turma_id: turmaId, disciplina_base_id: disciplinaBaseId, professor_id: professorId }
      })
    }

    return { data, error }
  },

  // Desvincular o professor de uma disciplina da turma, preservando a oferta
  async desvincularProfessorDisciplina(turmaId: string, disciplinaBaseId: string) {
    const { data: existente } = await supabase
      .from('turma_disciplinas')
      .select('id, professor_id')
      .eq('turma_id', turmaId)
      .eq('disciplina_base_id', disciplinaBaseId)
      .maybeSingle()

    if (!existente?.id) {
      return { data: null, error: { message: 'Oferta não encontrada para esta turma e disciplina.' } }
    }

    const { data, error } = await supabase
      .from('turma_disciplinas')
      .update({ professor_id: null })
      .eq('id', existente.id)
      .select()
      .single()

    if (!error && data) {
      AuditService.log({
        acao: 'desvincular_professor',
        tabela_afetada: 'turma_disciplinas',
        registro_id: existente.id,
        descricao: `Professor desvinculado da disciplina (turma ${turmaId})`,
        dados_antigos: { professor_id: existente.professor_id ?? null },
        dados_novos: { professor_id: null }
      })
    }

    return { data, error }
  },

  // Verifica se a oferta já possui histórico acadêmico (aulas ou notas)
  async ofertaPossuiHistorico(ofertaId: string, turmaId: string, disciplinaBaseId: string) {
    const { count: aulasCount } = await supabase
      .from('aulas')
      .select('*', { count: 'exact', head: true })
      .eq('turma_disciplina_id', ofertaId)

    if ((aulasCount || 0) > 0) return { data: true, error: null }

    const { data: matriculas } = await supabase
      .from('matriculas')
      .select('aluno_id')
      .eq('turma_id', turmaId)
      .eq('status_aluno', 'ativo')

    const alunoIds = (matriculas || []).map((m: any) => m.aluno_id).filter(Boolean)
    if (!alunoIds.length) return { data: false, error: null }

    const { count: notasCount } = await supabase
      .from('boletim')
      .select('*', { count: 'exact', head: true })
      .eq('disciplina_base_id', disciplinaBaseId)
      .in('aluno_id', alunoIds)

    return { data: (notasCount || 0) > 0, error: null }
  }
}

