# Requirements: Logo da Instituição nos Documentos PDF e na Barra Lateral de Navegação

> Identificador: `007-logo-instituicao-docs-nav`
> Data: `2026-09-07`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Esta feature adiciona o logotipo institucional (`public/logo.png`) em dois pontos-chave do sistema: (1) no cabeçalho de todos os documentos PDF gerados (Boletim, Declaração, Declaração de Vínculo, Histórico, Termo de Acordo, Diário de Classe) e (2) na barra lateral superior esquerda do painel de navegação do dashboard. Atualmente, os PDFs usam apenas texto no cabeçalho (sem logo) e a sidebar exibe um ícone SVG genérico em vez do logotipo real da instituição.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#módulos-principais` | Documents module gera PDFs via jsPDF (`pdf-service.ts`, `certificate-service.ts`) | 🟢 |
| `_reversa_sdd/inventory.md#estrutura-de-pastas` | `src/lib/pdf-service.ts` e `src/lib/instituicao-service.ts` são os serviços responsáveis pela geração de cabeçalhos | 🟢 |
| `_reversa_sdd/architecture.md#camadas` | Views (`src/views/*.ts`) renderizam a UI, incluindo o dashboard com sidebar | 🟢 |
| `src/views/dashboard.ts:101-108` | Sidebar atual usa SVG genérico + texto "Secretaria CSM" | 🟢 |
| `src/lib/pdf-service.ts:86-129` | `_renderHeader()` já suporta renderização de logo via `inst.logo_url` (data URL) | 🟢 |
| `src/lib/instituicao-service.ts:161-193` | `getPDFHeader()` converte URLs HTTP para base64 mas não tem fallback para `/logo.png` | 🟢 |
| `src/views/login.ts:19,49` | Login já usa `<img src="/logo.png">` como referência de implementação | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| **Secretaria / Admin** | Gerar documentos PDF com identidade visual institucional | Ao gerar um Boletim ou Declaração, o PDF exibe a logo da instituição no cabeçalho, profissionalizando o documento. |
| **Qualquer usuário logado** | Visualizar o logotipo da instituição na navegação | Ao acessar o dashboard, o usuário vê a logo real da instituição no topo da barra lateral, reforçando a identidade visual. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01 (Fallback de Logo nos PDFs):** Quando a instituição não possui `logo_url` cadastrada no banco de dados, o sistema deve usar `/logo.png` (arquivo estático no diretório `public/`) como fallback, convertendo-o para base64 data URL para uso pelo jsPDF. 🟢
   - Tipo: nova
   - Justificativa: Garante que todo PDF terá logo mesmo sem configuração manual via Configurações.

2. **RN-02 (Logo na Sidebar):** A barra lateral de navegação do dashboard deve exibir o logotipo institucional (`/logo.png`) no topo, substituindo o ícone SVG genérico atual. 🟢
   - Tipo: alterada
   - Origem no legado: `src/views/dashboard.ts:101-108`

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Adicionar logo ao cabeçalho de todos os PDFs | Must | Todos os 6 tipos de PDF (Boletim, Declaração, Declaração de Vínculo, Histórico, Termo de Acordo, Diário de Classe) exibem a logo `public/logo.png` no cabeçalho quando não há logo cadastrada no banco. | 🟢 |
| RF-02 | Implementar fallback para logo estática | Must | `getPDFHeader()` retorna `logo_url` como data URL de `/logo.png` quando `inst.logo_url` é null ou vazio. | 🟢 |
| RF-03 | Exibir logo na sidebar do dashboard | Must | A sidebar exibe a imagem `public/logo.png` com dimensões apropriadas (ex.: 32x32 ou 40x40px) no topo, ao lado do texto "Secretaria CSM". | 🟢 |
| RF-04 | Manter fallback para SVG quando logo falhar | Should | Se a imagem `/logo.png` não carregar (404 ou erro de rede), o sistema exibe o ícone SVG genérico atual como fallback. | 🟡 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | A conversão de `/logo.png` para base64 não deve causar atraso perceptível na geração de PDF | O arquivo `logo.png` tem 613KB; a conversão é feita uma vez por sessão (cache em `_cachedHeader`) | 🟢 |
| Usabilidade | A sidebar deve permanecer responsiva e legível com a adição da logo | Dimensões da logo devem respeitar o layout existente da sidebar (largura ~240px, colapsável) | 🟢 |
| Compatibilidade | O fallback SVG deve funcionar em todos os navegadores suportados | SVG já é suportado universalmente | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: PDF gerado com logo da instituição (sem logo cadastrada no banco)
  Dado que a instituição não possui logo_url cadastrada no banco de dados
  Quando o usuário gera qualquer tipo de documento PDF (Boletim, Declaração, etc.)
  Então o PDF exibe a imagem logo.png no cabeçalho, ao lado do nome da instituição
  E o texto do cabeçalho (nome, CNPJ, endereço, telefone) é deslocado para a direita da logo

Cenário: PDF gerado com logo cadastrada no banco
  Dado que a instituição possui logo_url com uma URL válida no banco de dados
  Quando o usuário gera qualquer tipo de documento PDF
  Então o PDF exibe a logo cadastrada (convertida para base64) no cabeçalho

Cenário: Sidebar do dashboard com logo
  Dado que o usuário está autenticado e no dashboard
  Quando a barra lateral é renderizada
  Então a sidebar exibe a imagem logo.png no topo ao lado do texto "Secretaria CSM"
  E o ícone SVG genérico anterior não é mais exibido

Cenário: Fallback quando logo não carrega
  Dado que o arquivo logo.png não está disponível (erro 404)
  Quando a sidebar é renderizada
  Então o ícone SVG genérico é exibido como fallback
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Requisito principal da feature — identidade visual nos documentos |
| RF-02 | Must | Garante que a feature funcione sem configuração manual |
| RF-03 | Must | Complementa a identidade visual na interface do sistema |
| RF-04 | Should | UX defensiva — evita quebra visual se o arquivo não estiver disponível |
| RNF de desempenho | Should | Cache existente mitiga impacto; não é bloqueante |
| RNF de usabilidade | Should | Manter responsividade é importante mas não bloqueante |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

> Nenhuma lacuna ou `[DÚVIDA]` pendente.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-07 | Versão inicial gerada por `/reversa-requirements` | reversa |
