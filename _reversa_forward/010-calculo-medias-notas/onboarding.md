# Onboarding: Cálculo de Médias com Notas Variáveis

> Identificador: `010-calculo-medias-notas`
> Data: `2026-09-10`

## Pré-requisitos

- Projeto instalado e rodando (`npm install && npm run dev`)
- Acesso ao Supabase com dados de teste (aluno, turma, disciplina, professor)

## Passo a passo para testar

### 1. Verificar cenário com 3 notas (regressão)

1. Acesse o painel do professor → Turmas → selecione uma disciplina
2. Lance notas para um aluno: n1=8, n2=7, n3=9
3. Clique em "Salvar Notas"
4. **Esperado:** Média parcial = 8.0 (comportamento preservado)

### 2. Verificar cenário com 1 nota

1. Em outra disciplina (ou mesmo aluno, zerando n2 e n3)
2. Lance apenas n1=8, deixe n2=0 e n3=0
3. Clique em "Salvar Notas"
4. **Esperado:** Média parcial = 8.0 (antes seria 2.67)

### 3. Verificar cenário com 2 notas

1. Lance n1=8, n2=7, n3=0
2. **Esperado:** Média parcial = 7.5

### 4. Verificar alerta visual

1. Acesse tela de notas de uma disciplina onde nenhum aluno tem notas
2. **Esperado:** Alerta visual "Nenhuma avaliação registrada" exibido
3. Lanche pelo menos 1 nota → alerta desaparece

### 5. Verificar boletim do aluno

1. Acesse como aluno → "Minhas Notas"
2. **Esperado:** Média reflete apenas as notas lançadas (não mais dividido por 3 fixo)

### 6. Verificar PDF (ata de resultados)

1. Gere PDF de ata de resultados para turma com disciplinas de 1 e 3 notas
2. **Esperado:** Médias no PDF batem com as do boletim

## Comandos de teste

```bash
npm run test          # Todos os testes
npm run test -- --grep "calcularMediaParcial"  # Testes específicos
```
