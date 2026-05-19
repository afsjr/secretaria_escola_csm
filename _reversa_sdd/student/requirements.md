# Dados do Aluno (Student Details)

> Módulo de dados completos do aluno

## Visão Geral
Gerencia dados estendidos do aluno: endereço, responsáveis, observações e dados completos para visão 360°.

## Responsabilidades
- CRUD de endereço do aluno
- CRUD de responsáveis
- CRUD de observações
- Consulta de dados completos do aluno
- Verificação de menor de idade

## Regras de Negócio
- Endereço com upsert (cria ou atualiza) 🟢
- Responsáveis ordenados por principal 🟢
- Observações incluem dados do criador 🟢
- Verificação de menor via RPC (recomendado: endpoint server-side com validação de data_nascimento) 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Buscar endereço | Must | Endereço do usuário |
| RF-02 | Salvar endereço | Must | Upsert de endereço |
| RF-03 | Deletar endereço | Must | Remove endereço |
| RF-04 | Listar responsáveis | Must | Responsáveis do aluno |
| RF-05 | Adicionar responsável | Must | Responsável criado |
| RF-06 | Atualizar responsável | Must | Dados atualizados |
| RF-07 | Deletar responsável | Must | Responsável removido |
| RF-08 | Listar observações | Must | Observações com dados do criador |
| RF-09 | Adicionar observação | Must | Observação criada |
| RF-10 | Atualizar observação | Must | Texto/categoria atualizados |
| RF-11 | Deletar observação | Must | Observação removida |
| RF-12 | Consultar dados completos | Must | Perfil + endereço + responsáveis + obs + matrícula |
| RF-13 | Atualizar dados pessoais | Must | Update com versionamento |
| RF-14 | Verificar menor de idade | Could | RPC retorna boolean |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/lib/student-details-service.ts` | `getEndereco`, `saveEndereco`, `deleteEndereco` | 🟢 |
| `src/lib/student-details-service.ts` | `getResponsaveis`, `addResponsavel`, `updateResponsavel`, `deleteResponsavel` | 🟢 |
| `src/lib/student-details-service.ts` | `getObservacoes`, `addObservacao`, `updateObservacao`, `deleteObservacao` | 🟢 |
| `src/lib/student-details-service.ts` | `getAlunoCompleto` | 🟢 |
| `src/lib/student-details-service.ts` | `updateDadosPessoais`, `isMenorDeIdade` | 🟡 |