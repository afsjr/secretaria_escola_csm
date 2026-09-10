export function extrairPerfilPrimeiro(matricula: any): any {
  return Array.isArray(matricula.perfis) ? matricula.perfis[0] : matricula.perfis;
}