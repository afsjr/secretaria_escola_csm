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

## CPF ***.***.***-**
# Contas deste grupo:
#   - <e-mail-mascarado>  -> PESSOA 1      (OUTRA pessoa; CPF correto ***.***.***-**)
#   - <e-mail-mascarado>           -> PESSOA 2   (matriculada)
#   - <e-mail-mascarado>        -> PESSOA 2   (sem matrícula; tem notas/frequência)
# Decisão: o CPF ***.***.***-** é da PESSOA 5 PESSOA 6; corrigir o CPF da PESSOA 6 Pereira e
# mesclar as duas contas da PESSOA 5 PESSOA 6, mantendo a matriculada.
# RESOLVIDO em 2026-09-22.
acao: nenhuma
manter: <e-mail-mascarado>
corrigir_cpf_email: 
corrigir_cpf_valor: 
observacao: RESOLVIDO - PESSOA 5 PESSOA 6 mantida (<e-mail-mascarado>); <e-mail-mascarado> desativada; PESSOA 6 Pereira corrigida para ***.***.***-**.

---

## CPF ***.***.***-**
# Contas deste grupo:
#   - <e-mail-mascarado>  -> PESSOA 3  (matriculada, 14 notas) — CPF ***.***.***-** é dela
#   - <e-mail-mascarado>    -> PESSOA 4         (sem matrícula) — CPF correto ***.***.***-**
# RESOLVIDO em 2026-09-22.
acao: nenhuma
manter: 
corrigir_cpf_email: 
corrigir_cpf_valor: 
observacao: RESOLVIDO - PESSOA 7 corrigida para ***.***.***-**; ***.***.***-** permanece com PESSOA 8 PESSOA 9.
