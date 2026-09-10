// OPP-20260909-J1K2 — Depois
// Helper único em src/lib/matricula-utils.ts:

export function extrairPerfilPrimeiro(matricula: any): any {
  return Array.isArray(matricula.perfis) ? matricula.perfis[0] : matricula.perfis;
}

// Uso em cada um dos 6 arquivos (exemplos):
// src/lib/academic-service.ts:
const perfil = extrairPerfilPrimeiro(m);
// src/views/secretaria-estagio.ts / src/components/Tabs/NotasEstagioTab.ts:
const perfil = extrairPerfilPrimeiro(m)
// src/lib/professor-service.ts:
const perfilData = extrairPerfilPrimeiro(m) as any
// src/components/Tabs/GerenciarCertificadosTab.ts:
const p = extrairPerfilPrimeiro(m)
// src/views/professor-turmas.ts (durante a janela de migração):
const getPerfil = extrairPerfilPrimeiro

// Testes em src/lib/matricula-utils.test.ts (4 casos).