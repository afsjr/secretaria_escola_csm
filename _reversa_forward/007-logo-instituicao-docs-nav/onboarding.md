# Onboarding: Logo da Instituição nos Documentos PDF e na Barra Lateral de Navegação

> Identificador: `007-logo-instituicao-docs-nav`
> Data: `2026-09-07`

Passo a passo para um humano validar a feature pela primeira vez, após as mudanças do `actions.md` estarem aplicadas.

## Pré-requisitos

- Ambiente com Supabase configurado (`npm run dev` levanta o Vite na porta padrão).
- `public/logo.png` presente (613KB).
- Usuário com perfil que acessa o dashboard e a aba Documentos (Admin/Secretaria/Coordenador).

## 1. Sidebar expandida (RF-03/RF-04)

1. Logar com um usuário válido.
2. No dashboard expandido, conferir no topo da barra lateral esquerda:
   - a imagem `logo.png` (44×44) ao lado do texto "Secretaria CSM";
   - clique no botão recolher (`#sidebar-toggle`) e confira que a sidebar fecha para ~64px.

## 2. Sidebar colapsada 32×32 (RF-05)

1. Com a sidebar colapsada, confirmar que a logo permanece visível em **32×32** no topo (versão menor, centralizada) e que o texto "Secretaria CSM" e o botão de recolher ficam ocultos.

## 3. Fallback de imagem (RF-04)

1. Renomear temporariamente `public/logo.png` para `public/logo.png.bak`.
2. Recarregar o dashboard: a imagem some e o SVG genérico de fallback aparece; o texto "Secretaria CSM" permanece.
3. Restaurar o nome do arquivo.

## 4. Logo nos PDFs — sem logo cadastrada (RF-01/RF-02)

1. Garantir que a instituição **não** tenha `logo_url` cadastrada (Configurações → se houver logo, clique em remover).
2. Ir em Documentos e gerar ao menos um de cada: Boletim, Declaração, Declaração de Vínculo, Histórico, Termo de Acordo, Diário de Classe.
3. No painel Secretaria, gerar a **Ata de Resultados Finais** de uma turma.
4. Abrir os PDFs gerados: todos devem exibir a logo `logo.png` no cabeçalho, à esquerda, com o texto institucional deslocado para a direita e o fundo na cor primária.

## 5. Falha de conversão da logo (RF-06)

1. Renomear `public/logo.png` (ou simular indisponibilidade) e gerar um PDF.
2. O PDF deve ser gerado normalmente, **sem logo** no cabeçalho e sem erro exibido.

## 6. Logo cadastrada no banco (cenário com configuração)

1. Em Configurações, fazer upload de uma logo.
2. Gerar um PDF: deve usar a logo cadastrada (maior prioridade que o fallback).

## Checklist de validação

- [ ] Sidebar expandida exibe logo + texto
- [ ] Sidebar colapsada exibe logo 32×32
- [ ] Fallback SVG funciona com arquivo ausente (texto preservado)
- [ ] Os 7 PDFs exibem a logo (fallback) no cabeçalho
- [ ] PDF segue sem logo se o fetch falhar (sem erro)
- [ ] Logo cadastrada no banco tem precedência sobre o fallback