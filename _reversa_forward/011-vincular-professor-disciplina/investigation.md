# Investigation: Vincular e Desvincular Professores em Disciplinas de Turmas

> Identificador: `011-vincular-professor-disciplina`
> Data: `2026-09-11`

## 1. Pergunta de investigação

Como permitir vincular e desvincular professores em disciplinas de uma turma com o menor delta sobre o legado, preservando histórico acadêmico e reaproveitando as rotinas existentes?

## 2. Estado atual do legado

| Ponto | Evidência | Leitura |
|-------|-----------|---------|
| Tabela de vínculo | `_reversa_sdd/data-dictionary.md#Oferta (turma_disciplinas)` | `professor_id` é opcional, então aceita `null` |
| Criação de oferta | `src/lib/course-service.ts:206` `criarOfertaDisciplina` | Já valida duplicidade por (turma, disciplina) |
| Troca de professor | `src/lib/course-service.ts:233` `atribuirProfessorAEstrutura` | Só faz update de `professor_id` |
| Remoção de oferta | `src/lib/course-service.ts:253` `removerOfertaDisciplina` | Remove a oferta inteira — NÃO é o que queremos para desvincular |
| Fluxo atual de vínculo | `src/components/Tabs/GerenciarProfessoresTab.ts:277-313` | Modal centrado no professor; já cria ou atualiza oferta |
| Grade da turma | `src/views/gestao-turmas.ts:206-225` e `loadTurmaGrade` | Coluna "Professor" é somente leitura; orienta usar Gerenciar Professores |
| Lista de professores | `src/lib/professor-service.ts:252` `getProfessores` | Filtra `perfil = 'professor'` |
| Serviço de auditoria | `src/lib/audit-service.ts:71` `log` | Registra em `audit_log`, não bloqueia o fluxo |
| Permissão do view | `src/views/gestao-turmas.ts:21` `canManageTurmas` | secretaria, coordenação, admin, master_admin |

## 3. Alternativas avaliadas

### A. Estender `GerenciarProfessoresTab` (descartada)

Manter todo o controle no modal de professores e apenas adicionar o botão desvincular. Vantagem: menos arquivos. Desvantagem: fluxo centrado no professor, obriga caçar turma+disciplina; contraria a resposta do esclarecimento (controle na aba Grade).

### B. Colocar toda a lógica direto em `gestao-turmas.ts` (descartada)

Escrever queries inline no view. Vantagem: rápido. Desvantagem: repete a lógica já existente em `GerenciarProfessoresTab` e dificulta testes; espalha regra de domínio na camada de apresentação.

### C. Centralizar em `CourseService` e consumir na grade (escolhida)

Criar métodos de serviço que encapsulam criar/atualizar oferta, limpar vínculo e auditar. A grade apenas chama o serviço e reflete o resultado. Vantagem: testável, reutilizável por outros pontos, alinhado à arquitetura em camadas do legado (`_reversa_sdd/architecture.md#Camadas`).

## 4. Padrões aplicáveis

- **Service layer** já usada pelo projeto: views chamam `*Service`, que fala com o Supabase Client (`_reversa_sdd/architecture.md#Fluxo de Dados Típico`).
- **Auditoria complementar não bloqueante** (`AuditService.log` retorna sempre, mesmo em falha).
- **Feedback por toast** padronizado em `src/lib/toast.ts`.
- **Optimistic UI opcional:** recarregar apenas a tabela da grade após a operação, como já ocorre em `salvarDatas` no calendário.

## 5. Lacunas remanescentes

Nenhuma. As três dúvidas do `requirements.md` foram fechadas em `/reversa-clarify` (sessão 2026-09-11).
