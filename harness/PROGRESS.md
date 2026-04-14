# PROGRESS.md
> Memória persistente entre sessões. Atualizado ao final de cada tarefa ou sprint.
> **Se você é um agente iniciando uma sessão, leia este arquivo inteiro antes de qualquer ação.**

---

## Estado Atual do Projeto

**Última atualização:** 14/04/2026
**Sprint ativo:** Todos concluídos (S-01 → S-10) ✅
**Status geral:** ✅ Protótipo completo | Próximo: ML-01 (Banco de dados real)

---

## Resumo para Nova Sessão

```
O projeto é um ERP agrícola em Vite + React + TypeScript (Fazenda São Bento). 
O front-end está 100% completo como protótipo visual com dados mock.
Todas as 37 user stories + 3 bugs da spec da reunião foram implementados e auditados.

Módulos implementados (visual + integrações):
- Dashboard, Colheita (com transporte integrado + aba Silos), Máquinas, Caminhões, 
  Culturas, Abastecimento, Estoque de Insumos, Talhões, Safras, Usuários,
  Financeiro (centralizado com contas bancárias + NF), Atividades de Campo, 
  Relatórios (produtividade + rentabilidade + custos com Recharts).

Integrações automatizadas:
- Financeiro → Estoque (compra dá entrada)
- Venda → Silo (baixa automática)
- Abastecimento → Estoque (saída automática)
- Atividade → Estoque (baixa de insumos)
- Financeiro ↔ Máquinas (propagação bidirecional)
- Filtro global de safra em todos os 8+ módulos

O que NÃO existe ainda (próximas milestones):
- Banco de dados real (tudo é demo-data / estado local)
- Módulo de Locações (precisa de reunião específica)
- Upload real de NF (campo existe, upload visual placeholder)

Para iniciar: npm install && npm run dev
```

---

## Sprints

### Sprint S-01: Bug Fixes + Caminhão Dropdown — ✅ Concluído
**Planejado em:** 14/04/2026
**Concluído em:** 14/04/2026
**Tarefas:**
- [x] T-01: Fix filtro de cultura "Milho" na colheita — ✅ case-insensitive comparison
- [x] T-02: Fix botão "Novo Lançamento" no financeiro — ✅ controlled Dialog onOpenChange fix
- [x] T-03: Fix design da lista de insumos nas atividades — ✅ grid layout, inline delete button
- [x] T-04: Campo "Caminhão" como dropdown no formulário de colheita — ✅ Select + DEMO_TRUCKS

**Sensores:**
- [x] `npx tsc --noEmit` — passa (exit code 0)
- [x] `npm run build` — passa (exit code 0, built in 23.81s)

---

### Sprint S-02: Cadastro de Silos + Dropdown Destino — ✅ Concluído
**Planejado em:** 14/04/2026
**Concluído em:** 14/04/2026
**Tarefas:**
- [x] Interface `Silo` (name, location, capacityTons, status) + `DEMO_SILOS` com 4 silos
- [x] Campo "Destino / Silo" convertido de Input para Select com silos cadastrados
- [x] Dados demo compatíveis (strings mantidas: "Silo Principal", "Silo Norte", "Silo Sul", "Cooperativa")

**Sensores:**
- [x] `npm run build` — passa (exit code 0, built in 5.14s)

### Sprint S-03: Visão de Silos (Aba em Colheita) — ✅ Concluído
**Planejado em:** 14/04/2026
**Concluído em:** 14/04/2026
**Tarefas:**
- [x] Tabs "Colheitas" / "Silos" (padrão idêntico ao Financeiro)
- [x] Computação de estoque por silo/cultura a partir dos registros de colheita
- [x] Tabela desktop com: nome, localização, culturas (badges), sacas, peso, entradas, barra de capacidade
- [x] Cards mobile com: ícone Warehouse, breakdown de culturas, barra de capacidade
- [x] Título atualizado para "Colheita & Armazenagem"

