# Onboarding: Teste e Validação da Ata de Resultados Finais (PDF)

> Identificador: `008-ata-resultados-finais`
> Data: `2026-09-07`

Este guia fornece o passo a passo para um testador ou desenvolvedor validar manualmente a funcionalidade.

## Pré-requisitos
1. Usuário com perfil `secretaria`, `coordenacao`, `admin` ou `master_admin`.
2. Uma turma de curso técnico já com catálogo de `disciplinas_base` (matriz) preenchido.
3. Alunos com matrículas nas situações `ativo`, `evadido` e `trancado` (ao menos uma de cada).
4. Boletins lançados: pelo menos um aluno aprovado em todos os componentes, um reprovado em algum componente e um com `status='pendente'`.

---

## Passo 1: Acesso à emissão
1. Efetue login com perfil `secretaria`.
2. Navegue até **Gestão de Turmas** (`#/dashboard/secretaria/gestao-turmas`).
3. Selecione uma turma e abra a aba **Alunos**.
4. **Verificação:** O botão **"Emitir Ata de Resultados Finais"** aparece no topo da aba para os perfis `secretaria|coordenacao|admin|master_admin` e **não aparece** para `professor`/`aluno`.

---

## Passo 2: Emissão com dados completos
1. Clique em **"Emitir Ata de Resultados Finais"**.
2. Infome (opcional) o campo "Polo/Local" quando disponível.
3. **Resultado esperado:**
   - O arquivo `ata_resultados_{turma}_{ano}.pdf` é baixado localmente.
   - A página é **A4 paisagem** com cabeçalho institucional (logo `_renderLogo`, nome, CNPJ, endereço e título "ATA DE RESULTADOS FINAIS").
   - A tabela lista os **componentes da matriz** do curso da turma (ordem por módulo), com as colunas **T/P**, **E/S**, **% FREQ** e **SITUAÇÃO**.
   - Um aluno com matrícula não-ativa (`evadido`/`trancado`) tem a **coluna "E/S" preenchida com "—"** e situação final refletindo `status_aluno`.
   - A coluna "SITUAÇÃO" de cada componente mostra apenas `Aprovado`, `Reprovado` ou `Cursando`.
   - A linha consolidada do aluno exibe a situação final e o percentual de frequência geral.

---

## Passo 3: Quebra de página
1. Emita a Ata de uma turma com matriz grande (ex.: ~20+ componentes) e/ou muitos alunos.
2. **Verificação:** O cabeçalho da tabela é **repetido na segunda página** e o rodapé exibe **numeração de página** (`Página X de Y`).
3. O logo/cabeçalho institucional permanece íntegro (proporcional) em todas as páginas.

---

## Passo 4: Rodapé oficial e legenda
1. Abra o PDF gerado.
2. **Verificação:** O rodapé contém local/data, linha de assinatura e a legenda com o significado da coluna E/S (AP/REP) e da frequência derivada.

---

## Passo 5: Turma sem dados (falha amigável)
1. Selecione uma turma sem boletins lançados e tente emitir.
2. **Resultado esperado:** **Nenhum PDF é gerado**; uma mensagem de erro amigável orienta a conclusão dos lançamentos da turma.

---

## Passo 6: Regressão dos PDFs existentes
1. Emita um **Boletim** e uma **Declaração** para um aluno.
2. **Verificação:** Os documentos gerados continuam idênticos ao comportamento anterior (cabeçalho proporcional intacto, sem exceções de renderização).

---

## Passo 7: Não gravação no banco
1. Antes da emissão, anote o `status_aluno` e o `boletim.status` de um aluno.
2. Emita a Ata.
3. **Verificação:** Nenhuma linha em `matriculas`, `boletim` ou qualquer outra tabela foi alterada (log de auditoria ou `SELECT` de comparação).