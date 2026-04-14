# SPEC.md
> Especificação central do projeto Fazenda São Bento.
> Baseada no transcript da reunião de 14/04/2026 entre Lucas (dev), Felipe e Júnior (stakeholders).
> Atualizada pelo humano ou pelo agente de planejamento. Nunca alterada durante implementação.

---

## Visão Geral

**Nome do projeto:** Fazenda São Bento — Sistema de Gestão Agrícola
**Descrição:** ERP agrícola web-first para gestão integral de uma fazenda. Controla colheita, transporte/logística, silos/armazenagem, máquinas, abastecimento, estoque de insumos, atividades de campo, financeiro centralizado e relatórios inteligentes.
**Stack principal:** Vite + React + TypeScript, TailwindCSS, ShadCN/UI, Recharts, Wouter, react-hook-form + Zod, TanStack Query
**Objetivo final:** Sistema funcional com banco de dados real onde os usuários possam cadastrar, editar e consultar todos os dados operacionais e financeiros da fazenda, com fluxos integrados entre módulos.

---

## Usuários e Contexto

**Quem usa:** Gestores rurais (Felipe, Júnior) e operadores de campo na Fazenda São Bento.
**Problema que resolve:** Centralizar toda a gestão agrícola — colheita, transporte, armazenagem em silos, estoque, atividades de campo e financeiro — em um único sistema integrado, substituindo controles manuais e planilhas.
**Como resolve:** Aplicação web com filtro global de safra/talhão, formulários conectados entre si (colheita → silo, financeiro → estoque, atividade → estoque), banco de dados real e relatórios visuais.

---

## User Stories

### Módulo: Colheita + Transporte (Unificado)
- [x] US-01: Como gestor, quero que o campo "Caminhão" no formulário de colheita seja um **dropdown/select** que puxa os caminhões cadastrados na administração, para evitar digitação manual e manter consistência.
- [x] US-02: Como gestor, quero que cada registro de colheita inclua dados de logística (caminhão, peso bruto, peso líquido, destino/silo, umidade, impureza) no mesmo formulário, pois colheita e transporte são a mesma operação.
- [x] US-03: Como gestor, quero que o "Destino" da colheita seja um select puxando os silos cadastrados, para garantir rastreabilidade do grão.
- [x] US-32: Como gestor, quero que a seção de Colheita tenha **duas abas**: "Colheitas" (registros) e "Silos" (estoque acumulado por silo), para navegar facilmente entre o registro e a visão de armazenagem.

### Módulo: Silos / Armazenagem (NOVO)
> **Conceito: "Resultado da Produção"** — os silos representam o resultado da produção agrícola (grãos colhidos armazenados). É conceitualmente diferente do "Estoque de Insumos" (diesel, sementes, defensivos). O silo mostra o que a fazenda PRODUZIU; o estoque mostra o que a fazenda COMPROU para operar.

- [x] US-04: Como gestor, quero uma **nova aba/página "Silos"** dentro da seção de Colheita, para visualizar o estoque acumulado por silo.
- [x] US-05: Como gestor, quero ver o estoque de cada silo com **ambos** peso líquido (kg) e sacas (peso líquido ÷ 60), mostrando a **soma progressiva** de todas as colheitas destinadas àquele silo.
- [x] US-06: Como gestor, quero que o estoque do silo seja **separado por cultura** (soja, milho, trigo, etc.), pois um silo pode armazenar mais de uma cultura.
- [x] US-07: Como gestor, quero poder **filtrar por silo** e **filtrar por cultura** dentro da visão de silos.
- [x] US-08: Como gestor, quero que ao registrar uma **venda** no financeiro (receita de venda de cultura), o sistema dê **baixa automática no estoque do silo** correspondente, para manter o saldo atualizado.
- [x] US-09: Como gestor, quero que os silos sejam entidades cadastráveis (nome, localização, capacidade), referenciáveis na colheita e no financeiro.
- [x] US-33: Como gestor, quero poder visualizar o estoque do silo **diretamente pela aba de silos** (sem precisar gerar relatório), para consulta rápida do que está armazenado.

