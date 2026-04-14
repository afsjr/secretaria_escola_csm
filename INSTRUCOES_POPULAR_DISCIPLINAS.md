# 📋 Instruções para Popular Disciplinas no Supabase

## Problema Identificado

A disciplina **"Matemática Instrumental"** não estava cadastrada no **I Módulo** do curso Técnico em Enfermagem. Além disso, outras disciplinas também podem estar faltando no plano de curso.

## Solução

Foi criado o script SQL `popular_disciplinas_enfermagem.sql` que insere **todas as disciplinas** organizadas por módulo para o curso Técnico em Enfermagem.

## 📊 Disciplinas que serão inseridas

### I Módulo - Fundamentos Biológicos e Científicos (8 disciplinas)

1. ✅ Anatomia e Fisiologia Humana
2. ✅ Psicologia Aplicada
3. ✅ Nutrição e Dietética
4. ✅ Microbiologia e Parasitologia
5. ✅ Higiene e Profilaxia
6. ✅ Ética Profissional
7. ✅ Português Instrumental
8. ⭐ **Matemática Instrumental** ← **DISCIPLINA QUE FALTAVA**

### II Módulo - Princípios do Cuidar e Clínicas (5 disciplinas)

1. ✅ Introdução à Enfermagem
2. ✅ Enfermagem Cirúrgica
3. ✅ Enfermagem Médica
4. ✅ Noções de Farmacologia
5. ✅ Noções de Adm. em Unidade Hospitalar

### III Módulo - Urgências e Saúde Pública (4 disciplinas)

1. ✅ Enfermagem Materno Infantil
2. ✅ Enfermagem em Pronto Socorro
3. ✅ Enfermagem em Saúde Pública
4. ✅ Enfermagem Neuro Psiquiátrica

**Total: 17 disciplinas para o curso Técnico em Enfermagem**

---

## 🚀 Como Executar o Script no Supabase

### Passo 1: Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: `secretaria_escola_csm` (ou o nome do seu projeto)
3. No menu lateral, clique em **SQL Editor** (ícone de terminal)

### Passo 2: Executar o Script

1. Clique em **+ New query**
2. Copie o conteúdo do arquivo `popular_disciplinas_enfermagem.sql`
3. Cole no editor SQL do Supabase
4. Clique no botão **Run** (ou pressione `Ctrl+Enter` / `Cmd+Enter`)

### Passo 3: Verificar os Resultados

Após executar, você verá mensagens de sucesso no painel de output:

```
✅ DISCIPLINAS DO CURSO TÉCNICO EM ENFERMAGEM INSERIDAS COM SUCESSO!
📋 Resumo:
   I Módulo: 8 disciplinas (incluindo Matemática Instrumental)
   II Módulo: 5 disciplinas
   III Módulo: 4 disciplinas
```

### Passo 4: Verificar as Disciplinas Inseridas

Descomente (remova `/*` e `*/`) a seção **PASSO 6** no script e execute novamente para ver uma lista completa de todas as disciplinas inseridas:

```sql
SELECT 
  d.nome AS disciplina,
  d.modulo,
  c.nome AS curso,
  p.nome_completo AS professor
FROM disciplinas d
LEFT JOIN cursos c ON d.curso_id = c.id
LEFT JOIN perfis p ON d.professor_id = p.id
WHERE c.nome ILIKE '%Enfermagem%'
ORDER BY 
  CASE d.modulo
    WHEN 'I Módulo' THEN 1
    WHEN 'II Módulo' THEN 2
    WHEN 'III Módulo' THEN 3
    ELSE 4
  END,
  d.nome;
```

---

## 🔧 Como Vincular Professores às Disciplinas

Após inserir as disciplinas, você pode vincular professores através do painel:

1. Acesse o sistema e faça login como **admin** ou **secretaria**
2. Navegue para `#/dashboard/secretaria`
3. Na seção **"Professores Cadastrados"**, clique em **"Vincular Disciplinas"**
4. Selecione as disciplinas que o professor irá ministrar
5. Escolha a **Turma** associada (se aplicável)
6. Clique em **"Salvar Vinculação"**

---

## ⚙️ Estrutura da Tabela `disciplinas`

O script insere dados na tabela `disciplinas` com a seguinte estrutura:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único (gerado automaticamente) |
| `nome` | TEXT | Nome da disciplina |
| `modulo` | TEXT | Módulo ao qual pertence (I Módulo, II Módulo, III Módulo) |
| `curso_id` | UUID | FK para o curso (Técnico em Enfermagem) |
| `professor_id` | UUID | FK para o professor (NULL inicialmente) |
| `turma_id` | UUID | FK para a turma (NULL inicialmente) |
| `curso_id` | UUID | FK para o curso |

---

## 🔍 Verificar se o Curso Existe

Antes de executar o script, verifique se o curso **Técnico em Enfermagem** está cadastrado:

```sql
SELECT id, nome, ativo 
FROM cursos 
WHERE nome ILIKE '%Enfermagem%';
```

Se o curso **não existir**, cadastre-o primeiro:

```sql
INSERT INTO cursos (id, nome, descricao, ativo)
VALUES (
  gen_random_uuid(), 
  'Técnico em Enfermagem', 
  'Curso técnico profissionalizante na área de enfermagem com foco em cuidados clínicos, cirúrgicos e saúde pública.',
  true
);
```

---

## 📝 Notas Importantes

1. **Segurança**: O script usa `ON CONFLICT DO NOTHING` para evitar duplicatas se executado múltiplas vezes.

2. **IDs Automáticos**: Os UUIDs são gerados automaticamente com `gen_random_uuid()`, garantindo unicidade.

3. **Professor e Turma NULL**: As disciplinas são inseridas sem professor e turma vinculados inicialmente. Você pode fazer essas vinculações depois pelo painel ou manualmente.

4. **Carga Horária e Vivências**: A matriz curricular (`matriz.ts`) já possui as cargas horárias e descrições de vivências para todas as disciplinas. Elas serão exibidas automaticamente quando as disciplinas estiverem no banco.

5. **Idempotência**: O script é idempotente - pode ser executado múltiplas vezes sem causar duplicatas.

---

## 🐛 Solução de Problemas

### Erro: "Curso Técnico em Enfermagem não encontrado"

**Causa**: O curso não está cadastrado na tabela `cursos`.

**Solução**: Cadastre o curso conforme instruções acima.

### Disciplinas não aparecem na Matriz Curricular

**Causa**: O campo `modulo` pode estar com valor diferente de "I Módulo", "II Módulo", "III Módulo".

**Solução**: Verifique os valores:

```sql
SELECT DISTINCT modulo FROM disciplinas;
```

### Disciplinas aparecem sem professor

**Causa**: Normal - as disciplinas são inseridas sem vínculo inicial.

**Solução**: Use o painel Secretaria para vincular professores ou execute:

```sql
UPDATE disciplinas 
SET professor_id = 'UUID-DO-PROFESSOR'
WHERE nome = 'Nome da Disciplina';
```

---

## 📞 Suporte

Em caso de dúvidas ou problemas, consulte:
- Documentação do Supabase: https://supabase.com/docs
- Arquivo `DOCUMENTACAO_SISTEMA.md` no projeto

---

**Script criado em**: Abril 2026  
**Sistema**: SGE - Secretaria Colégio Santa Mônica  
**Versão**: 1.0
