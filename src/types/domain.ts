/**
 * Interfaces de Domínio - Sistema CSM
 * Substitui uso de "any" para melhor type safety
 */

import type { UserProfile, UserRole } from './index'

// =====================================================
// PERFIL / USUÁRIO
// =====================================================

export interface PerfilCompleto extends UserProfile {
  data_nascimento?: string | null
  genero?: string | null
  estado_civil?: string | null
  cidade_natal?: string | null
  nacionalidade?: string | null
  profissao?: string | null
  graduacao?: string | null
  data_conclusao_graduacao?: string | null
  rg?: string | null
  orgao_expedidor?: string | null
  data_expedicao_rg?: string | null
  whatsapp?: string | null
  bloqueio_financeiro?: boolean
  updated_at?: string
}

// =====================================================
// ENDEREÇO
// =====================================================

export interface Endereco {
  id?: string
  user_id?: string
  cep?: string
  bairro?: string
  logradouro?: string
  numero?: string
  complemento?: string
  cidade?: string
  uf?: string
  created_at?: string
}

// =====================================================
// CURSO
// =====================================================

export interface Curso {
  id: string
  nome: string
  descricao?: string | null
  ativo?: boolean
  created_at?: string
}

// =====================================================
// TURMA
// =====================================================

export interface Turma {
  id: string
  nome: string
  periodo: string
  status_ingresso?: 'aberta' | 'fechada'
  curso_id?: string | null
  created_at?: string
  cursos?: Curso
}

export interface TurmaCompleta extends Turma {
  curso_nome?: string
  total_alunos?: number
  disciplinas_count?: number
}

// =====================================================
// DISCIPLINA
// =====================================================

export interface Disciplina {
  id: string
  nome: string
  modulo?: string | null
  turma_id?: string | null
  professor_id?: string | null
  curso_id?: string | null
  created_at?: string
  turmas?: Pick<Turma, 'id' | 'nome' | 'periodo'>
  cursos?: Pick<Curso, 'id' | 'nome'>
}

export interface DisciplinaComProfessor extends Disciplina {
  professor?: Pick<UserProfile, 'id' | 'nome_completo' | 'email'>
}

// =====================================================
// MATRÍCULA
// =====================================================

export interface Matricula {
  id: string
  aluno_id: string
  turma_id: string
  status_aluno?: 'ativo' | 'trancado' | 'evadido' | 'concluido'
  created_at?: string
  turmas?: Pick<Turma, 'id' | 'nome' | 'periodo'>
  perfis?: Pick<UserProfile, 'id' | 'nome_completo' | 'email' | 'cpf'>
}

export interface MatriculaDetalhada extends Matricula {
  aluno?: UserProfile
  turma?: Turma
  curso?: Curso
}

// =====================================================
// BOLETIM / NOTAS
// =====================================================

export interface Boletim {
  id: string
  aluno_id: string
  disciplina: string
  faltas?: number
  n1?: number | null
  n2?: number | null
  n3?: number | null
  rec?: number | null
  created_at?: string
}

// =====================================================
// AULA
// =====================================================

export interface Aula {
  id: string
  disciplina_id: string
  professor_id?: string | null
  data: string
  conteudo: string
  created_at?: string
}

export interface AulaCompleta extends Aula {
  disciplina?: Pick<Disciplina, 'id' | 'nome'>
  professor?: Pick<UserProfile, 'id' | 'nome_completo'>
}

// =====================================================
// SOLICITAÇÕES DE DOCUMENTOS
// =====================================================

export interface Solicitacao {
  id: string
  user_id: string
  tipo: string
  status?: 'pendente' | 'concluido'
  criado_em?: string
  perfis?: Pick<UserProfile, 'id' | 'nome_completo' | 'email'>
}

// =====================================================
// RESULTADOS COMUNS
// =====================================================

export interface DbResult<T> {
  data: T | null
  error: { message: string; code?: string; details?: string } | null
}

export interface DbResultSingle<T> extends DbResult<T> {
  data: T | null
}

export interface DbResultList<T> extends DbResult<T[]> {
  data: T[] | null
  count?: number
}

// =====================================================
// VIEW MODELS (Retornos de Views)
// =====================================================

export interface DadosProfessorCompleto {
  perfil: PerfilCompleto
  endereco: Endereco | null
  disciplinas: Disciplina[]
  disciplinasError?: { message: string } | null
}

export interface AlunoComNotas {
  aluno_id: string
  aluno_nome: string
  aluno_email: string
  nota?: Partial<Boletim>
}

export interface DadosAlunoCompleto {
  perfil: UserProfile
  endereco: Endereco | null
  responsaveis: unknown[]
  observacoes: unknown[]
  matricula: unknown | null
}

// =====================================================
// SERVICE RESULT TYPES
// =====================================================

export interface ServiceResult<T> {
  data: T | null
  error: { message: string } | null
}

export interface ServiceResultList<T> extends ServiceResult<T[]> {
  count?: number
}

export interface CreateTurmaResult {
  id: string
  nome: string
  periodo: string
}

export interface UpdateTurmaResult {
  id: string
  nome: string
  periodo: string
}

export interface DadosAlunoCompleto {
  perfil: UserProfile
  matriculas: MatriculaDetalhada[]
 boletim: Boletim[]
  endereco: Endereco | null
}

// =====================================================
// FILTROS DE CONSULTA
// =====================================================

export interface FiltroAluno {
  nome?: string
  cpf?: string
  turma_id?: string
  status?: string
  curso_id?: string
}

export interface FiltroTurma {
  periodo?: string
  curso_id?: string
  status?: string
}

export interface FiltroDisciplina {
  modulo?: string
  turma_id?: string
  professor_id?: string
}

// =====================================================
// VALidaÇÕES
// =====================================================

export const GENERO_OPCOES = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
  { value: 'prefiro_nao_informar', label: 'Prefiro não informar' },
] as const

export const ESTADO_CIVIL_OPCOES = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
  { value: 'uniao_estavel', label: 'União Estável' },
] as const

export const STATUS_ALUNO_OPCOES = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'trancado', label: 'Trancado' },
  { value: 'evadido', label: 'Evadido' },
  { value: 'concluido', label: 'Concluído' },
] as const

export const PERFIL_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  master_admin: 'Gestor do Sistema',
  secretaria: 'Secretaria',
  financeiro: 'Financeiro',
  professor: 'Professor',
  aluno: 'Aluno',
}