### Módulo: Máquinas
- [x] US-10: Como gestor, quero que a ficha de cada máquina (detalhes) mostre colheitas, abastecimento, lucros/custos e manutenção, **conectados com o financeiro** — ou seja, lançamentos financeiros vinculados à máquina aparecem automaticamente na aba da máquina.
- [x] US-34: Como gestor, quero uma aba de **"Movimentações"** na ficha da máquina que mostre entradas (compras via financeiro) e saídas (abastecimentos diretos), similar ao padrão do estoque de insumos.

### Módulo: Abastecimento + Estoque de Insumos
- [x] US-11: Como gestor, quero que ao comprar diesel (lançamento de despesa no financeiro com categoria "Combustível" + nota fiscal), a **entrada no estoque** seja automática.
- [x] US-12: Como gestor, quero que ao registrar um abastecimento de máquina, a **saída do estoque** de combustível seja automática.
- [x] US-13: Como gestor, quero que o estoque de insumos mostre apenas: **Produto**, **Categoria** e **Saldo Atual**, de forma simplificada.
- [x] US-14: Como gestor, quero ver a **movimentação** (entradas e saídas) ao clicar em cada produto do estoque.

### Módulo: Financeiro (Centralizado)
- [x] US-15: Como gestor, quero que o botão "Novo Lançamento" funcione corretamente (bug reportado — não abre o formulário).
- [x] US-16: Como gestor, quero que ao criar um lançamento financeiro, eu possa selecionar se é de colheita, máquina, abastecimento etc., e o sistema **propague automaticamente** para as respectivas telas (colheita, máquina, estoque).
- [x] US-17: Como gestor, quero cadastrar contas bancárias e que o saldo de cada conta seja **atualizado automaticamente** conforme os lançamentos são registrados.
- [x] US-18: Como gestor, quero poder subir **nota fiscal** no lançamento financeiro.
- [x] US-19: Como gestor, quando eu registrar uma **venda de cultura** (receita), quero selecionar de qual silo sai a mercadoria, e o sistema deve dar baixa no estoque do silo automaticamente (integração US-08).

### Módulo: Atividades de Campo
- [x] US-20: Como gestor, quero registrar atividades com: data (puxa data atual), tipo de operação (Plantio, Pulverização, Adubação, Incorporação + outros), talhão, área, máquina, operador e **lista de insumos** com quantidade, unidade e valor unitário.
- [x] US-21: Como gestor, quero que o formulário calcule automaticamente o total de custo dos insumos e o custo por hectare em tempo real.
- [x] US-22: Como gestor, quero que ao registrar uma atividade com insumos, a **baixa de estoque** dos insumos utilizados seja automática.
- [x] US-23: Como gestor, quero que as atividades estejam **vinculadas à safra** selecionada no filtro global, de modo que trocar de safra mostre apenas as atividades daquela safra.
- [x] US-35: Como gestor, quero que a **lista de tipos de operação** seja **expansível** — além dos 4 tipos atuais (Plantio, Pulverização, Adubação, Incorporação), quero poder adicionar novos tipos conforme necessidade.
- [x] US-36: Como gestor, quero ver **cards de resumo (stats)** no topo da tela de atividades: total de atividades, área total trabalhada (ha) e custo total de insumos, filtrados pela safra ativa.

### Módulo: Relatórios
> **Referência de UX:** EGRO — os clientes mencionaram que os relatórios da EGRO tinham gráficos e detalhamentos bons como referência de qualidade.

