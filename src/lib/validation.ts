/**
 * Validação de Inputs com Zod
 *
 * Fornece schemas e funções de validação para dados de entrada
 * em formulários do sistema.
 */

import { z } from "zod";
import type { ValidationResult } from "../types";

/**
 * Schema para validação de login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(
      8,
      "A senha deve ter pelo menos 8 caracteres e conter letras e números",
    ),
});

/**
 * Schema para validação de cadastro de usuário
 */
export const signupSchema = z.object({
  nomeCompleto: z
    .string()
    .min(1, "Nome completo é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(200, "Nome muito longo"),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  cpf: z
    .string()
    .optional()
    .refine((val) => !val || validarCPF(val), {
      message: "CPF inválido",
    }),
  telefone: z
    .string()
    .optional()
    .refine((val) => !val || validarTelefone(val), {
      message: "Telefone inválido. Use o formato: (00) 00000-0000",
    }),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha muito longa")
    .refine((val) => /[A-Za-z]/.test(val), {
      message: "A senha deve conter pelo menos uma letra",
    })
    .refine((val) => /\d/.test(val), {
      message: "A senha deve conter pelo menos um número",
    }),
});

/**
 * Schema para validação de atualização de perfil
 */
export const profileUpdateSchema = z.object({
  nomeCompleto: z
    .string()
    .min(1, "Nome completo é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(200, "Nome muito longo"),
  cpf: z
    .string()
    .optional()
    .refine((val) => !val || validarCPF(val), {
      message: "CPF inválido",
    }),
  telefone: z
    .string()
    .optional()
    .refine((val) => !val || validarTelefone(val), {
      message: "Telefone inválido. Use o formato: (00) 00000-0000",
    }),
});

/**
 * Schema para validação de criação de turma
 */
export const turmaSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome da turma é obrigatório")
    .max(100, "Nome muito longo"),
  periodo: z
    .string()
    .min(1, "Período é obrigatório")
    .max(50, "Período muito longo"),
});

/**
 * Schema para validação de notas
 */
export const notaSchema = z.object({
  disciplina: z.string().min(1, "Disciplina é obrigatória"),
  faltas: z
    .union([z.string(), z.number()])
    .transform((val) => parseFloat(String(val)) || 0)
    .refine((val) => val >= 0, { message: "Faltas não podem ser negativas" }),
  n1: z
    .union([z.string(), z.number()])
    .transform((val) => parseFloat(String(val)) || 0)
    .refine((val) => val >= 0 && val <= 10, {
      message: "Nota deve estar entre 0 e 10",
    }),
  n2: z
    .union([z.string(), z.number()])
    .transform((val) => parseFloat(String(val)) || 0)
    .refine((val) => val >= 0 && val <= 10, {
      message: "Nota deve estar entre 0 e 10",
    }),
  n3: z
    .union([z.string(), z.number()])
    .transform((val) => parseFloat(String(val)) || 0)
    .refine((val) => val >= 0 && val <= 10, {
      message: "Nota deve estar entre 0 e 10",
    }),
  rec: z
    .union([z.string(), z.number()])
    .transform((val) => parseFloat(String(val)) || 0)
    .refine((val) => val >= 0 && val <= 10, {
      message: "Recuperação deve estar entre 0 e 10",
    }),
});

/**
 * Validar CPF (algoritmo brasileiro)
 */
export function validarCPF(cpf: string | undefined): boolean {
  if (!cpf) return true;

  // Remover caracteres não numéricos
  cpf = cpf.replace(/\D/g, "");

  // Verificar se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verificar se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Calcular primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  // Calcular segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
}

/**
 * Validar telefone brasileiro
 */
export function validarTelefone(telefone: string | undefined): boolean {
  if (!telefone) return true;

  // Remover caracteres não numéricos
  const numeros = telefone.replace(/\D/g, "");

  // Verificar se tem 10 ou 11 dígitos (com ou sem 9)
  return numeros.length >= 10 && numeros.length <= 11;
}

/**
 * Validar dados contra um schema e retornar erros formatados
 * @param schema - Schema Zod
 * @param data - Dados a validar
 * @returns Objeto com sucesso e dados ou erros
 */
export function validateData<T extends z.ZodType>(
  schema: T,
  data: unknown,
): ValidationResult<z.infer<T>> {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err) => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ["Erro de validação desconhecido"] };
  }
}

/**
 * Validar login
 */
export function validateLogin(data: unknown): ValidationResult {
  return validateData(loginSchema, data);
}

/**
 * Validar cadastro
 */
export function validateSignup(data: unknown): ValidationResult {
  return validateData(signupSchema, data);
}

/**
 * Validar atualização de perfil
 */
export function validateProfileUpdate(data: unknown): ValidationResult {
  return validateData(profileUpdateSchema, data);
}

/**
 * Validar criação de turma
 */
export function validateTurma(data: unknown): ValidationResult {
  return validateData(turmaSchema, data);
}

/**
 * Validar nota
 */
export function validateNota(data: unknown): ValidationResult {
  return validateData(notaSchema, data);
}
