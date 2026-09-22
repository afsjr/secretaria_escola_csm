# Decisões de duplicidade — preencha e salve

Este é o arquivo que você ajusta para encerrar as inconsistências de CPF.
Depois de editar, rode:

```
node scripts/dedup-merge.mjs            # confere o plano (não altera nada)
node scripts/dedup-merge.mjs --apply    # aplica as decisões
```

Regras por grupo (linha `acao:`):

- `mesclar`       → mantém a conta indicada em `manter:` e desativa as demais,
                    movendo notas e frequência para a conta mantida.
- `corrigir_cpf`  → quando forem PESSOAS DIFERENTES com o mesmo CPF por erro:
                    informe `corrigir_cpf_email:` (conta com CPF errado) e
                    `corrigir_cpf_valor:` (CPF correto).
- `nenhuma`       → não faz nada neste grupo.

Não altere as linhas `## CPF ...` (são as chaves dos grupos).

---

## CPF 153.765.284-21
# Contas deste grupo:
#   - eduardaoliveira310707@gmail.com  -> EDUARDA DE OLIVEIRA PEREIRA      (OUTRA pessoa; CPF correto 148.045.104-51)
#   - mariaeduarda@gmail.com           -> MARIA EDUARDA OLIVEIRA PEDROZO   (matriculada)
#   - eduardaoliveira@gmail.com        -> MARIA EDUARDA OLIVEIRA PEDROZO   (sem matrícula; tem notas/frequência)
# Decisão: o CPF 153.765.284-21 é da MARIA EDUARDA; corrigir o CPF da Eduarda Pereira e
# mesclar as duas contas da Maria Eduarda, mantendo a matriculada.
# RESOLVIDO em 2026-09-22.
acao: nenhuma
manter: mariaeduarda@gmail.com
corrigir_cpf_email: 
corrigir_cpf_valor: 
observacao: RESOLVIDO - Maria Eduarda mantida (mariaeduarda@gmail.com); eduardaoliveira@gmail.com desativada; Eduarda Pereira corrigida para 148.045.104-51.

---

## CPF 108.908.174-05
# Contas deste grupo:
#   - gessicapaloma@gmail.com  -> Gessica Paloma Januario da Silva  (matriculada, 14 notas) — CPF 108.908.174-05 é dela
#   - iaramyllena@gmail.com    -> Iara Myllena de Melo Lima         (sem matrícula) — CPF correto 144.434.544-38
# RESOLVIDO em 2026-09-22.
acao: nenhuma
manter: 
corrigir_cpf_email: 
corrigir_cpf_valor: 
observacao: RESOLVIDO - Iara corrigida para 144.434.544-38; 108.908.174-05 permanece com Gessica Paloma.
