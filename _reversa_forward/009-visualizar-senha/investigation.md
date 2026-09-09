# Investigation: Visualizar Senha Digitada

> Identificador: `009-visualizar-senha`
> Data: `2026-09-09`

## Padrão de Input com Ícone (legado)

O projeto já usa o padrão `.input-icon-wrapper` em `src/styles/main.css:2077-2108`:

```
.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon-wrapper .input-icon-left {
  position: absolute; left: 1rem; pointer-events: none;
}
.input-icon-wrapper .input {
  padding-left: 2.75rem;
}
```

O login (`src/views/login.ts:87-100`) é o único campo que usa esse wrapper. Os demais campos de senha são inputs soltos dentro de `.form-group`.

## Ícones disponíveis

- `eye` já existe em `src/lib/icons.ts:26` — paths SVG para ícone de olho aberto
- `eyeOff` **não existe** — precisa ser adicionado ao `icons.ts`
- Padrão: `const P = { ... }` com paths SVG, exportado via `ICONS[key] = svg(path)`

## Alternativa: toggle via属性 `type`

Mudar `input.type` entre `"password"` e `"text"` é suportado em todos os browsers modernos (Chrome, Firefox, Safari, Edge). Em IE11, `type` é readonly após o DOM estar pronto — mas IE11 não é target deste projeto (Vite + modern JS).

**Referência:** MDN — `HTMLInputElement.type` é setável em browsers modernos.

## Alternativa: `::part()` Shadow DOM

Descartada — o projeto não usa Shadow DOM (SPA vanilla TS com DOM direto).

## Alternativa: biblioteca externa (ex.: password-toggle-web-component)

Descartada —引入 dependência para algo que são ~30 linhas de código utilitário. O projeto já tem padrão de manipulação direta de DOM.

## Impacto no autocompletar

Mudar `type` de `"password"` para `"text"` e volta não afeta `autocomplete` — o browser continua armazenando/retomando o valor normalmente. O atributo `autocomplete="current-password"` / `new-password` permanece inalterado no markup.
