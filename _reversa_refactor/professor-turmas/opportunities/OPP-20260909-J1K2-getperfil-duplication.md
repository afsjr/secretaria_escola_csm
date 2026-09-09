---
schema_version: 1
id: OPP-20260909-J1K2
display_number: 6
context: professor-turmas
verb: standardize
title: getPerfil duplicado em linha em 6 arquivos (15 ocorrências)
target:
  files: ["src/views/professor-turmas.ts", "src/lib/academic-service.ts", "src/views/secretaria-estagio.ts", "src/components/Tabs/NotasEstagioTab.ts", "src/lib/professor-service.ts", "src/components/Tabs/GerenciarCertificadosTab.ts"]
  symbol: "getPerfil = (m) => Array.isArray(m.perfis) ? m.perfis[0] : m.perfis"
smell: A extração de perfil a partir de matrícula (Array.isArray(m.perfis) ? m.perfis[0] : m.perfis) é repetida literalmente em 2 lugares no professor-turmas.ts e em mais 5 arquivos. Convenção inline inconsistente, risco de divergência futura.
roi:
  confidence: green
  impact: 15 pontos de duplicação espalhados por 6 arquivos; unificar centraliza a decisão de parsing de perfil
  cost: low
  est_return: Um helper único com testes; futuras mudanças no formato de perfis tocam um só lugar
state: proposed
traceability:
  soul: ["auth: controle de acesso"]
  specs: ["professor/requirements.md"]
---

## Observado

```ts
const getPerfil = (m: any) => Array.isArray(m.perfis) ? m.perfis[0] : m.perfis
```

Aparece:
- `src/views/professor-turmas.ts` — linhas 537 e 721 (2x)
- `src/lib/academic-service.ts` — linha 371
- `src/views/secretaria-estagio.ts` — linha 202
- `src/components/Tabs/NotasEstagioTab.ts` — linha 207
- `src/lib/professor-service.ts` — linha 96
- `src/components/Tabs/GerenciarCertificadosTab.ts` — linha 86

Total: 15 ocorrências literais.

## Transformação proposta

Criar `extrairPerfilPrimeiro(matricula)` em um módulo de utilitários (ex. `src/lib/matricula-utils.ts` ou dentro de `grades-utils.ts`/`security.ts`) e substituir as ocorrências. Cada arquivo vira uma chamada única, com teste unitário para o caso array e caso objeto único.

## Risco

Baixo — transformação mecânica (mesma expressão → chamada de função). Sujeita ao gate de aprovação por ser multi-arquivo.