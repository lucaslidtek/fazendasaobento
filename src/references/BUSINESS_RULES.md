# Regras de Negócio — Fazenda São Bento

**Fonte:** Transcrição da reunião de alinhamento (Felipe, Júnior, Lucas)
**Última atualização:** 2026-04-06
**Status:** Validado contra o SPEC v1

> Este documento registra TODAS as decisões de negócio extraídas da reunião.
> Ele serve como fonte da verdade para implementação, manutenção e onboarding.

---

## 1. Filtros Globais

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-001 | O sistema possui dois filtros globais: **Safra** e **Talhão** | 0:30 |
| RN-002 | Ao selecionar uma safra, **todas as telas** devem refletir os dados daquela safra | 0:45 |
| RN-003 | Ao selecionar um talhão, os dados são filtrados para aquele talhão específico | 0:59 |
| RN-004 | Safrinha (ex: "Safrinha 2026") é uma safra separada, com seus próprios talhões e registros | 42:57 |

---

## 2. Colheita

### 2.1 Estrutura do Registro

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-010 | Cada registro de colheita = **uma viagem de caminhão** (não é "por dia" ou "por talhão total") | 5:39 |
| RN-011 | O **Peso Bruto** é o que se paga ao motorista/caminhoneiro | 7:50 |
| RN-012 | O **Peso Líquido** (após descontos de umidade e impureza) é o que interfere na produtividade real | 7:55 |
| RN-013 | **Produtividade** = Total de sacas ÷ Área (hectares). É uma métrica derivada, não digitada | 12:42 |
| RN-014 | Dados obrigatórios do registro: Data, Cultura, Talhão, Hectares, Peso Bruto, Peso Líquido, Umidade (%), Impureza (%), Sacas, Motorista, Caminhão (placa), Destino (Silo) | 9:30–10:39 |

### 2.2 Colunas e Filtros

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-015 | O campo "Operador" na colheita = **Motorista do caminhão**, não operador de máquina | 10:24–10:35 |
| RN-016 | Filtros obrigatórios: Cultura, Talhão, Motorista, Caminhão (placa) | 11:01–11:28 |
| RN-017 | Peso Bruto e Peso Líquido **não** precisam de filtro | 11:03 |
| RN-018 | A aba de Produtividade é um **relatório derivado** (totais e médias), não uma tela de cadastro | 12:18–13:10 |

### 2.3 Relação com Transporte

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-019 | Transporte de frete **faz parte da Colheita**, não é uma tela separada — _"juntar na colheita, fica melhor, fica tudo numa aba só"_ | 13:54–14:45 |
| RN-020 | A tela de produtividade/relatório mostra o resultado consolidado da colheita | 7:22–7:30 |

### 2.4 Fórmulas e Descontos

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-021 | Os descontos de **umidade** e **impureza** podem ser automáticos se a fórmula for fornecida | 5:55–6:06 |
| RN-022 | O silo envia um relatório com: Peso Bruto, Descontos (umidade, impureza), Peso Líquido, Cultura, Talhão | 4:42–4:56 |
| RN-023 | O dado é inserido **manualmente** pelo usuário. Não há integração automática com o silo | 5:58–6:02 |

---

## 3. Máquinas

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-030 | **Máquina ≠ Caminhão.** São entidades separadas no sistema | 2:48–2:54 |
| RN-031 | Tipos de máquinas: Colheitadeira, Trator, Pulverizador, Equipamento | 15:38 |
| RN-032 | Cada máquina tem: Nome, Modelo, Tipo, Status (ativo/manutenção/inativo), Localização (galpão/pátio), Custo de Compra | 15:23–15:55 |
| RN-033 | O detalhe da máquina puxa dados de: Colheita, Abastecimento, Transporte, Lucro/Receita, Manutenção | 16:00–16:22 |
| RN-034 | Manutenções devem registrar: Data, Descrição, Tipo, Classificação, Fornecedor/Oficina, Valor | 17:28–17:46 |
| RN-035 | Custos de manutenção são **alocados à máquina pelo Financeiro** — _"no financeiro você vai lá e aloca para tal máquina"_ | 18:00–18:33 |
| RN-036 | Deve ser possível filtrar manutenções por mês (mini relatório) | 17:07–17:14 |

---

## 4. Abastecimento (Controle de Diesel)

