# 002 — Calcular e Exibir Custo por Hectare na Atividade

**Módulo:** Atividades de Campo
**Regras:** RN-066
**Prioridade:** 🔴 Alta
**Depende de:** 001-atividades-valor-insumos

---

## Descrição

Após a issue 001 adicionar valores aos insumos, esta issue implementa o cálculo e exibição do **custo por hectare** de cada atividade.

**Fórmula:** `Custo/ha = Valor Total da Atividade ÷ Área Trabalhada (ha)`

O custo por hectare deve aparecer:
- No **card de resumo** da listagem (cards mobile e tabela desktop)
- No **detalhe/formulário** da atividade (como métrica derivada, não editável)
- Nos **cards de estatísticas** no topo da página (custo médio/ha, total acumulado)

---

## Cenários

- **Happy path:** Atividade com 3 insumos, área de 20ha → custo/ha calculado e exibido
- **Edge case:** Atividade sem insumos → custo/ha = R$ 0,00
- **Edge case:** Área = 0 → exibir "—" em vez de dividir por zero

---

## Checklist

- [ ] Calcular `totalValue` somando valor de todos os insumos
- [ ] Calcular `costPerHectare = totalValue / areaHectares`
- [ ] Exibir na tabela desktop como coluna "R$/ha"
- [ ] Exibir nos cards mobile como métrica secundária
- [ ] Atualizar cards de estatísticas com custo médio e total acumulado
