# 006 — Remover Aba "Transporte" do Detalhe da Máquina

**Módulo:** Máquinas
**Prioridade:** 🔴 Alta
**Depende de:** Nenhuma

---

## Descrição

O módulo de transporte foi absorvido pelo módulo de Colheita. A aba "Transporte" no detalhe da máquina (`maquina-detalhes.tsx`) mostra dados que agora não fazem sentido isolados. Deve ser removida, junto com:

- O `TabsTrigger` de "Transporte"
- O `TabsContent` de "transports" inteiro
- A referência a `DEMO_TRANSPORTS` nos cálculos e imports
- O KPI card "Transporte" (totalTons) na grid de indicadores operacionais
- O redirect `/transporte` no `getRevenueRedirect()`

---

## Checklist

- [ ] Remover `TabsTrigger value="transports"` da tab list
- [ ] Remover `TabsContent value="transports"` inteiro
- [ ] Remover `DEMO_TRANSPORTS` do import e dos cálculos de stats
- [ ] Remover KPI "Transporte" (totalTons) da grid
- [ ] Alterar redirect `/transporte` para `/colheita` no `getRevenueRedirect()`
- [ ] Remover import do icon `Truck` se não for mais usado