**Design patterns seguidos:**
- TabsList `bg-muted/50 rounded-xl h-11` (= Financeiro)
- Table `bg-card rounded-2xl border` / `TableHeader bg-muted/40` (= Estoque)
- Card `rounded-2xl border` mobile (= Colheita cards)
- Badge culture colors via `getBadgeStyle()` (= Colheita table)
- Capacity bar: primary/warning/destructive thresholds (50%/80%)

**Sensores:**
- [x] `npm run build` — passa (exit code 0, built in 5.28s)

### Sprint S-04: Integração Financeiro → Estoque — ✅ Concluído
**Planejado em:** 14/04/2026
**Concluído em:** 14/04/2026
**Tarefas:**
- [x] Badge "Estoque ↑" nos lançamentos financeiros (Insumos/Combustível pagos) — desktop + mobile
- [x] US-15 já resolvido no S-01 (BUG-02)
- [x] Detalhes do estoque já detecta origem (Financeiro/Campo/Manual) via badges

**Sensores:**
- [x] `npm run build` — passa (exit code 0, built in 5.37s)

### Sprint S-05: Integração Venda → Silo — ✅ Concluído
**Planejado em:** 14/04/2026
**Concluído em:** 14/04/2026
**Tarefas:**
- [x] Campo `siloName` no schema do financeiro
- [x] Dropdown "Origem do Grão (Silo)" condicional: aparece só quando tipo=receita + categoria=Vendas
- [x] Badge "Silo ↓ [nome]" nos lançamentos de venda com silo (desktop + mobile)
- [x] Import DEMO_SILOS no financeiro

**Sensores:**
- [x] `npm run build` — passa (exit code 0, built in 6.20s)

### Sprint S-06: Integração Abastecimento → Estoque — ✅ Concluído
**Planejado em:** 14/04/2026
**Concluído em:** 14/04/2026
**Tarefas:**
- [x] Badge "Estoque ↓" nos registros de abastecimento (tabela desktop) com ícone Package
- [x] US-12 já implementado: fuelBalance desconta abastecimentos automaticamente
- [x] US-13 já implementado: Estoque mostra Produto, Categoria, Saldo Atual
- [x] US-14 já implementado: Clicar no produto navega para detalhes com movimentações

**Sensores:**
- [x] `npm run build` — passa (exit code 0, built in 5.75s)

### Sprint S-07: Integração Atividade → Estoque — ✅ Concluído
**Planejado em:** 14/04/2026
**Concluído em:** 14/04/2026
**Tarefas:**
- [x] US-20: Form com data, tipo, talhão, área, máquina, operador + lista de insumos (já existia)
- [x] US-21: Cálculo automático subtotal + custo/ha em tempo real (já existia)
- [x] US-22: Baixa de estoque automática ao registrar atividade (já existia)
- [x] US-23: Filtro por safra global (já existia)
- [x] US-35: Tipo "Outro" como expansibilidade (já existia)
- [x] US-36: Stats cards no topo (Total, Área, Custo) filtrados por safra (já existia)
- [x] Badge "Estoque ↓" nas atividades com insumos (desktop table + mobile cards)

**Sensores:**
- [x] `npm run build` — passa (exit code 0, built in 6.25s)

### Sprint S-08: Financeiro ↔ Máquinas — ✅ Concluído
**Planejado em:** 14/04/2026
**Concluído em:** 14/04/2026
**Tarefas:**
- [x] US-10: Ficha da máquina conectada ao financeiro (já puxa `DEMO_FINANCIAL_RECORDS` por `machineId`)
- [x] US-34: Abas Dashboard + Colheita + Abastecimento + Lucros/Receitas + Manutenção (já existiam)
- [x] US-17: Saldo bancário calculado automaticamente (receitas +, despesas -, filtro status="pago")
- [x] US-18: Campo "Nº Nota Fiscal" adicionado ao formulário financeiro

**Sensores:**
- [x] `npm run build` — passa (exit code 0, built in 5.64s)

### Sprint S-09: Filtro Global Aprimorado — ✅ Concluído
**Planejado em:** 14/04/2026
**Concluído em:** 14/04/2026
**Tarefas:**
- [x] US-28: Filtro global de safra filtra TODOS os módulos (Dashboard, Colheita, Atividades, Financeiro, Relatórios, Abastecimento, Talhões, Estoque)
- [x] US-29: Trocar safra "zera" tudo — `selectedSafraId` é usado como filtro reativo em todos os `useMemo`
- [x] Sidebar: Dropdown global de safra + talhão com cascata (talhões filtrados pela safra selecionada)

