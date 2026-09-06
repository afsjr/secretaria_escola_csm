# Regression Watch: Aluno — Minhas Notas

> Identificador: `005-aluno-notas`
> Data: `2026-05-23`

## Watch items

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-----------------------------|---------------------|-------------------|
| W001 | `src/types/domain.ts:123` (interface Boletim) | Interface `Boletim` deve manter campos `disciplina_base_id`, `nota_estagio`, `status`, `versao` como opcionais | presença | Campo removido ou tornado obrigatório |
| W002 | `src/views/dashboard.ts` (rota aluno/notas) | Rota `/aluno/notas` deve existir com guard `_isAluno` | presença | Rota removida ou guard removido |
| W003 | `src/views/dashboard.ts` (sidebar) | Sidebar deve conter link "Minhas Notas" visível apenas para perfil `aluno` | presença | Link removido ou condicional removido |

## Histórico de re-extrações

### Re-extração 2026-09-06 15:28

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | Interface `Boletim` preservada em `src/types/domain.ts` e documentada no `data-dictionary.md` |
| W002 | 🟢 verde | Rota `#/dashboard/aluno/notas` com guard `_isAluno` preservada no `dashboard.ts` |
| W003 | 🟢 verde | Link "Minhas Notas" preservado no sidebar condicionado a `_isAluno` |

## Arquivadas

Nenhum item arquivado.

## Observações

Nenhuma.
