# Dados do Aluno (Student Details), Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `getEndereco` | `(userId)` | `DbResult<Endereco>` | Pode retornar null |
| `saveEndereco` | `(userId, Partial<Endereco>)` | `DbResult<Endereco>` | Upsert |
| `deleteEndereco` | `(userId)` | `DbResult<unknown>` | Remove |
| `getResponsaveis` | `(alunoId)` | `DbResult<Responsavel[]>` | Ordenado principal desc |
| `addResponsavel` | `(alunoId, Partial<Responsavel>)` | `DbResult<Responsavel>` | Cria |
| `updateResponsavel` | `(id, Partial<Responsavel>)` | `DbResult<Responsavel>` | Atualiza |
| `deleteResponsavel` | `(id)` | `DbResult<unknown>` | Remove |
| `getObservacoes` | `(alunoId)` | `DbResult<Observacao[]>` | Com criador |
| `addObservacao` | `(alunoId, texto, categoria)` | `DbResult<Observacao>` | Com session |
| `updateObservacao` | `(id, Partial<Observacao>)` | `DbResult<Observacao>` | Atualiza |
| `deleteObservacao` | `(id)` | `DbResult<unknown>` | Remove |
| `getAlunoCompleto` | `(alunoId)` | `{ data, error }` | Dados agregados |
| `updateDadosPessoais` | `(userId, Partial<UserProfile>, versao)` | `DbResult<UserProfile>` | Com locking |
| `isMenorDeIdade` | `(alunoId)` | `Promise<boolean | null>` | RPC |

## Fluxo Principal

### saveEndereco (Upsert)
1. getEndereco(userId) para verificar existência
2. Se existe → update
3. Se não → insert
4. Retorna dados

### getAlunoCompleto (Sequencial)
1. get perfil
2. get endereco
3. get responsaveis
4. get observacoes
5. get matricula (com nested turmas+cursos)
6. Agrega tudo e retorna

## Dependências
- `supabase` — cliente
- `ConcurrencyControl` — updateWithLock para dados pessoais

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Upsert de endereço | `student-details-service.ts:60-79` | 🟢 |
| RPC para menor de idade | `student-details-service.ts:229-234` | 🟡 |
| Sequential getAlunoCompleto | `student-details-service.ts:189-222` | 🟡 |

## Riscos e Lacunas

- 🟡 getAlunoCompleto não usa Promise.all (pode otimizar)
- 🟡 RPC `aluno_eh_menor` não verificada no schema