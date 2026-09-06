# Investigação Técnica: Lançamento de Notas por Lote e Estágio

> Identificador: `006-lancamento-notas-estagio`
> Data: `2026-09-06`

## 1. Mapeamento de Código Existente

### Lançamento de Notas de Estágio (`src/lib/academic-service.ts`)
No estado atual do código legado:
- O método `upsertNotaEstagio(alunoId, disciplinaBaseId, nota)` já existe no `academic-service.ts`.
- O método salva a nota no campo `nota_estagio` da tabela `boletim`.
- **Lacuna identificada:** Não existe ainda o método `upsertNotaEstagioLote(payload: Array<{alunoId, disciplinaBaseId, nota}>)` para salvar múltiplos estagiários em uma única operação disparada pela Secretaria.

### Lançamento de Notas pelo Professor (`src/lib/professor-service.ts`)
- O professor possui acesso às funções `salvarNota` e `salvarNotasEmLote` para avaliações periódicas (`n1`, `n2`, `n3`, `rec`).
- A interface de lançamento do professor não deve renderizar o input de `nota_estagio`.

### Restrição por Bloqueio Financeiro (`src/lib/validation.ts` e RLS Supabase)
- A flag `bloqueio_financeiro` reside na tabela `perfis`.
- As políticas de RLS e funções de gravação de notas no `academic-service.ts` e `professor-service.ts` interagem com a tabela `boletim`.
- Foi verificado que nenhuma política RLS de `boletim` bloqueia gravação baseada em `bloqueio_financeiro` (o bloqueio é imposto somente na emissão de declarações/certificados em `documents-service.ts`).

### Feedback Visual da Secretaria (`src/components/Toast.ts` ou equivalente)
- A aplicação utiliza notificações do tipo Toast para sinalização de operações assíncronas.
- O salvamento em lote de estágio usará o componente de Toast flutuante configurado para mensagens de sucesso.

## 2. Alternativas Avaliadas

1. **Adicionar RPC Supabase para salvamento em lote:**
   - *Descartado:* A aplicação utiliza a abordagem de cliente JS Supabase com `Promise.all` em batch client-side, mantendo padronização com os demais métodos do sistema.

2. **Liberar edição de estágio na tela do Professor se ele for preceptor:**
   - *Descartado:* O requisito expressamente define que o preceptor envia as notas consolidadas e a Secretaria/Coordenação realiza o lançamento por lote.

## 3. Conclusão

A arquitetura atual suporta integralmente os deltas necessários com baixo risco de regressão. A criação de `upsertNotaEstagioLote` e da view da Secretaria para estágio resolve o requisito com total isolamento.
