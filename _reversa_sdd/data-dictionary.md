# Dicionário de Dados — secretary_escola_csm

> Gerado pelo Archaeologist em 2026-05-19

---

## Entidades do Domínio

### UserProfile (perfis)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único do usuário (FK auth.users) |
| email | text | sim | Email do usuário |
| nome_completo | text | sim | Nome completo |
| perfil | text | sim | Role: admin, master_admin, secretaria, coordenacao, professor, aluno |
| cpf | text | não | CPF do usuário |
| telefone | text | não | Telefone de contato |
| data_nascimento | date | não | Data de nascimento |
| genero | text | não | Gênero |
| estado_civil | text | não | Estado civil |
| rg | text | não | RG |
| orgao_expedidor | text | não | Órgão expedidor RG |
| whatsapp | text | não | Número WhatsApp |
| bloqueio_financeiro | boolean | não | Bloqueio por inadimplência |
| created_at | timestamp | sim | Data de criação |
| updated_at | timestamp | não | Data de atualização |

---

### Endereço (perfis_enderecos)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único |
| user_id | uuid | sim | FK para perfis.id |
| cep | text | não | CEP |
| logradouro | text | não | Endereço |
| numero | text | não | Número |
| complemento | text | não | Complemento |
| bairro | text | não | Bairro |
| cidade | text | não | Cidade |
| uf | text | não | Estado (UF) |
| created_at | timestamp | sim | Data de criação |

---

### Curso

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único |
| nome | text | sim | Nome do curso |
| descricao | text | não | Descrição |
| ativo | boolean | sim | Status ativo/inativo |
| created_at | timestamp | sim | Data de criação |

---

### Turma

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único |
| nome | text | sim | Nome da turma (ex: "2024-A") |
| periodo | text | sim | Período (matutino, vespertino, noturno) |
| status_ingresso | text | não | Status de ingresso (aberta, fechada) |
| curso_id | uuid | não | FK para cursos.id |
| created_at | timestamp | sim | Data de criação |

---

### Matrícula (matriculas)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único |
| aluno_id | uuid | sim | FK para perfis.id |
| turma_id | uuid | sim | FK para turmas.id |
| status_aluno | text | sim | Status: ativo, trancado, evadido, concluido |
| created_at | timestamp | sim | Data de criação |

---

### Disciplina Base (disciplinas_base)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único |
| nome | text | sim | Nome da disciplina |
| modulo | text | não | Módulo/Año |
| curso_id | uuid | não | FK para cursos.id |
| carga_horaria | integer | não | Carga horária (default 40) |
| created_at | timestamp | sim | Data de criação |

---

### Oferta (turma_disciplinas)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único |
| turma_id | uuid | sim | FK para turmas.id |
| disciplina_base_id | uuid | sim | FK para disciplinas_base.id |
| professor_id | uuid | não | FK para perfis.id |
| created_at | timestamp | sim | Data de criação |

---

### Boletim (boletim)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único |
| aluno_id | uuid | sim | FK para perfis.id |
| disciplina_base_id | uuid | não | FK para disciplinas_base.id (novo campo) |
| disciplina | text | não | Nome da disciplina (legado) |
| n1 | numeric | não | Nota 1 |
| n2 | numeric | não | Nota 2 |
| n3 | numeric | não | Nota 3 |
| rec | numeric | não | Nota de recuperação |
| nota_estagio | numeric | não | Nota de estágio |
| faltas | integer | não | Total de faltas |
| versao | integer | não | Versão para controle de concorrência |
| created_at | timestamp | sim | Data de criação |

---

### Aula (aulas)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único |
| turma_disciplina_id | uuid | sim | FK para turma_disciplinas.id |
| professor_id | uuid | não | FK para perfis.id |
| data | date | sim | Data da aula |
| conteudo | text | sim | Conteúdo registrado |
| created_at | timestamp | sim | Data de criação |

---

