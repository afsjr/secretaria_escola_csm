import { supabase } from './supabase'
import { AuditService } from './audit-service'
import { getUserProfile } from '../auth/session'
import { updateWithLock, fetchWithVersion, isConcurrencyError } from './concurrency-control'
import type { Disciplina, Matricula, Boletim, Aula, DbResult } from '../types'

interface VinculacaoDisciplina {
  disciplinaId: string
  turmaId?: string
}

interface NotaData {
  faltas: number | string
  n1: number | string
  n2: number | string
  n3: number | string
  rec: number | string
}

interface NotaLoteItem {
  aluno_id: string
  faltas: number | string
  n1: number | string
  n2: number | string
  n3: number | string
  rec: number | string
}

interface AulaData {
  disciplina_id: string
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
}

export const ProfessorService = {
  // === DISCIPLINAS ===

  // Buscar disciplinas de um professor específico
  async getDisciplinasDoProfessor(professorId: string) {
    const { data, error } = await supabase
      .from('disciplinas')
      .select(`
        *,
        turmas(id, nome, periodo, cursos(id, nome))
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
  async vincularProfessorDisciplinas(professorId: string, disciplinasIds: string[]) {
    const { data, error } = await supabase
      .from('disciplinas')
      .update({ professor_id: professorId })
      .in('id', disciplinasIds)
      .select()

    return { data, error }
  },

  // Vincular professor + turma a disciplinas
  async vincularProfessorDisciplinasTurma(professorId: string, vinculacoes: VinculacaoDisciplina[]) {
    // vinculacoes = [{ disciplinaId, turmaId }, ...]
    const results: any[] = []
    const errors: any[] = []

    for (const v of vinculacoes) {
      let disciplinaId = v.disciplinaId

      // Se tem turma definida, verificar se já existe uma disciplina com o mesmo nome para essa turma
      if (v.turmaId) {
        // Buscar os dados da disciplina base para copiar
        const { data: disciplinaBase, error: errorBase } = await supabase
          .from('disciplinas')
          .select('nome, modulo, carga_horaria, curso_id')
          .eq('id', v.disciplinaId)
          .single()

        if (errorBase) {
          errors.push(errorBase)
          continue
        }

        // Verificar se já existe disciplina com mesmo nome + turma
        const { data: existente } = await supabase
          .from('disciplinas')
          .select('id')
          .eq('nome', disciplinaBase.nome)
          .eq('turma_id', v.turmaId)
          .single()

        if (existente) {
          // Já existe, atualizar vínculo
          disciplinaId = existente.id
        } else {
          // Criar nova disciplina para essa turma
          const { data: nova, error: errorNova } = await supabase
            .from('disciplinas')
            .insert({
              nome: disciplinaBase.nome,
              modulo: disciplinaBase.modulo,
              carga_horaria: disciplinaBase.carga_horaria,
              curso_id: disciplinaBase.curso_id,
              professor_id: professorId,
              turma_id: v.turmaId,
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (errorNova) {
            errors.push(errorNova)
            continue
          }
          disciplinaId = nova.id
        }
      }

      // Atualizar vínculo do professor
      const { data, error } = await supabase
        .from('disciplinas')
        .update({
          professor_id: professorId,
          turma_id: v.turmaId || null
        })
        .eq('id', disciplinaId)
        .select()

      if (error) {
        errors.push(error)
      } else {
        results.push(data)
      }
    }

    if (errors.length > 0) {
      return { data: null, error: errors[0] }
    }

    return { data: results, error: null }
  },

  // Desvincular professor de uma disciplina
  async desvincularProfessorDisciplina(disciplinaId: string) {
    const { data, error } = await supabase
      .from('disciplinas')
      .update({ professor_id: null, turma_id: null })
      .eq('id', disciplinaId)
      .select()

    return { data, error }
  },

  // === NOTAS ===

  // Buscar notas de uma turma para uma disciplina específica
  async getNotasDaDisciplina(disciplinaNome: string, turmaId: string): Promise<{ data: AlunoComNotas[] | null; error: { message: string } | null }> {
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

    const alunosComNotas: AlunoComNotas[] = await Promise.all(matriculas.map(async (m) => {
      const perfilData = Array.isArray(m.perfis) ? m.perfis[0] : m.perfis as { id: string; nome_completo: string; email: string } | undefined
      const perfil = perfilData || { id: '', nome_completo: 'N/A', email: '' }
      const { data: nota } = await supabase
        .from('boletim')
        .select('*')
        .eq('aluno_id', perfil.id)
        .eq('disciplina', disciplinaNome)
        .single()

      return {
        matricula_id: m.id,
        aluno_id: perfil.id,
        aluno_nome: perfil.nome_completo,
        aluno_email: perfil.email,
        status: m.status_aluno,
        nota: nota || null,
        versao: nota?.versao ?? 1
      }
    }))

    return { data: alunosComNotas, error: null }
  },

  // Salvar nota de um aluno para uma disciplina (com Bloqueio Otimista)
  async salvarNota(alunoId: string, disciplina: string, { faltas, n1, n2, n3, rec }: NotaData, versaoAtual: number = 1) {
    // Primeiro, buscar a nota existente para obter o ID
    const { data: notaExistente } = await supabase
      .from('boletim')
      .select('id')
      .eq('aluno_id', alunoId)
      .eq('disciplina', disciplina)
      .single()

    const dadosAtualizados = {
      aluno_id: alunoId,
      disciplina: disciplina,
      faltas: parseFloat(faltas as string) || 0,
      n1: parseFloat(n1 as string) || 0,
      n2: parseFloat(n2 as string) || 0,
      n3: parseFloat(n3 as string) || 0,
      rec: parseFloat(rec as string) || 0
    }

    // Se existe, usar updateWithLock; se não, usar insert
    if (notaExistente?.id) {
      const resultado = await updateWithLock('boletim', notaExistente.id, dadosAtualizados, versaoAtual)
      
      if (resultado.conflict) {
        await AuditService.log({
          acao: 'conflito_nota',
          tabela_afetada: 'boletim',
          descricao: `Conflito de edição detectado ao salvar nota do aluno ${alunoId} na disciplina "${disciplina}"`,
          dados_novos: dadosAtualizados
        })
      }
      
      return { data: resultado.data, error: resultado.error }
    } else {
      // Insert sem controle de versão (é um novo registro)
      const { data, error } = await supabase
        .from('boletim')
        .insert([{ ...dadosAtualizados, versao: 1 }])
        .select()
        .single()

      return { data, error }
    }
  },

  // Salvar notas em lote (múltiplos alunos de uma disciplina) - com Bloqueio Otimista
  async salvarNotasEmLote(
    disciplina: string, 
    notasArray: (NotaLoteItem & { versao?: number })[]
  ) {
    const conflitos: string[] = []
    const erros: any[] = []

    // Processar cada nota individualmente para manter controle de versão
    for (const item of notasArray) {
      const dadosAtualizados = {
        aluno_id: item.aluno_id,
        disciplina: disciplina,
        faltas: parseFloat(item.faltas as string) || 0,
        n1: parseFloat(item.n1 as string) || 0,
        n2: parseFloat(item.n2 as string) || 0,
        n3: parseFloat(item.n3 as string) || 0,
        rec: parseFloat(item.rec as string) || 0
      }

      // Buscar nota existente
      const { data: notaExistente } = await supabase
        .from('boletim')
        .select('id')
        .eq('aluno_id', item.aluno_id)
        .eq('disciplina', disciplina)
        .single()

      const versao = item.versao ?? 1

      if (notaExistente?.id) {
        const resultado = await updateWithLock('boletim', notaExistente.id, dadosAtualizados, versao)
        
        if (resultado.conflict) {
          conflitos.push(item.aluno_id)
        } else if (resultado.error) {
          erros.push({ aluno_id: item.aluno_id, error: resultado.error })
        }
      } else {
        // Insert sem controle de versão (novo registro)
        const { error: insertError } = await supabase
          .from('boletim')
          .insert([{ ...dadosAtualizados, versao: 1 }])

        if (insertError) {
          erros.push({ aluno_id: item.aluno_id, error: insertError })
        }
      }
    }

    // Registrar no log de auditoria
    if (conflitos.length === 0 && erros.length === 0) {
      await AuditService.log({
        acao: 'lancar_nota_lote',
        tabela_afetada: 'boletim',
        descricao: `Notas lançadas em lote para ${notasArray.length} aluno(s) na disciplina "${disciplina}"`,
        dados_novos: { disciplina, alunos_afetados: notasArray.length }
      })
    }

    // Retornar erro se houve conflitos ou erros
    if (conflitos.length > 0) {
      return { 
        error: { 
          message: `${conflitos.length} conflito(s) detectado(s). Alguns dados foram modificados por outro usuário. Recarregue a página.`,
          code: 'CONFLICT',
          detalhes: conflitos
        } 
      }
    }

    if (erros.length > 0) {
      return { 
        error: { 
          message: `Erro ao salvar ${erros.length} nota(s).`,
          detalhes: erros
        } 
      }
    }

    return { error: null }
  },

  // === REGISTRO DE AULAS E FREQUÊNCIA ===

  // Salvar Frequências (Placeholder para a futura tabela de frequência interligada)
  async salvarFrequencia(turmaId: string, dataAula: string, disciplinaId: string, alunosAusentesIds: string[]) {
    // Aqui no futuro será feito: await supabase.from('frequencias').insert(...)
    console.log('Faltas registradas para:', alunosAusentesIds, 'Data:', dataAula);
    return { data: true, error: null }
  },

  // Registrar nova aula
  async registrarAula({ disciplina_id, professor_id, data, conteudo }: AulaData) {
    const { data: aulaData, error } = await supabase
      .from('aulas')
      .insert([{
        id: crypto.randomUUID(),
        disciplina_id,
        professor_id,
        data: data || new Date().toISOString().split('T')[0],
        conteudo
      }])
      .select()
      .single()

    // Registrar no log de auditoria
    if (!error) {
      await AuditService.log({
        acao: 'registrar_aula',
        tabela_afetada: 'aulas',
        registro_id: aulaData?.id,
        descricao: `Aula registrada: "${conteudo}" em ${data}`,
        dados_novos: { disciplina_id, professor_id, data, conteudo }
      })
    }

    return { data: aulaData, error }
  },

  // Buscar aulas de uma disciplina
  async getAulasDaDisciplina(disciplinaId: string) {
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
  async getAulasDoProfessor(professorId: string) {
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
  async atualizarAula(aulaId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('aulas')
      .update(updates)
      .eq('id', aulaId)
      .select()
      .single()

    return { data, error }
  },

  // Excluir aula
  async excluirAula(aulaId: string) {
    const { data: aulaAtual, error: fetchError } = await supabase
      .from('aulas')
      .select('*')
      .eq('id', aulaId)
      .single()

    const { data, error } = await supabase
      .from('aulas')
      .delete()
      .eq('id', aulaId)
      .select()

    // Registrar no log de auditoria
    if (!error) {
      await AuditService.log({
        acao: 'delete_aula',
        tabela_afetada: 'aulas',
        registro_id: aulaId,
        descricao: `Aula excluída: "${aulaAtual?.conteudo || aulaId}"`,
        dados_antigos: aulaAtual
      })
    }

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
  async getAlunosDaTurma(turmaId: string) {
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
  },

  // Buscar turmas do professor (através das disciplinas)
  async getTurmasDoProfessor(professorId: string) {
    // Primeiro buscar as disciplinas do professor
    const { data: disciplinas, error: errorDisciplinas } = await supabase
      .from('disciplinas')
      .select(`
        id, nome, modulo, turma_id,
        turmas(id, nome, periodo)
      `)
      .eq('professor_id', professorId)
      .not('turma_id', 'is', null)

    if (errorDisciplinas) return { data: null, error: errorDisciplinas }

    // Extrair turmas únicas
    const turmasMap = new Map<string, any>()
    disciplinas.forEach((d: any) => {
      if (d.turmas && !turmasMap.has(d.turmas.id)) {
        turmasMap.set(d.turmas.id, {
          ...d.turmas,
          disciplinas: []
        })
      }
      if (d.turmas) {
        turmasMap.get(d.turmas.id).disciplinas.push({
          id: d.id,
          nome: d.nome,
          modulo: d.modulo
        })
      }
    })

    const turmas = Array.from(turmasMap.values())
    return { data: turmas, error: null }
  },

  // Buscar disciplinas de uma turma específica para um professor
  async getDisciplinasPorTurma(professorId: string, turmaId: string) {
    const { data, error } = await supabase
      .from('disciplinas')
      .select(`
        id, nome, modulo
      `)
      .eq('professor_id', professorId)
      .eq('turma_id', turmaId)
      .order('modulo', { ascending: true })
      .order('nome', { ascending: true })

    return { data, error }
  },

  // Contar alunos matriculados em uma turma
  async contarAlunosTurma(turmaId: string) {
    const { count, error } = await supabase
      .from('matriculas')
      .select('*', { count: 'exact', head: true })
      .eq('turma_id', turmaId)
      .eq('status_aluno', 'ativo')

    return { count: count || 0, error }
  }
}
