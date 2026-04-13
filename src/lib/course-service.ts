import { supabase } from './supabase'

interface CursoData {
  nome: string
  descricao?: string
}

interface DisciplinaData {
  nome: string
  modulo: string
  cursoId: string
}

export const CourseService = {

  // Buscar todos os cursos
  async getCursos() {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .order('nome', { ascending: true })

    return { data, error }
  },

  // Buscar cursos ativos
  async getCursosAtivos() {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true })

    return { data, error }
  },

  // Criar novo curso
  async createCurso({ nome, descricao }: CursoData) {
    const { data, error } = await supabase
      .from('cursos')
      .insert([{ nome, descricao }])
      .select()
      .single()

    return { data, error }
  },

  // Atualizar curso
  async updateCurso(cursoId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('cursos')
      .update(updates)
      .eq('id', cursoId)
      .select()
      .single()

    return { data, error }
  },

  // Desativar curso (soft delete)
  async desativarCurso(cursoId: string) {
    const { data, error } = await supabase
      .from('cursos')
      .update({ ativo: false })
      .eq('id', cursoId)
      .select()
      .single()

    return { data, error }
  },

  // Reativar curso
  async reativarCurso(cursoId: string) {
    const { data, error } = await supabase
      .from('cursos')
      .update({ ativo: true })
      .eq('id', cursoId)
      .select()
      .single()

    return { data, error }
  },

  // Buscar turmas de um curso específico
  async getTurmasDoCurso(cursoId: string) {
    const { data, error } = await supabase
      .from('turmas')
      .select(`
        *,
        matriculas ( count )
      `)
      .eq('curso_id', cursoId)
      .order('periodo', { ascending: false })
      .order('nome', { ascending: true })

    return { data, error }
  },

  // Buscar disciplinas de um curso específico
  async getDisciplinasDoCurso(cursoId: string) {
    const { data, error } = await supabase
      .from('disciplinas')
      .select(`
        *,
        turmas(id, nome, periodo),
        perfis!disciplinas_professor_id_fkey(id, nome_completo)
      `)
      .eq('curso_id', cursoId)
      .order('modulo', { ascending: true })
      .order('nome', { ascending: true })

    return { data, error }
  },

  // Criar disciplina para um curso
  async createDisciplina({ nome, modulo, cursoId }: DisciplinaData) {
    const { data, error } = await supabase
      .from('disciplinas')
      .insert([{ nome, modulo, curso_id: cursoId }])
      .select()
      .single()

    return { data, error }
  },

  // Atualizar curso de uma turma
  async vincularTurmaAoCurso(turmaId: string, cursoId: string) {
    const { data, error } = await supabase
      .from('turmas')
      .update({ curso_id: cursoId })
      .eq('id', turmaId)
      .select()
      .single()

    return { data, error }
  },

  // Buscar curso de uma turma
  async getCursoDaTurma(turmaId: string) {
    const { data, error } = await supabase
      .from('turmas')
      .select(`
        *,
        cursos(id, nome, descricao)
      `)
      .eq('id', turmaId)
      .single()

    return { data, error }
  }
}