**Sensores:**
- [x] Auditoria de código — todos os 8 módulos principais usam `selectedSafraId` no filtro

### Sprint S-10: Relatórios Enriquecidos — ✅ Concluído
**Planejado em:** 14/04/2026
**Concluído em:** 14/04/2026
**Tarefas:**
- [x] US-24: Aba "Monitor de Produtividade" — BarChart (produtividade/talhão) + AreaChart (volume histórico) + 3 KPI cards
- [x] US-25: Aba "Análise Financeira" — 4 KPIs (Receita, Custos Diretos, Indiretos, Margem) + BarChart fluxo mensal + Donut composição
- [x] US-26: Aba "Custos Realizados" — Donut por categoria + Tabela Top 5 maiores gastos
- [x] US-27: Estrutura de abas expansível para enriquecimento iterativo
- [x] US-37: Visual premium: Recharts interativos, cards com gradient, tabela estilizada

**Sensores:**
- [x] Auditoria de código — 3 abas completas com gráficos interativos e filtro safra

---

## Pendências Identificadas

> Coisas identificadas durante a reunião e análise que estão FORA do sprint atual.

- [ ] 14/04/2026 — Módulo de Locações mencionado pelo cliente ("de locações vai ser a mesma coisa") — não detalhado, precisa de outra reunião
- [ ] 14/04/2026 — Relatórios precisam ser enriquecidos "parecido com os da EGRO" — depende de dados reais
- [ ] 14/04/2026 — Cliente quer testar o protótipo e enviar feedback via grupo — aguardar retorno
- [ ] 14/04/2026 — Próxima etapa após aprovação visual: incluir banco de dados real

---

## Bloqueios

> Situações onde o agente travou e precisou parar.

- Nenhum bloqueio registrado.

---

## Log de Sessões

| Data | Agente | O que foi feito | Commit |
|------|--------|-----------------|--------|
| 14/04/2026 | Planejamento | Criação do harness completo (SPEC, CONTRACTS, ARCHITECTURE, PROGRESS) a partir do transcript da reunião | — |
| 14/04/2026 | Implementador | Sprint S-01: Fix filtro Milho, fix botão Novo Lançamento, fix design insumos, caminhão dropdown | — |
| 14/04/2026 | Implementador | Sprint S-02: Interface Silo + DEMO_SILOS + campo destino como dropdown | — |
| 14/04/2026 | Implementador | Sprint S-03: Aba Silos em Colheita (Tabs, stock computation, table+cards) | — |
| 14/04/2026 | Implementador | Sprint S-04: Badge "Estoque ↑" no financeiro, import Package icon | — |
| 14/04/2026 | Implementador | Sprint S-05: Campo silo no form de vendas, badge "Silo ↓" | — |
| 14/04/2026 | Implementador | Sprint S-06: Badge "Estoque ↓" no abastecimento, confirma US-12/13/14 | — |
| 14/04/2026 | Implementador | Sprint S-07: Badge "Estoque ↓" nas atividades, confirma US-20~23/35/36 | — |
| 14/04/2026 | Implementador | Sprint S-08: Campo NF no financeiro, confirma US-10/17/18/34 | — |
| 14/04/2026 | Auditor | Sprint S-09: Auditoria confirma safraId em 8 módulos, US-28/29 completos | — |
| 14/04/2026 | Auditor | Sprint S-10: Relatórios com 3 abas completas (Recharts), US-24~27/37 | — |
| 14/04/2026 | Auditor | Auditoria final: US-02 encontrada implementada (sem marca), US-30 confirmada, 37/37 US + 3/3 bugs ✅ | — |

---

## Variáveis de Ambiente Necessárias

- [ ] Nenhuma necessária (protótipo com dados mock)

---

## Como Rodar o Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Rodar
npm run dev

# 3. Acessar
# http://localhost:5173
# Login: clique direto, não precisa de credenciais (protótipo)
```
