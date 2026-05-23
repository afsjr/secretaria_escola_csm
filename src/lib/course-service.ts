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
  }
}

