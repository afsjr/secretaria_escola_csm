# Convergência do debate — BUG-20260924-6LSJ

Modo: repair | N=3 | R=2 | participantes: locais (sem harness externo)

## Rodada 0
- agente-1: exibição-only, chave perfil+nome normalizado, CPF fora da fusão, badge "N contas", reset-all.
- agente-2: exibição-only, identidade em 3 camadas com CPF primário + ponte CPF-nulo; flag de conflito.
- agente-3: exibição-only, chave perfil+nome normalizado, selo `cpf_conflitante`, reset param no 1º erro.

Divergências centrais: papel do CPF na chave; comportamento do loop de reset; arquitetura do módulo.

## Rodada 1
- agente-1 e agente-3 rejeitam CPF como camada primária (equivale à chave por nome com mais código + risco da dedup 22/09).
- agente-2 MUDOU de opinião: abandona CPF primário; CPF vira divisor protetor + qualificador `possiveis-homonimos`/`cpf_conflitante`.
- Todos convergem: loop de reset CONTINUA agregando erros (não para no 1º), única parada prévia por privilégio de grupo.
- Incorporações cruzadas: e-mails visíveis no card, sort por nome do grupo, inventário vivo read-only, fallback email→id.

## Rodada 2 (convergência integral)
1. Módulo puro único: `src/lib/person-groups.ts` — `normalizarNomeIdentidade` + `agruparPorPessoa(profiles): PersonGroup[]`.
2. Chave: `perfil | nomeNormalizado` → fallback `perfil | email` → `id`; vazios nunca colapsam entre si.
3. `Total`/badges contam pessoas únicas (Σ grupos), não `profiles.length`.
4. CPF NUNCA funde grupos (Gessica×Iara permanecem 2 linhas); vira só o selo `cpfConflitante` quando o grupo tem 2+ CPFs não-nulos distintos.
5. Reset: `AdminService.resetUserPasswords(userIds, nome)` continua em erro agregando `{ resetados, erros }`, dedup de ids; só a classe de privilégio do grupo impede o botão.
6. Inventário vivo: parte da execução do bug, SOMENTE leitura, gravado em `evidence/inventario-vivo-YYYYMMDD.md` via `CpfService.listarInconsistenciasCPF` + SQL read-only com a mesma chave; reparo de dados fica fora.
7. Adendo de spec obrigatório (spec-gap).

## Métrica de saúde
- 10 chamadas executadas (3 x 3 rodadas + 1 juiz). Convergência real: solventes reduziram divergências de 3 eixos (rodada 0) para 0 (rodada 2), com 2 mudanças de opinião documentadas. Juiz roda agora.

Data: 2026-09-24