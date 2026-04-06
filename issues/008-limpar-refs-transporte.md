# 008 — Limpar Referências ao Módulo Transporte

**Módulo:** Global
**Prioridade:** 🟡 Média
**Depende de:** 006

---

## Descrição

Após remover a aba de transporte no detalhe da máquina, limpar todas as referências restantes ao módulo `/transporte` que ficaram espalhadas:

1. `AppLayout.tsx` — mapeamento de título `"/transporte": "Transporte"`
2. `MachineDetailSheet.tsx` — componente inteiro é **código morto** (nunca importado)
3. `dashboard.tsx` — `DEMO_TRANSPORTS` importado no Dashboard (avaliar se remove ou mantém)

---

## Checklist

- [ ] Remover `"/transporte": "Transporte"` do mapa de títulos em `AppLayout.tsx`
- [ ] Deletar `MachineDetailSheet.tsx` (código morto, nunca importado)
- [ ] Avaliar e limpar `DEMO_TRANSPORTS` do `dashboard.tsx` se não for usado na UI
