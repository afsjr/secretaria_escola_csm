# Documents, Design Técnico

## Interface

| Símbolo | Assinatura | Retorno |
|---------|-----------|---------|
| `createRequest` | `(userId, type)` | `{ data, error }` |
| `getMyRequests` | `(userId)` | `{ data, error }` |
| `getAllOpenRequests` | `()` | `{ data, error }` |
| `updateStatus` | `(id, status)` | `{ data, error }` |

## Riscos e Lacunas
- 🟢 Módulo simples, sem lacunas significativas