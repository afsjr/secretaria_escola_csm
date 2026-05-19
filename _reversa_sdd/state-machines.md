# Máquinas de Estado — secretary_escola_csm

> Gerado pelo Detective em 2026-05-19

---

## Entidade: Matrícula (status_aluno)

```mermaid
stateDiagram-v2
  [*] --> ativo: MatricularAluno
  ativo --> trancado: AtualizarStatus(status='trancado')
  ativo --> evadido: AtualizarStatus(status='evadido')
  ativo --> concluido: AtualizarStatus(status='concluido')
  trancado --> ativo: AtualizarStatus(status='ativo')
  trancado --> evadido: AtualizarStatus(status='evadido')
  evadido --> [*]
  concluido --> [*]
  trancado --> [*]
```

**Valores:** `ativo`, `trancado`, `evadido`, `concluido`

---

## Entidade: Turma (status_ingresso)

```mermaid
stateDiagram-v2
  [*] --> aberta: createTurma
  aberta --> fechada: AtualizarStatus(status_ingresso='fechada')
  fechada --> aberta: AtualizarStatus(status_ingresso='aberta')
```

**Valores:** `aberta`, `fechada`

---

## Entidade: Solicitação (status)

```mermaid
stateDiagram-v2
  [*] --> pendente: createRequest
  pendente --> concluido: updateStatus(status='concluido')
  concluido --> [*]
```

**Valores:** `pendente`, `concluido`

---

## Entidade: Pagamento (status)

```mermaid
stateDiagram-v2
  [*] --> pendente: createPagamento
  pendente --> pago: Registro de pagamento
  pendente --> atrasado: Após vencimento
  atrasado --> acordo: CriarAcordo
  acordo --> pago: Quitação
  atrasado --> pago: Pagamento manual
  pago --> [*]
```

**Valores:** `pendente`, `pago`, `atrasado`, `acordo`

---

## Entidade: Acordo (status)

```mermaid
stateDiagram-v2
  [*] --> ativo: criarAcordo
  ativo --> quitado: Todas parcelas pagas
  ativo --> ativo: Pagamento parcial
```

**Valores:** `ativo`, `quitado`

---

## Fluxo de Session (Timeout)

```mermaid
stateDiagram-v2
  [*] --> authenticated: Login
  authenticated --> authenticated: Interação (reseta timer)
  authenticated --> expired: 30min sem interação
  expired --> unauthenticated: Logout automático
  unauthenticated --> [*]
```

**Timeout:** 30 minutos (`SESSION_TIMEOUT_MS`)

---

## Fluxo: Reset de Senha

```mermaid
stateDiagram-v2
  [*] --> recovery_request: resetPassword(email)
  recovery_request --> waiting: Envio de email
  waiting --> recovery_flow: Usuário clica link
  recovery_flow --> password_changed: updatePassword(newPassword)
  password_changed --> [*]
```

**Redirect:** `#/reset-password` com token na URL