### Responsável (responsaveis)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único |
| aluno_id | uuid | sim | FK para perfis.id |
| nome | text | sim | Nome do responsável |
| cpf | text | não | CPF |
| telefone | text | não | Telefone |
| email | text | não | Email |
| parentesco | text | não | Parentesco |
| financeiro | boolean | não | Responsável financeiro |
| principal | boolean | não | Principal |
| created_at | timestamp | sim | Data de criação |

---

### Observação (observacoes_aluno)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único |
| aluno_id | uuid | sim | FK para perfis.id |
| texto | text | sim | Texto da observação |
| categoria | text | não | Categoria (geral, comportamento, acadêmico) |
| criado_por | uuid | não | FK para perfis.id |
| criado_em | timestamp | sim | Data de criação |

---

### Solicitação (solicitacoes)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único |
| user_id | uuid | sim | FK para perfis.id |
| tipo | text | sim | Tipo de documento |
| status | text | sim | Status: pendente, concluido |
| criado_em | timestamp | sim | Data de criação |

---

### Pagamento (pagamentos)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único |
| aluno_id | uuid | sim | FK para perfis.id |
| descricao | text | não | Descrição |
| valor_original | numeric | sim | Valor original |
| valor_pago | numeric | não | Valor pago |
| data_vencimento | date | sim | Data de vencimento |
| status | text | sim | Status: pendente, pago, atrasado, acordo |
| created_at | timestamp | sim | Data de criação |

---

### Acordo (financeiro_acordos)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único |
| aluno_id | uuid | sim | FK para perfis.id |
| total_debito | numeric | sim | Total do débito |
| total_com_desconto | numeric | sim | Total com desconto |
| numero_parcelas | integer | sim | Número de parcelas |
| valor_parcela | numeric | sim | Valor de cada parcela |
| status | text | sim | Status: ativo, quitado |
| created_at | timestamp | sim | Data de criação |

---

### Log de Auditoria (audit_log)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|------------|
| id | uuid | sim | ID único |
| usuario_id | uuid | sim | FK para perfis.id |
| usuario_nome | text | sim | Nome do usuário no momento |
| usuario_perfil | text | sim | Perfil do usuário no momento |
| acao | text | sim | Ação realizada |
| tabela_afetada | text | não | Tabela afetada |
| registro_id | uuid | não | ID do registro afetado |
| descricao | text | não | Descrição textual |
| dados_antigos | jsonb | não | Dados anteriores |
| dados_novos | jsonb | não | Dados novos |
| user_agent | text | não | User agent do browser |
| created_at | timestamp | sim | Data/hora |

---

## Constantes e Enums

### Perfis (UserRole)

```typescript
type UserRole = 'admin' | 'master_admin' | 'secretaria' | 'coordenacao' | 'financeiro' | 'professor' | 'aluno'
```

### Status Aluno

```typescript
const STATUS_ALUNO_OPCOES = ['ativo', 'trancado', 'evadido', 'concluido']
```

### Gênero

```typescript
const GENERO_OPCOES = ['masculino', 'feminino', 'outro', 'prefiro_nao_informar']
```

### Estado Civil

```typescript
const ESTADO_CIVIL_OPCOES = ['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel']
```

---

## Relacionamentos

```
perfis (1) ──────< perfis_enderecos
perfis (1) ──────< responsaveis
perfis (1) ──────< observacoes_aluno
perfis (1) ──────< matriculas
perfis (1) ──────< pagamentos
perfis (1) ──────< solicitacoes
perfis (1) ──────< boletim
perfis (1) ──────< aulas

cursos (1) ──────< turmas
cursos (1) ──────< disciplinas_base

turmas (1) ──────< matriculas
turmas (1) ──────< turma_disciplinas

turma_disciplinas (1) ──────< aulas

disciplinas_base (1) ──────< turma_disciplinas
disciplinas_base (1) ──────< boleto
```

---

## Observações

1. **Campo versao em boletim**: Usado para controle de concorrência (optimistic locking)
2. **Campo disciplina_base_id**: Adicionado recentemente, transição do campo texto "disciplina"
3. **RLS (Row Level Security)**: Aplicado em todas as tabelas para controle de acesso por perfil
4. **Audit Log**: Tabela com dados_antigos/dados_novos em JSONB para rastreabilidade completa