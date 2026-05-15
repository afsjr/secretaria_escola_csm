import { supabase } from "./supabase";

interface TurmaData {
  nome: string;
  periodo: string;
  status_ingresso?: string;
}

interface MatriculaPayload {
  aluno_id: string;
  turma_id: string;
  status_aluno?: string;
}

interface NotaItem {
  disciplina: string;
  modulo?: string;
  faltas: number | string;
  n1: number | string;
  n2: number | string;
  n3: number | string;
  rec: number | string;
  nota_estagio?: string;
}

interface MatriculaAtiva {
  id: string
  turmas?: { nome?: string }
}

interface TurmaComCurso {
  id: string
  nome: string
  periodo: string
  curso_id: string | null
  cursos?: { id: string; nome: string }[]
}

interface DisciplinaItem {
  id: string
  nome: string
  modulo: string | null
}

export const AcademicService = {
  // === TURMAS ===

  // Buscar todas as turmas (com quantidade de matriculados se possível)
  async getTurmas() {
    const { data, error, count } = await supabase
      .from("turmas")
      .select(`
        id, nome, periodo, status_ingresso
      `, { count: 'exact' })
      .order("periodo", { ascending: false })
      .order("nome", { ascending: true });

    return { data, error, count };
  },

  // Criar uma nova Turma
  async createTurma({ nome, periodo, status_ingresso = "aberta" }: TurmaData) {
    const { data, error } = await supabase
      .from("turmas")
      .insert([{ nome, periodo, status_ingresso }])
      .select()
      .single();

    return { data, error };
  },

  // Atualizar uma Turma (ex: renomear)
  async updateTurma(turma_id: string, updates: Partial<TurmaData>) {
    const { data, error } = await supabase
      .from("turmas")
      .update(updates)
      .eq("id", turma_id)
      .select()
      .single();

    return { data, error };
  },

  // Excluir permanentemente uma Turma
  async deleteTurma(turma_id: string) {
    const { data, error } = await supabase
      .from("turmas")
      .delete()
      .eq("id", turma_id)
      .select();

    if (error) return { error };

    if (data && data.length === 0) {
      return {
        error: {
          message:
            "Operação barrada pelo Banco de Dados. Você pode não ter permissão ou a turma possui matrículas atreladas.",
        },
      };
    }

    return { error: null };
  },

  // === ALUNOS E MATRÍCULAS ===

  // Buscar perfis para a Secretaria (Para matricular)
  async getAlunos() {
    const { data, error } = await supabase
      .from("perfis")
      .select("*")
      .eq("perfil", "aluno")
      .order("nome_completo", { ascending: true });

    return { data, error };
  },

  // Matricular aluno numa turma
  async matricularAluno(aluno_id: string, turma_id: string) {
    // 0. Validação de Regra de Negócio: O aluno já está ativo em alguma turma?
    const { data: matriculasAtivas, error: checkError } = await supabase
      .from("matriculas")
      .select("id, turmas(nome)")
      .eq("aluno_id", aluno_id)
      .eq("status_aluno", "ativo");

    if (checkError) return { error: checkError };

    // Se encontrou alguma matrícula ativa, bloqueia a inserção
    if (matriculasAtivas && matriculasAtivas.length > 0) {
      const primeiraMatricula = matriculasAtivas[0] as MatriculaAtiva
      const nomeTurmaAtual = primeiraMatricula?.turmas?.nome || "outra turma"
      return {
        error: {
          message:
            `Este estudante já possui uma matrícula ativa na turma "${nomeTurmaAtual}". Por favor, altere o status dele para Trancado, Concluído ou Evadido na turma antiga antes de enturmá-lo novamente.`,
        },
      };
    }

    // 1. O código cria a matrícula se não houver bloqueios
    const { data, error } = await supabase
      .from("matriculas")
      .insert([{ aluno_id, turma_id, status_aluno: "ativo" }])
      .select()
      .single();

    return { data, error };
  },

  // Buscar alunos de uma turma específica
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

  // Atualizar Status do Aluno e Bloqueio Financeiro (Visão Secretaria)
  async atualizarStatusAdministrativo(
    aluno_id: string,
    matricula_id: string,
    status_aluno: string,
    bloqueio: boolean,
  ) {
    // 1. Bloqueio no Perfil (financeiro)
    const { error: errorPerfil } = await supabase
      .from("perfis")
      .update({ bloqueio_financeiro: bloqueio })
      .eq("id", aluno_id);

    if (errorPerfil) return { error: errorPerfil };

    // 2. Status na Matrícula (acadêmico)
    const { data, error: errorMatricula } = await supabase
      .from("matriculas")
      .update({ status_aluno: status_aluno })
      .eq("id", matricula_id)
      .select();

    return { data, error: errorMatricula };
  },

  // Excluir permanentemente uma matrícula (em caso de erro da secretaria)
  async excluirMatricula(matricula_id: string) {
    const { data, error } = await supabase
      .from("matriculas")
      .delete()
      .eq("id", matricula_id)
      .select();

    if (error) return { error };

    // Se o banco executou 'com sucesso', mas não apagou nada, geralmente é trava de segurança/RLS
    if (data && data.length === 0) {
      return {
        error: {
          message:
            "Operação barrada pelo Banco de Dados. Você pode não ter permissão ou o aluno possui notas atreladas.",
        },
      };
    }

    return { error: null };
  },

  // === BOLETIM ===

  // Puxar as notas reais preenchidas de um aluno específico
  async getBoletim(aluno_id: string) {
    const { data, error } = await supabase
      .from("boletim")
      .select("*")
      .eq("aluno_id", aluno_id);

    return { data, error };
  },

  // Salvar a grade inteira de disciplinas no banco do aluno
  async saveBoletim(aluno_id: string, notasArray: NotaItem[]) {
    // Array deve ser no modelo: [{ disciplina: 'Anatomia e Fisiologia Humana', faltas: 2, n1: 7.5, n2: 8, n3: 0, rec: 0, nota_estagio: 'AP' }, ...]

    const payload = notasArray.map((item) => ({
      aluno_id,
      disciplina: item.disciplina,
      faltas: parseFloat(item.faltas as string) || 0,
      n1: parseFloat(item.n1 as string) || 0,
      n2: parseFloat(item.n2 as string) || 0,
      n3: parseFloat(item.n3 as string) || 0,
      rec: parseFloat(item.rec as string) || 0,
      ...(item.nota_estagio ? { nota_estagio: item.nota_estagio } : {}),
    }));

    // upsert = update if exists, insert Se novo (precisa da constraint 'aluno_id, disciplina' que acabamos de criar)
    const { error } = await supabase
      .from("boletim")
      .upsert(payload, { onConflict: "aluno_id, disciplina" });

    return { error };
  },

  // Atualizar nota de estágio de uma disciplina específica
  async updateNotaEstagio(notaId: string, valor: number) {
    const { data, error } = await supabase
      .from("boletim")
      .update({ nota_estagio: valor })
      .eq("id", notaId)
      .select()
      .single();

    return { data, error };
  },

  // === MÉTODOS COMPOSTOS (Composer Pattern) ===

  // Buscar turma com informações do curso relacionado
  async getTurmaWithCurso(turmaId: string) {
    const { data, error } = await supabase
      .from("turmas")
      .select(`
        id, nome, periodo, curso_id,
        cursos(id, nome)
      `)
      .eq("id", turmaId)
      .single();

    if (!data) return { data: null, error }

    const turmaData: TurmaComCurso = {
      id: data.id,
      nome: data.nome,
      periodo: data.periodo,
      curso_id: data.curso_id,
      cursos: data.cursos as TurmaComCurso['cursos']
    }

    return { data: turmaData, error };
  },

  // Buscar disciplinas de um curso específico
  async getDisciplinasPorCurso(cursoId: string) {
    const { data, error } = await supabase
      .from("disciplinas")
      .select("id, nome, modulo")
      .eq("curso_id", cursoId)
      .order("modulo", { ascending: true })
      .order("nome", { ascending: true });

    return { data: data as DisciplinaItem[] | null, error };
  },

  // Buscar notas de uma disciplina específica
  async getNotasPorDisciplina(disciplinaNome: string) {
    const { data, error } = await supabase
      .from("boletim")
      .select("*")
      .eq("disciplina", disciplinaNome);

    return { data, error };
  },

  // Método composto: Buscar disciplinas de uma turma
  // Orchestras: getTurmaWithCurso + getDisciplinasPorCurso
  async getDisciplinasDaTurma(turmaId: string) {
    const { data: turmaData, error: turmaError } = await this.getTurmaWithCurso(turmaId);

    if (turmaError) {
      return { data: null, error: turmaError };
    }

    if (!turmaData?.curso_id) {
      return {
        data: null,
        error: { message: "Turma sem curso associado" }
      };
    }

    const { data: disciplinas, error: disciplinasError } = await this.getDisciplinasPorCurso(turmaData.curso_id);

    if (disciplinasError) {
      return { data: null, error: disciplinasError };
    }

    return {
      data: {
        turma: {
          id: turmaData.id,
          nome: turmaData.nome,
          periodo: turmaData.periodo,
          curso_id: turmaData.curso_id
        },
        disciplinas: disciplinas || []
      },
      error: null
    };
  },

  // Método composto: Buscar notas completas de uma turma para uma disciplina
  // Orchestras: getAlunosDaTurma + getNotasPorDisciplina
  async getNotasCompletasTurma(turmaId: string, disciplinaNome: string) {
    const { data: matriculas, error: matriculasError } = await this.getAlunosDaTurma(turmaId);

    if (matriculasError) {
      return { data: null, error: matriculasError };
    }

    if (!matriculas || matriculas.length === 0) {
      return {
        data: {
          alunos: [],
          notasMap: {},
          totalAtivos: 0
        },
        error: null
      };
    }

    const { data: notas, error: notasError } = await this.getNotasPorDisciplina(disciplinaNome);

    if (notasError) {
      return { data: null, error: notasError };
    }

    const notasMap: Record<string, any> = {};
    notas?.forEach((n) => {
      notasMap[n.aluno_id] = n;
    });

    const ativos = matriculas.filter((m) => m.status_aluno === "ativo");

    return {
      data: {
        alunos: matriculas,
        notasMap,
        totalAtivos: ativos.length
      },
      error: null
    };
  },
};
