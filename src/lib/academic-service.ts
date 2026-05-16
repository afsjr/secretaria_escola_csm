import { supabase } from "./supabase";

interface TurmaData {
  nome: string;
  periodo: string;
  status_ingresso?: string;
  curso_id?: string;
}

interface MatriculaAtiva {
  id: string
  turmas?: { nome?: string }
}

export const AcademicService = {
  // === TURMAS ===

  async getTurmas() {
    const { data, error, count } = await supabase
      .from("turmas")
      .select(`
        id, nome, periodo, status_ingresso, curso_id
      `, { count: 'exact' })
      .order("periodo", { ascending: false })
      .order("nome", { ascending: true });

    return { data, error, count };
  },

  async createTurma({ nome, periodo, status_ingresso = "aberta", curso_id }: TurmaData) {
    const { data, error } = await supabase
      .from("turmas")
      .insert([{ nome, periodo, status_ingresso, curso_id }])
      .select()
      .single();

    return { data, error };
  },

  async updateTurma(turma_id: string, updates: Partial<TurmaData>) {
    const { data, error } = await supabase
      .from("turmas")
      .update(updates)
      .eq("id", turma_id)
      .select()
      .single();
    return { data, error };
  },

  async deleteTurma(turma_id: string) {
    const { data, error } = await supabase
      .from("turmas")
      .delete()
      .eq("id", turma_id)
      .select();

    if (error) return { error };
    if (data && data.length === 0) {
      return { error: { message: "Não foi possível excluir a turma. Verifique se existem matrículas ativas." } };
    }
    return { error: null };
  },

  // === ALUNOS E MATRÍCULAS ===

  async getAlunos() {
    const { data, error } = await supabase
      .from("perfis")
      .select("*")
      .eq("perfil", "aluno")
      .order("nome_completo", { ascending: true });
    return { data, error };
  },

  async matricularAluno(aluno_id: string, turma_id: string) {
    // Validação: Aluno já ativo?
    const { data: matriculasAtivas } = await supabase
      .from("matriculas")
      .select("id, turmas(nome)")
      .eq("aluno_id", aluno_id)
      .eq("status_aluno", "ativo");

    if (matriculasAtivas && matriculasAtivas.length > 0) {
      const nomeTurma = (matriculasAtivas[0] as any).turmas?.nome || "outra turma"
      return { error: { message: `Aluno já ativo na turma "${nomeTurma}".` } };
    }

    const { data, error } = await supabase
      .from("matriculas")
      .insert([{ aluno_id, turma_id, status_aluno: "ativo" }])
      .select()
      .single();

    return { data, error };
  },

  async getAlunosDaTurma(turma_id: string) {
    const { data, error } = await supabase
      .from("matriculas")
      .select(`
        id, status_aluno,
        perfis(id, nome_completo, email, bloqueio_financeiro)
      `)
      .eq("turma_id", turma_id)
      .order("perfis(nome_completo)", { ascending: true });
    return { data, error };
  },

  async atualizarStatusAdministrativo(aluno_id: string, matricula_id: string, status: string, bloqueio: boolean) {
    await supabase.from("perfis").update({ bloqueio_financeiro: bloqueio }).eq("id", aluno_id);
    const { data, error } = await supabase.from("matriculas").update({ status_aluno: status }).eq("id", matricula_id).select();
    return { data, error };
  },

  async excluirMatricula(matricula_id: string) {
    const { data, error } = await supabase.from("matriculas").delete().eq("id", matricula_id).select();
    if (error) return { error };
    return { error: null };
  },

  // === BOLETIM E CONSULTAS COMPOSTAS ===

  // Buscar ofertas reais da turma (substitui a busca genérica por curso)
  async getDisciplinasDaTurma(turmaId: string) {
    const { data, error } = await supabase
      .from("turma_disciplinas")
      .select(`
        id,
        disciplina_base_id,
        professor_id,
        disciplinas_base (id, nome, modulo),
        perfis (nome_completo)
      `)
      .eq("turma_id", turmaId);

    if (error) return { data: null, error };

    // Filtrar duplicatas por disciplina_base_id (mantendo o primeiro professor encontrado)
    const uniqueIds = new Set();
    const uniqueDisciplinas = data
      ?.filter(d => {
        if (!d.disciplina_base_id || uniqueIds.has(d.disciplina_base_id)) return false;
        uniqueIds.add(d.disciplina_base_id);
        return true;
      })
      .map(d => ({
        id: d.id,
        nome: (d.disciplinas_base as any).nome,
        modulo: (d.disciplinas_base as any).modulo,
        professor_nome: (d.perfis as any)?.nome_completo || 'Sem professor',
        disciplina_base_id: d.disciplina_base_id
      })) || [];

    return {
      data: { disciplinas: uniqueDisciplinas },
      error: null
    };
  },

  // Buscar notas completas da turma para uma disciplina do catálogo
  async getNotasCompletasTurma(turmaId: string, disciplinaBaseId: string) {
    const { data: matriculas, error: mError } = await this.getAlunosDaTurma(turmaId);
    if (mError) return { data: null, error: mError };

    const { data: notas, error: nError } = await supabase
      .from("boletim")
      .select("*")
      .eq("disciplina_base_id", disciplinaBaseId);

    if (nError) return { data: null, error: nError };

    const notasMap: Record<string, any> = {};
    notas?.forEach((n) => {
      notasMap[n.aluno_id] = n;
    });

    return {
      data: {
        alunos: matriculas,
        notasMap,
        totalAtivos: matriculas?.filter(m => m.status_aluno === "ativo").length || 0
      },
      error: null
    };
  }
};
