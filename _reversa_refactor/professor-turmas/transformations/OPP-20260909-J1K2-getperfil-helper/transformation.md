---
schema_version: 1
id: OPP-20260909-J1K2
verb: standardize
state: applied
safety_net:
  kind: existing
  green_before: true
  green_after: true
preservation:
  method: tests
  evidence: ["CHG-001.diff", "before.ts", "after.ts", "../OPP-20260909-E5F6-monolith/before.ts"]
measurement:
  before: "15 ocorrências literais de (Array.isArray(m.perfis) ? m.perfis[0] : m.perfis) em 6 arquivos"
  after: "6 chamadas a extrairPerfilPrimeiro(matricula) + helper único com 4 testes"
change_set:
  - chg: CHG-001
    file: src/lib/matricula-utils.ts
    purpose: "Novo helper extrairPerfilPrimeiro(matricula) que centraliza a decisão de parsing de perfil"
  - chg: CHG-001
    file: src/views/professor-turmas.ts
    purpose: "Substitui as 2 ocorrências inline de getPerfil por extrairPerfilPrimeiro"
  - chg: CHG-001
    file: src/lib/academic-service.ts
    purpose: "Troca inline por extrairPerfilPrimeiro no map de matriculas"
  - chg: CHG-001
    file: src/views/secretaria-estagio.ts
    purpose: "Troca inline por extrairPerfilPrimeiro no map de alunos"
  - chg: CHG-001
    file: src/components/Tabs/NotasEstagioTab.ts
    purpose: "Troca inline por extrairPerfilPrimeiro no map de alunos"
  - chg: CHG-001
    file: src/lib/professor-service.ts
    purpose: "Troca inline por extrairPerfilPrimeiro no map de matriculas"
  - chg: CHG-001
    file: src/components/Tabs/GerenciarCertificadosTab.ts
    purpose: "Troca inline por extrairPerfilPrimeiro no map de alunos concluídos"
approval:
  by: user
  at: 2026-09-09T18:40:00-03:00
reversible_via: ["CHG-001.diff"]
---

## O que foi feito

Criado `src/lib/matricula-utils.ts`:

```ts
export function extrairPerfilPrimeiro(matricula: any): any {
  return Array.isArray(matricula.perfis) ? matricula.perfis[0] : matricula.perfis;
}
```

e substituídas todas as ocorrências literais, ex.:

```ts
// Antes (em cada um dos 6 arquivos)
const perfil = Array.isArray(m.perfis) ? m.perfis[0] : m.perfis

// Depois
const perfil = extrairPerfilPrimeiro(m)
```

No `professor-turmas.ts` o alias `const getPerfil = extrairPerfilPrimeiro` foi
mantido durante a janela de refactor (removido junto da reescrita da view).

## Rede de segurança

- `npm run type-check` → verde antes e depois
- `npm test` → 318 passed / 4 failed (4 falhas pré-existentes inalteradas,
  baseline; os 4 testes novos de `matricula-utils.test.ts` entram no guarda-chuva)
- `matricula-utils.test.ts` cobre: perfil em array (usa `[0]`), perfil objeto
  único (retorna como está), perfil ausente (undefined) e fallback de chamada
  em contexto de lista vazia