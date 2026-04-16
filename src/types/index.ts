/**
 * Tipos compartilhados para o SGE CSM
 */

export type UserRole =
  | "master_admin"
  | "admin"
  | "secretaria"
  | "coordenacao"
  | "financeiro"
  | "professor"
  | "aluno";

export interface UserProfile {
  id: string;
  email: string;
  nome_completo: string;
  perfil: UserRole;
  cpf?: string;
  telefone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  message?: string;
}

export interface ValidationError {
  success: false;
  errors: string[];
}

export interface ValidationSuccess<T = Record<string, unknown>> {
  success: true;
  data: T;
}

export type ValidationResult<T = Record<string, unknown>> =
  | ValidationSuccess<T>
  | ValidationError;

export interface SupabaseResponse<T = unknown> {
  data: T | null;
  error: {
    message: string;
    code?: string;
    details?: string;
  } | null;
}

export interface AsyncOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  customMessage?: string;
  onError?: (error: Error, args: unknown[]) => void;
}

export type Permission =
  | "view_dashboard"
  | "view_colegas"
  | "view_documentos"
  | "view_matriz"
  | "view_secretaria"
  | "view_turmas"
  | "view_academico"
  | "view_professor"
  | "view_perfil"
  | "view_financeiro"
  | "manage_users"
  | "manage_turmas"
  | "manage_matriculas"
  | "manage_notas"
  | "manage_cursos"
  | "manage_documentos"
  | "manage_professores"
  | "manage_financeiro"
  | "manage_instituicao"
  | "manage_aulas";

// =====================================================
// Re-export from domain types
// =====================================================

export type { PerfilCompleto, Endereco, Curso, Turma, Disciplina, Matricula, Boletim, Aula, Solicitacao } from './domain'
export type { DbResult, DbResultSingle, DbResultList, DadosProfessorCompleto, AlunoComNotas, ServiceResult, ServiceResultList, CreateTurmaResult, UpdateTurmaResult } from './domain'