- [x] US-24: Como gestor, quero um relatório de **produtividade por talhão** com gráficos de barras e volume histórico.
- [x] US-25: Como gestor, quero um relatório de **análise financeira** com receita bruta, custos diretos, custos indiretos, margem líquida e composição de custos.
- [x] US-26: Como gestor, quero um relatório de **custos realizados** com gráfico de categorias e tabela dos maiores gastos.
- [x] US-27: Como gestor, quero que os relatórios sejam enriquecidos **progressivamente** conforme mais dados são alimentados — os clientes irão pedindo conforme sentem necessidade (workflow iterativo).
- [x] US-37: Como gestor, quero que os relatórios tenham visual e detalhamento **similar ao padrão da EGRO** (gráficos interativos, detalhamentos por talhão, listas detalhadas), como referência de qualidade.

### Filtro Global (Safra + Talhão)
- [x] US-28: Como gestor, quero que o **filtro global de safra** no topo da aplicação filtre TODOS os dados exibidos no sistema (colheita, atividades, financeiro, relatórios, silos).
- [x] US-29: Como gestor, ao mudar a safra de "2025/2026" para "2023/2024", quero que tudo zere e mostre apenas dados daquela safra.

### Administração
- [x] US-30: Como gestor, quero que a área de administração permita cadastrar: safras, talhões, **caminhões**, culturas e usuários.
- [x] US-31: Como gestor, quero poder cadastrar **silos** (novo) com nome, localização e capacidade, na área de administração ou diretamente na seção de colheita.

### Bugs Identificados na Reunião
- [x] BUG-01: Filtro de cultura "Milho" na tela de colheita não está filtrando corretamente.
- [x] BUG-02: Botão "Novo Lançamento" no financeiro não abre o formulário.
- [x] BUG-03: Errinho de design na lista de insumos na tela de atividades (alinhamento/espaçamento).

---

## Sprints Planejados

> Cada sprint é um grupo de user stories relacionadas. Sprints pequenos (2-5 tarefas).

| Sprint | Descrição | User Stories | Status |
|--------|-----------|--------------|--------|
| S-01 | Bug fixes + Campo caminhão como dropdown | BUG-01, BUG-02, BUG-03, US-01 | ✅ Concluído |
| S-02 | Cadastro de Silos + Dropdown de destino na colheita | US-03, US-09, US-31 | ✅ Concluído |
| S-03 | Visão de Silos (aba nova em Colheita) | US-04, US-05, US-06, US-07, US-32, US-33 | ✅ Concluído |
| S-04 | Integração Financeiro → Estoque (compras dão entrada) | US-11, US-15, US-16 | ✅ Concluído |
| S-05 | Integração Venda → Silo (baixa automática) | US-08, US-19 | ✅ Concluído |
| S-06 | Integração Abastecimento → Estoque (saída automática) | US-12, US-13, US-14 | ✅ Concluído |
| S-07 | Integração Atividade → Estoque (baixa de insumos) | US-20, US-21, US-22, US-23, US-35, US-36 | ✅ Concluído |
| S-08 | Financeiro ↔ Máquinas (propagação bidirecional) | US-10, US-17, US-18, US-34 | ✅ Concluído |
| S-09 | Filtro Global aprimorado + Safra em tudo | US-28, US-29 | ✅ Concluído |
| S-10 | Relatórios enriquecidos | US-24, US-25, US-26, US-27, US-37 | ✅ Concluído |

---

## Critérios de Aceite Globais

> Regras que valem para **qualquer** entrega neste projeto.

- [ ] Código compila sem erros (`tsc --noEmit`)
- [ ] Build passa sem erros (`npm run build`)
- [ ] Nenhum `console.log` de debug em produção
- [ ] Formulários validados com Zod antes de submit
- [ ] Todos os selects/dropdowns puxam dados de fontes cadastradas (não digitação livre onde há cadastro)
- [ ] Filtro global de safra respeitado em todas as telas
- [ ] Integrações entre módulos funcionam bidirecionalmente (ex: venda → baixa silo)
- [ ] Layout responsivo (desktop table + mobile cards) mantido
- [ ] Design consistente com o padrão visual existente (shadcn + rounded-2xl + cards)

