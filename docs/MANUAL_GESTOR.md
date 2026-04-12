# 🛡️ Manual do Gestor do Sistema — SGE CSM

> **Público-alvo**: Proprietário (master_admin) e Administradores (admin).  
> Este manual cobre operações de infraestrutura, segurança e configuração que **não devem ser acessadas por usuários comuns**.

---

## 1. Hierarquia de Perfis de Acesso

| Perfil | Nível | O que pode fazer |
|---|---|---|
| `master_admin` | 🔴 Máximo | Tudo + Configurações da Instituição (nome, logo, CNPJ) |
| `admin` | 🟠 Alto | Gestão de usuários, secretaria, turmas, financeiro |
| `secretaria` | 🟡 Médio | Cadastros, matrículas, documentos (sem financeiro) |
| `financeiro` | 🔵 Médio | Cobranças, acordos, termos (sem pedagógico) |
| `professor` | 🟢 Limitado | Notas, faltas, aulas das suas turmas |
| `aluno` | ⚪ Básico | Consulta de notas, documentos e dados pessoais |

> **Regra de Ouro**: Um perfil inferior NUNCA pode alterar dados de um perfil superior.  
> Ex: Secretaria não reseta senha de Admin. Admin não acessa Configurações.

---

## 2. Configurações da Instituição (Somente master_admin)

**Acesso**: Menu lateral → ⚙️ Configurações

Esta tela controla os dados que aparecem em **todos os PDFs** gerados pelo sistema (boletins, declarações, termos de acordo).

### Campos disponíveis:
- **Nome Oficial** — nome da escola nos documentos
- **CNPJ** — aparece no cabeçalho dos PDFs
- **E-mail e Telefone** — contato oficial
- **Endereço completo** — CEP, rua, número, bairro, cidade, UF
- **Cor Primária** — cor do cabeçalho dos documentos PDF
- **Logo** — aparece no topo dos documentos

### Especificações da Logo:
| Propriedade | Valor |
|---|---|
| Formato ideal | PNG com fundo transparente |
| Dimensões | 400 × 200px (proporção 2:1) |
| Tamanho máximo | 500KB |
| Outros aceitos | JPG, SVG, WebP |

> ⚠️ **ATENÇÃO**: Alterações na identidade institucional afetam imediatamente todos os documentos gerados. Só altere com autorização expressa da direção.

---

## 3. Gestão de Senhas

### Política vigente:
- Mínimo **8 caracteres**
- Deve conter **letras e números**
- Exemplo de senha válida: `csm_1983#`

### Reset de senha (Admin):
1. Acesse **Usuários do Sistema**
2. Clique em **🔄 Resetar Senha** ao lado do nome
3. A senha é alterada para `csm1983#`
4. No próximo login, o usuário será **obrigado** a criar uma nova senha pessoal

### Restrições de segurança:
- ❌ Secretaria **não pode** resetar senha de Admin ou master_admin
- ❌ A nova senha **não pode** ser igual à senha padrão `csm1983#`
- ✅ Qualquer usuário pode alterar sua própria senha em **Meus Dados → Segurança**

---

## 4. Cadastro de Usuários

**Acesso**: Menu lateral → Painel Secretaria → Cadastrar Alunos / Professores

### Fluxo de criação:
1. Preencher nome completo, CPF e e-mail
2. Definir a senha inicial (seguindo a política de 8+ caracteres)
3. O sistema cria o usuário no Supabase Auth + tabela `perfis`
4. Se a Edge Function falhar, o sistema usa o **fallback administrativo** (supabaseAdmin)

### Perfis criados automaticamente:
- Cadastrar Aluno → perfil `aluno`
- Cadastrar Professor → perfil `professor`
- Para criar `secretaria`, `financeiro` ou `admin` → alterar diretamente no banco (Supabase Table Editor)

---

## 5. Módulo Financeiro

**Acesso**: Menu lateral → 💰 Financeiro (Admin e Financeiro)

### Funcionalidades:
- **Lançar Débito**: Inserir mensalidades e cobranças com valor e vencimento
- **Ficha Financeira**: Visualizar pendências por aluno com checkboxes
- **Calculadora de Acordo**: Selecionar parcelas, aplicar desconto e ver valor final
- **Gerar Recibo/Termo**: Botão 📄 gera PDF oficial com a negociação

### Cálculos automáticos:
- Multa: 2% sobre valor original
- Juros de mora: 1% ao mês
- Descontos: digitados manualmente no campo "Desconto"

---

## 6. Backups e Manutenção

### Dados no Supabase:
- O Supabase faz backups automáticos diários (plano Pro)
- No plano gratuito, recomenda-se exportar dados regularmente via SQL Editor

### Variáveis de Ambiente (`.env`):
Nunca compartilhe ou publique os seguintes valores:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_SERVICE_ROLE_KEY`

### Atualizações:
Após modificações no código, execute:
```bash
git add .
git commit -m "descrição da mudança"
git push
```
O GitHub Actions executará o deploy automaticamente.

---

## 7. Contatos Técnicos

| Item | Informação |
|---|---|
| Repositório | `github.com/afsjr/secretaria_escola_csm` |
| Deploy | GitHub Pages → `afsjr.github.io/secretaria_escola_csm` |
| Banco de Dados | Supabase (PostgreSQL) |
| Documentação técnica | `ROADMAP_TECNICO.md` e `CSM_STANDARD_SKILL.md` |

---
*Manual do Gestor — SGE CSM v2.0 — Atualizado em 12/04/2026*
