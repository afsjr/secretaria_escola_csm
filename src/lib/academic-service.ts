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

  async getTipoDaTurma(turma_id: string): Promise<string | null> {
    const { data } = await supabase
      .from("turmas")
      .select("cursos(tipo_curso)")
      .eq("id", turma_id)
      .single();
    return (data as any)?.cursos?.tipo_curso ?? null;
  },

  async matricularAluno(aluno_id: string, turma_id: string) {
    const tipoAlvo = await this.getTipoDaTurma(turma_id);

    if (tipoAlvo !== 'formacao') {
      const { data: matriculasAtivas } = await supabase
        .from("matriculas")
        .select("id, turmas(nome)")
        .eq("aluno_id", aluno_id)
        .eq("status_aluno", "ativo");

      if (matriculasAtivas && matriculasAtivas.length > 0) {
        const nomeTurma = (matriculasAtivas[0] as any).turmas?.nome || "outra turma"
        return { error: { message: `Aluno já ativo na turma "${nomeTurma}".` } };
      }
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
        perfis(id, nome_completo)
      `)
      .eq("turma_id", turma_id)
      .order("perfis(nome_completo)", { ascending: true });
    return { data, error } as any;
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

    // Filtrar duplicatas por Nome + Módulo (normalizando espaços e caixa)
    const seenItems = new Set();
    const uniqueDisciplinas = data
      ?.filter(d => {
        const disc = d.disciplinas_base as any;
        if (!disc || !disc.nome) return false;
        // Normalização agressiva: remove espaços extras e ignora maiúsculas/minúsculas
        const normalizedName = disc.nome.toLowerCase().trim().replace(/\s+/g, ' ');
        const normalizedModulo = (disc.modulo || '').toLowerCase().trim();
        const key = `${normalizedName}-${normalizedModulo}`;
        
        if (seenItems.has(key)) return false;
        seenItems.add(key);
        return true;
      })
      .map(d => ({
        id: d.id,
        nome: (d.disciplinas_base as any).nome.trim(),
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
  },

  // Buscar boletim completo de um aluno
  async getBoletim(alunoId: string) {
    const { data, error } = await supabase
      .from("boletim")
      .select(`
        *,
        disciplinas_base (id, nome, modulo)
      `)
      .eq("aluno_id", alunoId);
    return { data, error };
  },

  // Salvar nota de estágio (Fluxo Secretaria)
  async upsertNotaEstagio(alunoId: string, disciplinaBaseId: string, nota: number) {
    // 1. Verificar se já existe registro
    const { data: existente } = await supabase
      .from("boletim")
      .select("id, versao")
      .eq("aluno_id", alunoId)
      .eq("disciplina_base_id", disciplinaBaseId)
      .single();

    if (existente) {
      const { data, error } = await supabase
        .from("boletim")
        .update({ 
          nota_estagio: nota,
          versao: (existente.versao || 1) + 1
        })
        .eq("id", existente.id)
        .select();
      return { data, error };
    } else {
      const { data, error } = await supabase
        .from("boletim")
        .insert([{ 
          aluno_id: alunoId, 
          disciplina_base_id: disciplinaBaseId,
          nota_estagio: nota,
          versao: 1
        }])
        .select();
      return { data, error };
    }
  }
};
