# 007 — Popular Gráficos de Máquina com Dados Mock

**Módulo:** Máquinas
**Prioridade:** 🔴 Alta
**Depende de:** 006

---

## Descrição

Os gráficos "Volume de Colheita por Operação" e "Histórico de Consumo" na aba Dashboard do detalhe da máquina ficam vazios para a maioria das máquinas, pois `DEMO_HARVESTS` e `DEMO_FUELINGS` não têm registros variados o suficiente.

Garantir que pelo menos 4 máquinas tenham **dados suficientes** (3+ registros cada) nos mocks para popular os gráficos.

---

## Checklist

- [ ] Adicionar registros a `DEMO_HARVESTS` para máquinas 1, 2, 4 (pelo menos 3 registros cada)
- [ ] Verificar se `DEMO_FUELINGS` já cobre as máquinas com dados variados
- [ ] Testar no browser que os gráficos aparecem populados
