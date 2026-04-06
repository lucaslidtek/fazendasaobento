# 003 — Exibir Valor Total Consolidado da Atividade

**Módulo:** Atividades de Campo
**Regras:** RN-065, RN-063
**Prioridade:** 🔴 Alta
**Depende de:** 001-atividades-valor-insumos

---

## Descrição

Exibir o **valor total** de cada atividade como somatório dos valores de todos os insumos utilizados. Este valor é a base para o cálculo de custo/ha (issue 002) e para o relatório de custo da safra (issue 004).

O valor total deve ser:
- Exibido na **listagem** (tabela e cards) como coluna/métrica principal em destaque
- Exibido no **formulário** como rodapé da seção de insumos
- Formatado como moeda brasileira (R$)

---

## Cenários

- **Happy path:** 3 insumos com valores → soma exibida como "Valor Total: R$ 4.500,00"
- **Edge case:** Nenhum insumo → "R$ 0,00"
- **Edge case:** Insumo sem preço → excluído do total, com indicador visual de "preço pendente"

---

## Checklist

- [ ] Calcular somatório de `products[].unitPrice * products[].quantity` no form
- [ ] Exibir rodapé na seção de insumos com total formatado
- [ ] Adicionar coluna "Valor Total" na tabela desktop
- [ ] Destacar valor total nos cards mobile
- [ ] Formatar com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
