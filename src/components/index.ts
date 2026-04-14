/**
 * Componentes UI Reutilizáveis
 * 
 * Exporta todos os componentes disponíveis.
 */

export { createTabelaProfessores, bindTabelaProfessoresEventos } from './tabela-professores'
export type { TabelaProfessoresProps } from './tabela-professores'

export { createTabelaAlunos, bindTabelaAlunosEventos } from './tabela-alunos'
export type { TabelaAlunosProps } from './tabela-alunos'

export { createModal, openModal, closeModal, bindModalEventos, showConfirm } from './modal'
export type { ModalProps } from './modal'