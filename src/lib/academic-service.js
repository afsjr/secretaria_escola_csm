import { supabase } from './supabase'

export const AcademicService = {
  // === TURMAS ===
  
  // Buscar todas as turmas (com quantidade de matriculados se possível)
  async getTurmas() {
    const { data, error } = await supabase
      .from('turmas')
      .select(`
        id, nome, periodo, status_ingresso,
        matriculas ( count )
      `)
      .order('periodo', { ascending: false })
      .order('nome', { ascending: true })
    
    return { data, error }
  },

  // Criar uma nova Turma
  async createTurma({ nome, periodo, status_ingresso = 'aberta' }) {
    const { data, error } = await supabase
      .from('turmas')
      .insert([{ nome, periodo, status_ingresso }])
      .select()
      .single()
    
    return { data, error }
  },

  // === ALUNOS E MATRÍCULAS ===
  
  // Buscar perfis para a Secretaria (Para matricular)
  async getAlunos() {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('perfil', 'aluno')
      .order('nome_completo', { ascending: true })
      
    return { data, error }
  },

  // Matricular aluno numa turma
  async matricularAluno(aluno_id, turma_id) {
    // 0. Validação de Regra de Negócio: O aluno já está ativo em alguma turma?
    const { data: matriculasAtivas, error: checkError } = await supabase
      .from('matriculas')
      .select('id, turmas(nome)')
      .eq('aluno_id', aluno_id)
      .eq('status_aluno', 'ativo')

    if (checkError) return { error: checkError }

    // Se encontrou alguma matrícula ativa, bloqueia a inserção
    if (matriculasAtivas && matriculasAtivas.length > 0) {
      const nomeTurmaAtual = matriculasAtivas[0].turmas?.nome || 'outra turma'
      return { 
        error: { 
          message: `Este estudante já possui uma matrícula ativa na turma "${nomeTurmaAtual}". Por favor, altere o status dele para Trancado, Concluído ou Evadido na turma antiga antes de enturmá-lo novamente.` 
        } 
      }
    }

    // 1. O código cria a matrícula se não houver bloqueios
    const { data, error } = await supabase
      .from('matriculas')
      .insert([{ aluno_id, turma_id, status_aluno: 'ativo' }])
      .select()
      .single()
      
    return { data, error }
  },

  // Buscar alunos de uma turma específica
  async getAlunosDaTurma(turma_id) {
    const { data, error } = await supabase
      .from('matriculas')
      .select(`
        id, status_aluno,
        perfis(id, nome_completo, email, bloqueio_financeiro)
      `)
      .eq('turma_id', turma_id)
      .order('perfis(nome_completo)', { ascending: true })

    return { data, error }
  },

  // Atualizar Status do Aluno e Bloqueio Financeiro (Visão Secretaria)
  async atualizarStatusAdministrativo(aluno_id, matricula_id, status_aluno, bloqueio) {
    // 1. Bloqueio no Perfil (financeiro)
    const { error: errorPerfil } = await supabase
      .from('perfis')
      .update({ bloqueio_financeiro: bloqueio })
      .eq('id', aluno_id)

    if (errorPerfil) return { error: errorPerfil }

    // 2. Status na Matrícula (acadêmico)
    const { data, error: errorMatricula } = await supabase
      .from('matriculas')
      .update({ status_aluno: status_aluno })
      .eq('id', matricula_id)
      .select()

    return { data, error: errorMatricula }
  }
}
