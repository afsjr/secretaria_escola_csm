# Tipos de Curso — Requisitos

> Feature: Diferenciação entre cursos técnicos (com notas) e cursos de formação (com conceito)
> Versão: 1.0

## 1. Visão Geral

**Problema:** O sistema atual trata todos os cursos da mesma forma, sem diferenciação entre cursos técnicos (que exigem notas numéricas) e cursos de formação (que usam conceitos ou aproveitamento).

**Solução:** Adicionar campo de tipo de curso e adaptar a avaliação conforme o tipo.

**Escopo:** Módulos Course e Academic

---

## 2. Requisitos Funcionais

### 2.1. Definição de Tipo de Curso

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|------------|-------------------|
| RF-01 | Campo tipo_curso na criação de curso | Must | opções: 'tecnico' ou 'formacao' |
| RF-02 | Listar cursos filtrando por tipo | Must | GET /cursos?tipo=tecnico |
| RF-03 | Editar tipo de curso | Must | Apenas se não houver turmas ativas |
| RF-04 | Exibir tipo na listagem de cursos | Must | Coluna "Tipo" com badge |

### 2.2. Avaliação por Tipo de Curso

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|------------|-------------------|
| RF-05 | Notas numéricas 0-10 para cursos técnicos | Must | Validação: 0 <= nota <= 10 |
| RF-06 | Conceitos (A/B/C) para cursos de formação | Must | Opções: A (Excelente), B (Bom), C (Regular) |
| RF-07 | Converter conceito para nota (média) | Should | A=10, B=7.5, C=5 |
| RF-08 | Exibir tipo de avaliação no bulletin | Must | "Notas" ou "Conceitos" conforme tipo |
| RF-09 | Boletim com conceitos para formação | Must | Exibir A/B/C ao invés de números |

### 2.3. Regras de Negócio

| Regra | Descrição | Confiança |
|-------|-----------|-----------|
| RN-01 | Cursos técnicos exigem média >= 7.0 para aprovação | 🟢 |
| RN-02 | Cursos de formação exigem presença >= 75% + conceito B ou A | 🟢 |
| RN-03 | Não é possível mudar tipo de curso com turmas ativas | 🟢 |
| RN-04 | Histórico do aluno deve preservar o tipo de avaliação da época | 🟢 |

---

## 3. Requisitos Não Funcionais

| Requisito | Descrição | Critério |
|-----------|-----------|----------|
| RNF-01 | Compatibilidade | Manter backwards com cursos existentes (default: tecnico) |
| RNF-02 | Migracão |Scripts para migrar cursos existentes para novo campo |

---

## 4. Critérios de Aceite

```gherkin
Dado admin criando curso técnico
Quando Define tipo = "tecnico"
Então Курс salvo com tipo_curso = "tecnico"

Dado professor lanclando nota para curso técnico
Quando Nota = 8.5
Então Nota aceita (0-10 válido)

Dado professor lanclando conceito para curso de formação
Quando Conceito = "A"
Then Conceito aceito (A/B/C válido)

Dado tentativa de mudar tipo de curso com turmas ativas
Quando Update tipo_curso
Then Retorna erro "Não é possível mudar tipo com turmas ativas"
```

---

## 5. Interfaces Afetadas

| Interface | Alteração |
|-----------|-----------|
| Course/Service | Novo campo tipo_curso no create/update |
| Course/View | Dropdown tipo na tela de curso |
| Academic/Service | Lógica condicional para notas vs conceitos |
| Academic/View | Boletim com formato sesuai tipo |

---

## 6. Rastreabilidade

| Origem | Artefato |
|--------|----------|
| Curso atual | `_reversa_sdd/course/requirements.md` |
| Notas atual | `_reversa_sdd/academic/requirements.md` |

---

## 7. Pendências

Nenhuma — escopo definido com base nas specs existentes.