---

## Fora de Escopo (Fase Atual — Protótipo)

> O que explicitamente NÃO será construído neste momento.

- Banco de dados real (backend/API) — protótipo front-end apenas por agora
- Autenticação real (login funciona como bypass para protótipo)
- App mobile nativo
- Integração com sistemas externos (Perf, EGRO, etc.)
- Módulo de locações (mencionado por Felipe: "de locações vai ser a mesma coisa" — precisa de reunião específica para detalhar)

## Próxima Milestone (Pós-Protótipo)

> Mencionado na reunião: uma vez aprovado o protótipo visual (~90-95% pronto), a próxima etapa é **incluir o banco de dados** para que os clientes alimentem o sistema com dados reais.

- [ ] ML-01: Conectar banco de dados real (substituir demo-data por API)
- [ ] ML-02: Clientes testam o protótipo e enviam feedback pelo grupo de WhatsApp (Júnior e Felipe)
- [ ] ML-03: Módulo de locações — a ser detalhado em reunião futura

---

## Dependências Externas

| Serviço | Uso | Status |
|---------|-----|--------|
| Nenhum (protótipo) | Front-end only, dados mock | ✅ Ativo |

---

## Histórico de Decisões

> Registre aqui decisões técnicas importantes e o motivo.

| Data | Decisão | Motivo |
|------|---------|--------|
| 14/04/2026 | Unificar Colheita + Transporte na mesma tela | Cliente confirmou que transporte é parte da operação de colheita (mesma rota) |
| 14/04/2026 | Criar entidade "Silo" com estoque separado do estoque de insumos | Silos armazenam produção (grãos), estoque armazena insumos (diesel, sementes, etc.) — são conceitos distintos. Júnior usou o termo "Resultado da Produção" para silos |
| 14/04/2026 | Estoque do silo = soma do peso líquido das colheitas destinadas àquele silo | Cliente definiu: peso líquido é o que conta; sacas = peso líquido ÷ 60. Ambos devem ser exibidos |
| 14/04/2026 | Silos podem ter múltiplas culturas | Cliente confirmou: Silo Norte pode ter soja + milho simultaneamente |
| 14/04/2026 | Criar aba "Silos" separada dentro da seção de Colheita | Cliente preferiu aba separada ("pode colocar uma de silos também que a gente clica lá, já sabe o que que tem") |
| 14/04/2026 | Financeiro centralizado propaga para outras telas | Lançamento feito no financeiro aparece automaticamente em colheita/máquina/estoque conforme a categoria |
| 14/04/2026 | Venda de cultura no financeiro dá baixa no silo | Fluxo completo: colheita → silo acumula → venda cadastrada no financeiro → receita + baixa do silo. "Senão no financeiro ele vai ficar sempre negativo" (Júnior) |
| 14/04/2026 | Campo "Caminhão" deve ser dropdown, não input livre | Deve puxar da lista de caminhões cadastrados na administração |
| 14/04/2026 | Silo é visível sem relatório | Cliente quer ver estoque do silo "sem precisar pedir relatório" — acesso direto via aba |
| 14/04/2026 | Lista de tipos de atividade deve ser expansível | Lucas ofereceu e cliente concordou: além de Plantio, Pulverização, Adubação, Incorporação, podem adicionar mais |
| 14/04/2026 | EGRO como referência de qualidade para relatórios | Clientes mencionaram EGRO como benchmark: "gráficos, detalhamentos" — meta para relatórios futuros |
| 14/04/2026 | Próxima fase = banco de dados real | Lucas: "90-95% feito pra poder já incluir o banco de dados" — protótipo visual aprovado → backend |
| 14/04/2026 | Workflow de feedback iterativo | Clientes vão testar o link, mandam feedback no grupo ("Ó, Lucas, aqui tá faltando tal coisa") |