### 4.1 Aba "Abastecimentos"

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-040 | Cada abastecimento registra: Data, Máquina, Operador, Talhão, Serviço, Volume (litros), Responsável | 31:17–32:42 |
| RN-041 | O abastecimento é a **saída** do estoque de diesel — _"a hora que você lança o abastecimento, ele já dá como saída"_ | 33:47–33:55 |
| RN-042 | Filtros: Máquina, Data, Operador — _"filtro por máquina a quantidade de óleo que foi no mês"_ | 32:55–33:11 |

### 4.2 Aba "Movimentações"

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-043 | **Entrada** = quando a nota fiscal do diesel chega (lançada pelo Financeiro) | 33:37–34:04 |
| RN-044 | **Saída** = automática ao registrar um abastecimento de máquina | 34:12–34:18 |
| RN-045 | A aba de movimentações é **apenas leitura/consulta** — _"seria só por curiosidade clicar nela para ver quanto tem de estoque, quanto gastou"_ | 33:50–33:55 |
| RN-046 | Dados da movimentação: Data, Tipo (entrada/saída), Nota Fiscal, Volume, Saldo acumulado | 34:00–34:23 |

---

## 5. Estoque de Insumos

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-050 | Lista de produtos com: Nome, Categoria, Estoque Atual | 35:04–35:09 |
| RN-051 | **NÃO usar Estoque Mínimo** — _"a gente não usa esse estoque mínimo. Tem época do ano que você não usa o produto"_ | 35:49–36:15 |
| RN-052 | **Entrada** de insumo = lançamento no Financeiro (compra com nota fiscal) | 36:58 |
| RN-053 | **Saída** de insumo = ao registrar uma atividade de campo (plantio, pulverização, etc.) | 36:58 |
| RN-054 | O detalhe do produto mostra histórico tipo extrato bancário (entradas e saídas cronológicas) | 36:48–36:52 |

---

## 6. Atividades de Campo

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-060 | Tipos de atividades: Plantio, Pulverização (1º/2º/3º fungicida), Adubação, Incorporação, Colheita | 26:44–26:52 |
| RN-061 | Ao criar uma atividade, seleciona-se: Tipo, Talhão, Cultura, e os insumos utilizados | 27:02–27:10 |
| RN-062 | Os insumos selecionados na atividade devem **dar baixa no estoque automaticamente** | 27:10–27:17 |
| RN-063 | Os insumos consumidos entram como **custo da cultura/área** | 27:15–27:17 |
| RN-064 | A atividade registra em qual **fase/etapa** o talhão está (plantio, 1º fungicida, etc.) | 28:04–28:22 |

---

## 7. Financeiro

### 7.1 Conceito Central

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-070 | O Financeiro é o **módulo centralizador** — todas as notas, pagamentos e custos são lançados aqui primeiro | 19:16–19:46 |
| RN-071 | Cada lançamento deve ser **alocado** para um destino: Máquina, Insumo, Administrativo, Estoque, etc. | 19:28–19:46 |
| RN-072 | Ao alocar um custo a uma máquina, ele aparece automaticamente na aba "Manutenção" da máquina | 18:24–18:33 |
| RN-073 | Ao alocar compra de insumo, o estoque é alimentado automaticamente | 23:52–24:04 |
| RN-074 | Ao alocar compra de diesel, a movimentação de estoque de combustível é alimentada automaticamente | 20:22–20:35 |

### 7.2 Contas a Pagar

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-075 | Cada nota fiscal registrada no financeiro tem um **vencimento** | 44:49–44:58 |
| RN-076 | Deve ser possível filtrar: _"O que eu tenho para pagar em maio?"_ → lista todas as notas com vencimento em maio | 45:02–45:09 |
| RN-077 | Status do lançamento: **Pago** ou **Aberto** | 48:15–48:18 |
| RN-078 | Quando um lançamento é marcado como pago, ele sai do relatório de "contas em aberto" | 48:32–48:40 |

### 7.3 Filtros do Financeiro

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-079 | Filtros obrigatórios: **Data, Loja/Fornecedor, Produto, Vencimento, Banco** | 47:46–48:04 |
| RN-080 | Filtro por Nota Fiscal | 47:02 |
| RN-081 | Forma de pagamento: Pix, Boleto, Transferência, Cartão, Dinheiro, Débito Automático | 50:15–50:23 |
| RN-082 | O usuário pode ter **mais de um banco** — precisa registrar qual banco foi usado | 48:05–48:09 |

