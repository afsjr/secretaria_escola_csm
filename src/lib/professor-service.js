import { supabase } from './supabase'

export const ProfessorService = {
  // === DISCIPLINAS ===
  
  // Buscar disciplinas de um professor específico
  async getDisciplinasDoProfessor(professorId) {
    const { data, error } = await supabase
      .from('disciplinas')
      .select(`
        *,
        turmas(id, nome, periodo)
      `)
      .eq('professor_id', professorId)
      .order('modulo', { ascending: true })
      .order('nome', { ascending: true })
    
    return { data, error }
  },

  // Buscar todas as disciplinas (para secretaria)
  async getAllDisciplinas() {
    const { data, error } = await supabase
      .from('disciplinas')
      .select(`
        *,
        turmas(id, nome, periodo),
        perfis!disciplinas_professor_id_fkey(id, nome_completo)
      `)
      .order('modulo', { ascending: true })
      .order('nome', { ascending: true })
    
    return { data, error }
  },

  // Vincular professor a disciplinas
  async vincularProfessorDisciplinas(professorId, disciplinasIds) {
    const { data, error } = await supabase
      .from('disciplinas')
      .update({ professor_id: professorId })
      .in('id', disciplinasIds)
      .select()
    
    return { data, error }
  },

  // Desvincular professor de uma disciplina
  async desvincularProfessorDisciplina(disciplinaId) {
    const { data, error } = await supabase
      .from('disciplinas')
      .update({ professor_id: null })
      .eq('id', disciplinaId)
      .select()
    
    return { data, error }
  },

  // === NOTAS ===
  
  // Buscar notas de uma turma para uma disciplina específica
  async getNotasDaDisciplina(disciplinaNome, turmaId) {
    // Primeiro buscar os alunos da turma
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

    // Depois buscar as notas de cada aluno para a disciplina
    const alunosComNotas = await Promise.all(matriculas.map(async (m) => {
      const { data: nota } = await supabase
        .from('boletim')
        .select('*')
        .eq('aluno_id', m.perfis.id)
        .eq('disciplina', disciplinaNome)
        .single()

      return {
        matricula_id: m.id,
        aluno_id: m.perfis.id,
        aluno_nome: m.perfis.nome_completo,
        aluno_email: m.perfis.email,
        status: m.status_aluno,
        nota: nota || null
      }
    }))

    return { data: alunosComNotas, error: null }
  },

  // Salvar nota de um aluno para uma disciplina
  async salvarNota(alunoId, disciplina, { faltas, n1, n2, n3, rec }) {
    const { data, error } = await supabase
      .from('boletim')
      .upsert({
        aluno_id: alunoId,
        disciplina: disciplina,
        faltas: parseFloat(faltas) || 0,
        n1: parseFloat(n1) || 0,
        n2: parseFloat(n2) || 0,
        n3: parseFloat(n3) || 0,
        rec: parseFloat(rec) || 0
      }, { onConflict: 'aluno_id, disciplina' })
      .select()
    
    return { data, error }
  },

  // Salvar notas em lote (múltiplos alunos de uma disciplina)
  async salvarNotasEmLote(disciplina, notasArray) {
    const payload = notasArray.map(item => ({
      aluno_id: item.aluno_id,
      disciplina: disciplina,
      faltas: parseFloat(item.faltas) || 0,
      n1: parseFloat(item.n1) || 0,
      n2: parseFloat(item.n2) || 0,
      n3: parseFloat(item.n3) || 0,
      rec: parseFloat(item.rec) || 0
    }))

    const { error } = await supabase
      .from('boletim')
      .upsert(payload, { onConflict: 'aluno_id, disciplina' })
    
    return { error }
  },

  // === REGISTRO DE AULAS ===
  
  // Registrar nova aula
  async registrarAula({ disciplina_id, professor_id, data, conteudo }) {
    const { data: aulaData, error } = await supabase
      .from('aulas')
      .insert([{
        disciplina_id,
        professor_id,
        data: data || new Date().toISOString().split('T')[0],
        conteudo
      }])
      .select()
      .single()
    
    return { data: aulaData, error }
  },

  // Buscar aulas de uma disciplina
  async getAulasDaDisciplina(disciplinaId) {
    const { data, error } = await supabase
      .from('aulas')
      .select(`
        *,
        perfis!aulas_professor_id_fkey(id, nome_completo)
      `)
      .eq('disciplina_id', disciplinaId)
      .order('data', { ascending: false })
    
    return { data, error }
  },

  // Buscar aulas de um professor
  async getAulasDoProfessor(professorId) {
    const { data, error } = await supabase
      .from('aulas')
      .select(`
        *,
        disciplinas(id, nome, modulo)
      `)
      .eq('professor_id', professorId)
      .order('data', { ascending: false })
    
    return { data, error }
  },

  // Atualizar aula
  async atualizarAula(aulaId, updates) {
    const { data, error } = await supabase
      .from('aulas')
      .update(updates)
      .eq('id', aulaId)
      .select()
      .single()
    
    return { data, error }
  },

  // Excluir aula
  async excluirAula(aulaId) {
    const { data, error } = await supabase
      .from('aulas')
      .delete()
      .eq('id', aulaId)
      .select()
    
    return { data, error }
  },

  // === LISTAS AUXILIARES ===
  
  // Buscar professores (para secretaria)
  async getProfessores() {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('perfil', 'professor')
      .order('nome_completo', { ascending: true })
    
    return { data, error }
  },

  // Buscar alunos de uma turma
  async getAlunosDaTurma(turmaId) {
    const { data, error } = await supabase
      .from('matriculas')
      .select(`
        id, status_aluno,
        perfis(id, nome_completo, email)
      `)
      .eq('turma_id', turmaId)
      .eq('status_aluno', 'ativo')
      .order('perfis(nome_completo)', { ascending: true })
    
    return { data, error }
  }
}
