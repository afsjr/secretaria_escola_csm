# Protocolo de verificação do time Code Quality

Checklist compartilhado por todos os especialistas do time Refactor. Seguir antes de abrir gate, antes de aplicar e antes de declarar concluído.

## 1. Baseline

1. Rode `npm test` e `npm run type-check`. Guarde em `_reversa_refactor/<contexto>/baseline/before.txt`.
2. Classifique falhas: pré-existente, do alvo ou intermitente.
3. Prove pré-existente revertendo só o alvo:

```sh
git stash push -- <arquivos do alvo>
<mesma suíte>
git stash pop
```

4. Registre a prova no `transformation.md`. Nunca atribua falha antiga à mudança nova.

## 2. Rede de segurança

- Caracterização: fixa o comportamento atual e fica verde antes.
- Regressão: falha antes da correção e fica verde depois.
- Equivalência: tabela entrada para saída, com bordas: vazio, zero, nulo, limites 0 e 10, concorrência.
- Não use snapshot amplo para esconder mudança. Asserte o campo afetado.
- Em jsdom, monte `<table><tbody>` antes de inserir `<tr>`.

## 3. Gate e evidência

- `plan.html` antes de tocar código.
- `CHG-NNN.diff` mostrado e aprovado antes de aplicar.
- `safety-net/before.txt` e `safety-net/after.txt`.
- `before-after/measurement.md` ou `before-after/equivalence.md`.
- `transformation.md` com `approval`, `safety_net`, `measurement` e `reversible_via`.
- Estado da oportunidade e `generated/index.md` atualizados.

## 4. Definition of Done

- Testes do alvo verdes.
- `npm run type-check` verde.
- Caracterização verde antes e depois.
- Regressão do bug vermelha antes e verde depois.
- Nenhum arquivo fora do alvo alterado.
- Falhas pré-existentes documentadas.
- Registro e views atualizados.

## 5. Template de falha pré-existente

```text
Falha: <arquivo> > <teste>
Comando de baseline: <comando>
Alterações do alvo revertidas: git stash push -- <arquivos>
Resultado: <número> falhas antes e depois
Conclusão: pré-existente, fora do escopo da OPP
```