### 7.4 Parcelas

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-083 | Pagamentos parcelados existem, mas são **poucos** (principalmente manutenção) | 49:05–49:25 |
| RN-084 | Para parcelas, o usuário registra **manualmente** cada parcela (como um registro separado) | 49:30–49:45 |
| RN-085 | Deve existir opção de **duplicar** um lançamento para facilitar registro de parcelas | 49:45–49:54 |
| RN-086 | Futuramente, poderá ter parcelamento automático (projeção de datas) | 49:58–50:07 |

---

## 8. Talhões

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-090 | Cada talhão pertence a uma **propriedade** (ex: Fazenda São Bento, Fazenda Laércio) | 41:11–41:24 |
| RN-091 | Naming: pode ser "Laércio A", "Laércio B", "Laércio Principal" — decisão do usuário | 41:43–41:49 |
| RN-092 | A **cultura do talhão muda por safra** — _"um ano é soja, em maio já tá com trigo"_ | 42:21–42:33 |
| RN-093 | **Não é como café** (permanente) — as culturas rotacionam | 42:33–42:37 |
| RN-094 | Ao mudar de safra no filtro global, a lista de talhões deve mostrar a cultura correspondente àquela safra | 42:44–42:52 |

---

## 9. Fluxo de Dados Integrado

```
┌─────────────────────────────────────────────────────┐
│                    FINANCEIRO                        │
│  (Notas fiscais, pagamentos, alocação de custos)    │
└──────┬──────────────┬──────────────┬────────────────┘
       │              │              │
       ▼              ▼              ▼
  ┌─────────┐   ┌──────────┐   ┌──────────┐
  │ ESTOQUE │   │ MÁQUINAS │   │ DIESEL   │
  │ INSUMOS │   │ (manut.) │   │ (movim.) │
  └────┬────┘   └──────────┘   └────┬─────┘
       │                            │
       ▼                            ▼
  ┌──────────┐               ┌──────────────┐
  │ATIVIDADES│               │ABASTECIMENTO │
  │ (baixa   │               │ (saída do    │
  │  estoque)│               │  diesel)     │
  └────┬─────┘               └──────────────┘
       │
       ▼
  ┌──────────┐
  │ CUSTO DA │
  │ CULTURA  │
  └──────────┘
```

### Resumo do Fluxo

1. **Compra chega** → Registra no Financeiro → Aloca para destino
2. **Insumo comprado** → Entrada no Estoque de Insumos
3. **Diesel comprado** → Entrada nas Movimentações de Diesel
4. **Atividade registrada** → Consome insumo → Baixa no Estoque → Entra como custo da cultura
5. **Máquina abastecida** → Consome diesel → Baixa nas Movimentações
6. **Manutenção paga** → Custo alocado à Máquina via Financeiro

---

## 10. Escopo Explicitamente Excluído

| Item | Motivo | Ref. |
|------|--------|------|
| Confinamento | _"Deixa, porque o confinamento ainda não sei como é que vai ser"_ | 51:02–51:08 |
| Tela separada de Transporte | Absorvido pela Colheita | 13:54 |
| Integração automática com Silo | Dados inseridos manualmente | 5:58 |
| Parcelamento automático | Futuramente, por enquanto é manual (duplicar lançamento) | 49:58 |
| Fórmula automática de descontos Umidade/Impureza | Depende do envio da fórmula pela equipe | 6:02–6:06 |

---

## 11. Decisões de UI/UX

| Regra | Descrição | Ref. |
|-------|-----------|------|
| RN-100 | Filtros globais ficam no topo, persistem entre telas (igual Aegro) | 0:30–0:50 |
| RN-101 | Cada cadastro administrativo alimenta os selects do sistema (culturas, safras, talhões, usuários) | 43:50–44:06 |
| RN-102 | Tela de Produtividade = relatório com filtros, não cadastro | 12:18–13:10 |
| RN-103 | Relatórios devem incluir: Produção (total sacos), Produtividade (sc/ha), Rentabilidade (custos diretos + indiretos) | 38:44–39:53 |
| RN-104 | Rentabilidade direta = custos de plantio + insumos pela área | 39:14–39:29 |
| RN-105 | Custos indiretos = arrendo, administrativo, escritório (rateado), manutenção geral | 39:29–39:52 |
