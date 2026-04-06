# 004 — Relatório: Custo da Safra por Área

**Módulo:** Relatórios
**Regras:** RN-106, RN-107, RN-108, RN-103, RN-104
**Prioridade:** 🟡 Média
**Depende de:** 001, 002, 003 (valores nas atividades)

---

## Descrição

Criar um relatório consolidado que mostra **quanto custou a safra por área/talhão**, discriminando cada atividade realizada e seus custos.

Conforme o áudio do Júnior: _"...na hora que a gente finalizar ali e ver o relatório pra ver o que custou tudo a safra por área, aí a gente vai ter tudo descrito certinho."_

### Dados do Relatório

Para cada talhão na safra selecionada:
- Lista de **todas as atividades** com: tipo, data, produtos usados, valor total, custo/ha
- **Subtotal por tipo** de atividade (total gasto com Plantio, com Pulverização, etc.)
- **Custo total** do talhão na safra
- **Custo total/ha** do talhão na safra

### Visão Consolidada (Safra inteira)
- Somatório de todos os talhões
- Custo médio por hectare da safra
- Comparativo entre talhões (qual foi mais caro)

### Temporalidade
- A safra padrão vai de **outubro a maio** (RN-108), mas os filtros de safra já controlam isso via filtro global.

---

## Cenários

- **Happy path:** Safra 2025/2026, 5 talhões, ~15 atividades → relatório completo
- **Edge case:** Talhão sem atividades → exibir "Nenhuma atividade registrada"
- **Edge case:** Atividade sem valores → exibir mas sem somar no custo

---

## Checklist

- [ ] Criar página/aba de relatório de custo da safra
- [ ] Agrupar atividades por talhão
- [ ] Calcular subtotais por tipo de atividade
- [ ] Calcular custo total e custo/ha por talhão
- [ ] Exibir visão consolidada da safra
- [ ] Permitir exportação (PDF/CSV)
