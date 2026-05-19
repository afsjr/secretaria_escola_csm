# Audit, Design Técnico

## Interface do Serviço

| Símbolo | Assinatura | Retorno |
|---------|-----------|---------|
| `log` | `(params: LogParams)` | `{ error }` |
| `getLogs` | `(params: GetLogsParams)` | `{ data, error, count }` |
| `getUniqueActions` | `()` | `{ data: { acao, descricao }[], error }` |
| `getLogsByUser` | `(userId: string, limit?)` | `{ data, error }` |
| `getRecentLogs` | `(limit?)` | `{ data, error }` |
| `getCountsBySeverity` | `()` | `{ data: { alta, media, baixa }, error }` |
| `getHighSeverityLogs` | `()` | `{ data: logs[], error }` |

### Tipos

```typescript
interface LogParams {
  acao: string
  tabela_afetada?: string
  registro_id?: string
  descricao?: string
  dados_antigos?: Record<string, any> | null
  dados_novos?: Record<string, any> | null
}

interface GetLogsParams {
  limit?: number
  offset?: number
  acao?: string
  tabela_afetada?: string
  usuario_id?: string
  data_inicio?: string
  data_fim?: string
}
```

## Estrutura de Dados

### Tabela: audit_log
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| usuario_id | uuid | FK → auth.users.id |
| usuario_nome | text | Nome do usuário no momento |
| usuario_perfil | text | Perfil do usuário no momento |
| acao | text | Identificador da ação |
| tabela_afetada | text | Tabela impactada |
| registro_id | uuid | ID do registro afetado |
| descricao | text | Descrição textual |
| dados_antigos | jsonb | Estado anterior (opcional) |
| dados_novos | jsonb | Estado novo (opcional) |
| user_agent | text | User agent do navegador |
| created_at | timestamp | Data/hora do registro |

## Mapeamento de Severidade

| Ação | Severidade |
|------|-----------|
| reset_senha | alta |
| delete_usuario | alta |
| alterar_perfil_acesso | alta |
| lancar_nota | media |
| alterar_nota | media |
| delete_nota | media |
| criar_usuario | media |
| matricular_aluno | media |
| transferir_aluno | media |
| login_sucesso | baixa |
| solicitar_documento | baixa |
| atualizar_perfil | baixa |
| registrar_aula | baixa |

## Fluxos

### Fluxo 1: Registro de Ação Sensível
1. Ação dispara `AuditService.log(params)`
2. Busca usuário autenticado (supabase.auth.getUser())
3. Busca perfil do usuário (getUserProfile)
4. Coleta user agent
5. Insere registro em audit_log
6. Se falhar, loga no console mas NÃO propaga erro

### Fluxo 2: Visualização de Logs (Admin)
1. Carrega logs iniciais (limit=50)
2. Carrega contagem por severidade
3. Renderiza contadores: alta, média, baixa
4. Renderiza filtros: ação, severidade, busca
5. Ao filtrar: aplica filtros client-side nos dados carregados
6. Paginação via "Carregar Mais" se count > 50

### Fluxo 3: Wrapper withAudit
1. Função HOF que recebe (fn, {acao, tabela_afetada, descricao})
2. Executa fn(...args)
3. Se sucesso, registra log automático
4. Retorna resultado original

## Riscos e Lacunas

- 🟢 Módulo bem definido, sem lacunas significativas
- 🔴 Não há autenticação a nível de função getLogs (deve ser verificado no frontend)
- 🟡 Sem rotação de logs (tabela pode grow indefinidamente)