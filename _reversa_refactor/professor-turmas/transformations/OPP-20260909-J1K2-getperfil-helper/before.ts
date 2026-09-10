// OPP-20260909-J1K2 — Antes (fragmentos representativos do padrão duplicado)
// O padrão literal abaixo aparecia 15 vezes em 6 arquivos.

src/views/professor-turmas.ts (~linhas 537 e 721):
```ts
const getPerfil = (m: any) => Array.isArray(m.perfis) ? m.perfis[0] : m.perfis
```

src/lib/academic-service.ts (~linha 371):
```ts
const perfil = Array.isArray(m.perfis) ? m.perfis[0] : m.perfis;
```

src/views/secretaria-estagio.ts (~linha 202), src/components/Tabs/NotasEstagioTab.ts (~linha 207):
```ts
const perfil = Array.isArray(m.perfis) ? m.perfis[0] : m.perfis
```

src/lib/professor-service.ts (~linha 96):
```ts
const perfilData = Array.isArray(m.perfis) ? m.perfis[0] : m.perfis as any
```

src/components/Tabs/GerenciarCertificadosTab.ts (~linha 86):
```ts
const p = Array.isArray(m.perfis) ? m.perfis[0] : m.perfis
```