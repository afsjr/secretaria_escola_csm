export interface DisciplinaTurma {
  id: string;
  nome: string;
  modulo: string;
  turma_id?: string;
  turmas?: {
    id: string;
    nome: string;
    periodo?: string;
  };
  cursos?: {
    nome: string;
  };
}

export interface TurmaGroup {
  id?: string;
  nome: string;
  periodo: string;
  curso: string;
  disciplinas: DisciplinaTurma[];
}

export interface NotaExistente {
  id?: string;
  aluno_id: string;
  disciplina: string;
  versao?: number;
  faltas?: number;
  n1?: number;
  n2?: number;
  n3?: number;
  rec?: number;
  status?: string | null;
}

export interface AlunoBaixaMedia {
  nome: string;
  media: number;
}