import { supabase } from "./supabase";
import { CourseService } from "./course-service";
import { calcularMediaParcial, calcularNotaFinal, calcularStatusAluno, disciplinaTemEstagio } from "./grades-utils";
import type { AtaResultadosData, AtaAlunoResultado, AtaComponenteResultado, AtaSituacaoComponente, AtaStatusAluno } from "../types/domain";

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

  // === DIÁRIO DE CLASSE ===

  async getAulasPorTurmaPeriodo(turmaId: string, dataInicio: string, dataFim: string) {
    const { data, error } = await supabase
      .from('aulas')
      .select(`
        data,
        conteudo,
        turma_disciplinas!inner(
          turma_id!inner(),
          disciplinas_base (nome, carga_horaria),
          perfis!turma_disciplinas_professor_id_fkey (nome_completo)
        )
      `)
      .eq('turma_disciplinas.turma_id', turmaId)
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .order('data', { ascending: true })

    if (error) return { data: null, error }

    const aulas = data || []
    const disciplinaMap: Record<string, any> = {}

    aulas.forEach((aula: any) => {
      const td = aula.turma_disciplinas
      if (!td) return
      const disc = td.disciplinas_base
      if (!disc) return
      const prof = td.perfis
      const nomeDisc = disc.nome
      if (!disciplinaMap[nomeDisc]) {
        disciplinaMap[nomeDisc] = {
          disciplina_nome: nomeDisc,
          carga_horaria: disc.carga_horaria || 0,
          professor_nome: prof?.nome_completo || 'Sem professor',
          aulas: [],
          total_aulas: 0,
        }
      }
      disciplinaMap[nomeDisc].aulas.push({
        data: aula.data,
        conteudo: aula.conteudo,
        professor_nome: prof?.nome_completo || 'Sem professor',
      })
      disciplinaMap[nomeDisc].total_aulas++
    })

    Object.values(disciplinaMap).forEach((disc: any) => {
      disc.aulas.sort((a: any, b: any) => a.data.localeCompare(b.data))
    })

    const disciplinas = Object.values(disciplinaMap) as any[]
    disciplinas.sort((a, b) => a.disciplina_nome.localeCompare(b.disciplina_nome))

    return { data: { disciplinas }, error: null }
  },

  // Salvar nota de estágio (Fluxo Secretaria)
  async upsertNotaEstagio(alunoId: string, disciplinaBaseId: string, nota: number | string, parecer?: string | null) {
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
          estagio_parecer: parecer ?? null,
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
          estagio_parecer: parecer ?? null,
          versao: 1
        }])
        .select();
      return { data, error };
    }
  },

  // Salvar notas de estágio em lote (Fluxo Secretaria / Coordenação)
  async upsertNotaEstagioLote(items: { aluno_id: string; disciplina_base_id: string; nota: number | string; estagio_parecer?: string | null }[]) {
    if (!items || items.length === 0) {
      return { data: [], error: null };
    }

    const results = await Promise.all(
      items.map(item => this.upsertNotaEstagio(item.aluno_id, item.disciplina_base_id, item.nota, item.estagio_parecer))
    );

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      return {
        data: results.map(r => r.data),
        error: { message: `${errors.length} nota(s) de estágio falharam ao salvar.` }
      };
    }

    return { data: results.map(r => r.data), error: null };
  },

  // === ATA DE RESULTADOS FINAIS ===

  // Monta o payload de leitura da Ata de Resultados Finais de uma turma.
  // Somente leitura: nunca grava em banco e não recalcula aprovação de forma nova —
  // reutiliza grades-utils (calcularMediaParcial/calcularNotaFinal/calcularStatusAluno).
  async getDadosAtaTurma(turmaId: string) {
    const { data: turma, error: turmaError } = await supabase
      .from("turmas")
      .select("id, nome, periodo, curso_id, cursos(id, nome)")
      .eq("id", turmaId)
      .single();

    if (turmaError) return { data: null, error: turmaError };
    if (!turma?.curso_id) {
      return { data: null, error: { message: "Turma sem curso vinculado. Não é possível emitir a Ata de Resultados Finais." } };
    }

    const { data: catalogo, error: catError } = await CourseService.getMatrizCurricular(turma.curso_id);
    if (catError) return { data: null, error: catError };
    if (!catalogo?.length) {
      return { data: null, error: { message: "Nenhum componente curricular cadastrado na matriz do curso. Não é possível emitir a Ata." } };
    }

    const { data: matriculas, error: matError } = await supabase
      .from("matriculas")
      .select("id, aluno_id, status_aluno, perfis(id, nome_completo)")
      .eq("turma_id", turmaId)
      .order("perfis(nome_completo)", { ascending: true });

    if (matError) return { data: null, error: matError };
    if (!matriculas?.length) {
      return { data: null, error: { message: "Nenhum aluno matriculado na turma. Não é possível emitir a Ata." } };
    }

    const alunos = matriculas.map((m: any) => {
      const perfil = Array.isArray(m.perfis) ? m.perfis[0] : m.perfis;
      return {
        matricula_id: m.id,
        aluno_id: m.aluno_id,
        status_aluno: (m.status_aluno || "ativo") as AtaStatusAluno,
        nome_completo: perfil?.nome_completo || "Aluno sem cadastro",
      };
    });

    const { data: boletins, error: bolError } = await supabase
      .from("boletim")
      .select("aluno_id, disciplina_base_id, faltas, n1, n2, n3, rec, nota_estagio, status")
      .in("aluno_id", alunos.map(a => a.aluno_id));

    if (bolError) return { data: null, error: bolError };

    const boletimPorAlunoComponente: Record<string, any> = {};
    (boletins || []).forEach((b: any) => {
      if (!b.aluno_id || !b.disciplina_base_id) return;
      boletimPorAlunoComponente[`${b.aluno_id}:${b.disciplina_base_id}`] = b;
    });

    const componentesOrdenados = [...catalogo].sort((a: any, b: any) => {
      const porModulo = String(a.modulo || "").localeCompare(String(b.modulo || ""));
      if (porModulo !== 0) return porModulo;
      const oa = a.ordem ?? Number.MAX_SAFE_INTEGER;
      const ob = b.ordem ?? Number.MAX_SAFE_INTEGER;
      if (oa !== ob) return oa - ob;
      return String(a.nome || "").localeCompare(String(b.nome || ""));
    });

    const resultadoAlunos: AtaAlunoResultado[] = alunos.map((aluno) => {
      const componentes: AtaComponenteResultado[] = componentesOrdenados.map((c: any) => {
        const boletim = boletimPorAlunoComponente[`${aluno.aluno_id}:${c.id}`];
        return this._montarComponenteResultado(c, boletim);
      });

      const temNota = componentes.some(c => c.nota_final > 0);
      const situacaoFinal = this._derivarSituacaoFinal(aluno.status_aluno, componentes, temNota);
      const frequenciaGeral = componentes.length
        ? Math.round(componentes.reduce((acc, c) => acc + c.percentual_frequencia, 0) / componentes.length)
        : 0;

      return {
        matricula_id: aluno.matricula_id,
        aluno_id: aluno.aluno_id,
        nome_completo: aluno.nome_completo,
        status_aluno: aluno.status_aluno,
        situacao_final: situacaoFinal,
        frequencia_geral: frequenciaGeral,
        componentes,
      };
    });

    const data: AtaResultadosData = {
      turma_id: turma.id,
      turma_nome: turma.nome,
      periodo: turma.periodo,
      ano_letivo: this._extrairAnoLetivo(turma.periodo),
      curso_nome: (turma.cursos as any)?.nome || "Curso",
      polo: null,
      alunos: resultadoAlunos,
    };

    return { data, error: null };
  },

  _extrairAnoLetivo(periodo: string): number {
    const m = String(periodo || "").match(/20\d{2}|19\d{2}/);
    return m ? parseInt(m[0], 10) : new Date().getFullYear();
  },

  _montarComponenteResultado(componente: any, boletim: any): AtaComponenteResultado {
    const cargaHoraria = Number(componente.carga_horaria) || 0;
    const faltas = Number(boletim?.faltas) || 0;
    const n1 = Number(boletim?.n1) || 0;
    const n2 = Number(boletim?.n2) || 0;
    const n3 = Number(boletim?.n3) || 0;
    const rec = Number(boletim?.rec) || 0;

    const media = calcularMediaParcial(n1, n2, n3);
    const notaFinal = calcularNotaFinal(media, rec);

    let status: AtaSituacaoComponente = "Cursando";
    if (notaFinal > 0) {
      status = (calcularStatusAluno(notaFinal) as AtaSituacaoComponente) === "Aprovado" ? "Aprovado" : "Reprovado";
    }

    const percentualFrequencia = cargaHoraria > 0
      ? Math.max(0, Math.min(100, Math.round(100 - (faltas * 100) / cargaHoraria)))
      : 100;

    const temEstagio = disciplinaTemEstagio(componente.nome, componente.modulo);
    const notaEstagio = temEstagio ? (boletim?.nota_estagio || null) : null;

    return {
      disciplina_base_id: componente.id || null,
      nome: componente.nome || "Componente",
      modulo: componente.modulo || null,
      carga_horaria: cargaHoraria,
      nota_final: notaFinal,
      nota_final_texto: notaFinal > 0 ? notaFinal.toFixed(1) : "-",
      faltas,
      percentual_frequencia: percentualFrequencia,
      nota_estagio: notaEstagio,
      tem_estagio: temEstagio,
      status,
    };
  },

  _derivarSituacaoFinal(statusAluno: AtaStatusAluno, componentes: AtaComponenteResultado[], temNota: boolean): string {
    if (statusAluno === "evadido" && !temNota) return "—";
    if (statusAluno !== "ativo") {
      switch (statusAluno) {
        case "trancado": return "Trancado";
        case "evadido": return "Evadido";
        case "concluido": return "Concluído";
        default: return statusAluno;
      }
    }
    const statuses = componentes.map(c => c.status);
    if (statuses.length && statuses.every(s => s === "Aprovado")) return "Aprovado";
    if (statuses.some(s => s === "Reprovado")) return "Reprovado";
    return "Cursando";
  }
};

