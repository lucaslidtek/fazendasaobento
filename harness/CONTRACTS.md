# CONTRACTS.md
> Contrato do sprint ativo. Define exatamente o que será implementado e como será validado.
> Criado pelo Implementador no início de cada sprint. Aprovado pelo Validador antes da implementação.

---

## Como Funciona

1. **Planejamento:** Implementador lê `SPEC.md` + `PROGRESS.md` e escreve o contrato do próximo sprint.
2. **Aprovação:** Validador lê o contrato e confirma que está alinhado com a spec. Se não estiver, negocia ajustes.
3. **Implementação:** Implementador executa apenas o que está no contrato.
4. **Validação:** Validador testa item a item usando os critérios de aceite definidos aqui + sensores de `SENSORS.md`.
5. **Resultado:** Aprovado → atualiza `PROGRESS.md`. Reprovado → volta para Implementador com relatório.

---

## Contrato Ativo

**Sprint:** S-11
**Criado por:** Implementador — 24/04/2026
**Aprovado por:** Validador — *(pendente aprovação)*
**Status:** 🔄 Em execução

---

### Tarefas do Sprint S-11: Ajustes WhatsApp 15/04

#### T-AD-01: Dashboard — KPIs por cotações do dia (GQB style)
**Arquivos:** `src/pages/dashboard.tsx`
**Critérios:**
- [ ] KPIs mostram cotações relevantes (Soja R$/sc, Milho R$/sc, Dólar, Diesel)
- [ ] Layout segue estilo premium existente
- [ ] Build passa

---

#### T-AD-02: Colheita — remover coluna Produtividade + renomear Logística→Silo / Máquina→Caminhão
**Arquivos:** `src/features/colheita/page.tsx`
**Critérios:**
- [ ] Coluna "Produtividade" removida da tabela desktop e cards mobile
- [ ] Cabeçalho "Logística" renomeado para "Silo"
- [ ] Cabeçalho "Máquina" renomeado para "Caminhão"
- [ ] Build passa

---

#### T-AD-03: Form Colheita — scroll em telas pequenas + Sacas automático + remover Hectares
**Arquivos:** `src/features/colheita/page.tsx`
**Critérios:**
- [ ] Dialog/Sheet tem overflow-y-auto para scroll quando conteúdo > tela
- [ ] Campo "Sacas" é calculado automaticamente: Peso Líquido / 60 (somente leitura, atualiza em tempo real)
- [ ] Campo "Hectares (ha)" removido do formulário (areaHectares ainda existe no schema para compatibilidade)
- [ ] Build passa

---

#### T-AD-04: Form Atividades — Tipo de Operação expansível com "+ Adicionar Tipo"
**Arquivos:** `src/features/atividades/page.tsx`
**Critérios:**
- [ ] Campo "Tipo de Operação" mostra dropdown com tipos existentes + opção "+ Adicionar Tipo" inline
- [ ] Ao clicar em "+ Adicionar", aparece input inline para digitar novo tipo
- [ ] Novo tipo é capitalizado (primeira letra maiúscula, resto minúsculo)
- [ ] Novo tipo é salvo no estado e aparece nas próximas seleções
- [ ] Schema Zod aceita string genérica (não mais enum fixo)
- [ ] Build passa

---

#### T-AD-05: Relatórios — filtros por talhão, cultura, fazenda, hectare
**Arquivos:** `src/features/relatorios/page.tsx`
**Critérios:**
- [ ] Painel de filtros na aba de Produtividade com: Talhão (select), Cultura (select)
- [ ] Filtros aplicados nos dados exibidos nos gráficos
- [ ] Build passa

---

#### T-AD-06: Relatório Produtividade — comparativo Produção + análise financeira
**Arquivos:** `src/features/relatorios/page.tsx`
**Critérios:**
- [ ] Gráfico de barras comparativo: Produção (sacas) vs Produtividade (sc/ha) por talhão
- [ ] Gráfico de barras: Lucro (azul) vs Custo (vermelho) por categoria/período
- [ ] Build passa

---

#### T-AD-07: Abastecimento — filtro por Serviço na aba Abastecimentos
**Arquivos:** `src/pages/abastecimento.tsx`
**Critérios:**
- [ ] Filtro "Serviço" adicionado ao painel de filtros da aba Abastecimentos
- [ ] Lista de valores únicos de serviço/fuelType dos registros
- [ ] Build passa

---

#### T-AD-08: Usuários → Funcionários — campos salário, bonificações, faltas, status + tabela
**Arquivos:** `src/pages/usuarios.tsx`, `src/components/layout/AppLayout.tsx`
**Critérios:**
- [ ] Título da página e sidebar: "Usuários" → "Funcionários"
- [ ] Form adiciona: salário (number), bonificações (lista de itens), faltas (number), status (ativo/não ativo)
- [ ] Tabela exibe novas colunas: Salário, Faltas, Status
- [ ] Schema Zod atualizado com novos campos
- [ ] Build passa

---

### O Que Este Sprint NÃO Faz
- Banco de dados real
- Módulo de Locações
- Novos módulos além dos mencionados

## Sprint S-01 (Histórico)

---

### Tarefas do Sprint S-01: Bug Fixes + Caminhão Dropdown

#### T-01: Fix — Filtro de cultura "Milho" na colheita
**Descrição:** O filtro por cultura na tela de colheita não está funcionando corretamente quando se seleciona "Milho". Investigar a lógica de filtragem em `filteredRecords` e corrigir a comparação de strings.
**Arquivos que serão modificados:**
- `src/features/colheita/page.tsx` — corrigir lógica do useMemo que filtra por `filterCulture`

**Critérios de aceite:**
- [ ] Ao selecionar "Milho" no filtro, apenas colheitas que possuem "Milho" no array `cultures` são mostradas
- [ ] Todos os outros filtros de cultura (Soja, Trigo, etc.) continuam funcionando
- [ ] Combinação de filtros (cultura + máquina + motorista) funciona corretamente
- [ ] Build passa sem erros

---

#### T-02: Fix — Botão "Novo Lançamento" no Financeiro
**Descrição:** O botão "Novo Lançamento" no módulo financeiro não está abrindo o formulário (Dialog/Sheet). Investigar o state management do `isDialogOpen` / `isSheetOpen` e o binding do trigger.
**Arquivos que serão modificados:**
- `src/features/financeiro/page.tsx` — corrigir o binding do Dialog trigger e garantir que o state abre corretamente

**Critérios de aceite:**
- [ ] Clicar em "Novo Lançamento" no desktop abre o Dialog com o formulário completo
- [ ] No mobile, o FAB ou equivalente abre o Sheet com o formulário
- [ ] O formulário é funcional: preencher e submeter funciona
- [ ] Build passa sem erros

---

#### T-03: Fix — Design da lista de insumos nas Atividades
**Descrição:** Há um "errinho de design" na lista de insumos quando adicionados no formulário de atividades. Verificar alinhamento, espaçamento e responsividade dos cards de insumo.
**Arquivos que serão modificados:**
- `src/features/atividades/page.tsx` — ajustar CSS/layout dos campos dentro do array de insumos

**Critérios de aceite:**
- [ ] Campos de insumo (produto, quantidade, unidade, preço) alinhados horizontalmente no desktop
- [ ] No mobile, campos empilham verticalmente sem overflow
- [ ] Botão de remover (lixeira) posicionado consistentemente
- [ ] Cálculo inline (= R$ X,XX) visível e alinhado
- [ ] Build passa sem erros

---

#### T-04: Campo "Caminhão" como Dropdown no formulário de Colheita
**Descrição:** Atualmente o campo "Caminhão / Placa" no formulário de registro de colheita é um input de texto livre. Deve ser convertido para um `Select` (dropdown) que puxa a lista de caminhões já cadastrados no sistema (da rota `/caminhoes` ou do demo data `DEMO_TRUCKS`).
**Arquivos que serão criados/modificados:**
- `src/features/colheita/page.tsx` — trocar `<Input>` do campo `truck` por `<Select>` com opções dos caminhões cadastrados
- `src/lib/demo-data.ts` — verificar/garantir que existe array de caminhões com id, placa e nome

**Critérios de aceite:**
- [ ] Campo "Caminhão" é um dropdown com todas as opções vindas dos caminhões cadastrados
- [ ] Cada opção mostra placa + nome/apelido do caminhão
- [ ] Ao selecionar, o valor é salvo corretamente no registro de colheita
- [ ] Campo ainda aceita valor vazio (logística é opcional)
- [ ] Build passa sem erros

---

### O Que Este Sprint NÃO Faz

> Explicitamente fora de escopo para evitar scope creep.

- Criação de entidade "Silo" (será no S-02)
- Integrações automáticas entre módulos (financeiro ↔ estoque, venda → silo)
- Banco de dados real
- Novos relatórios
- Alterações na administração

---

### Dependências

- Demo data (`src/lib/demo-data.ts`) com caminhões disponíveis
- Componentes ShadCN/UI já instalados (Select, Dialog, Sheet)

---

## Contratos Futuros (Preview)

> Resumo dos próximos sprints para contexto. Detalhes serão escritos quando cada sprint for ativado.

### Sprint S-02: Cadastro de Silos + Dropdown Destino
- Criar entidade `Silo` no demo-data (id, name, location, capacity)
- Adicionar CRUD de silos na administração ou na seção de colheita
- Converter campo "Destino / Silo" no formulário de colheita para dropdown que puxa silos cadastrados
- US-03, US-09, US-31

### Sprint S-03: Visão de Silos (Aba Nova)
- Criar aba "Silos" na seção de Colheita (Tabs: Colheitas | Silos) — US-32
- Calcular estoque por silo: sum(peso líquido) por silo, agrupado por cultura
- Exibir AMBOS peso líquido (kg) e sacas (peso líquido ÷ 60)
- Soma progressiva acumulada (não só totais, mas visão de acúmulo)
- Filtros: por silo, por cultura
- Cards mostrando cada silo com estoques por cultura
- Consulta rápida sem precisar gerar relatório — US-33
- US-04, US-05, US-06, US-07, US-32, US-33

### Sprint S-04: Integração Financeiro → Estoque
- Quando lançamento de despesa com categoria "Combustível" ou "Insumos" + status "pago" → entrada automática no estoque
- Fix adicional do botão e formulário financeiro
- US-11, US-15, US-16

### Sprint S-05: Integração Venda → Silo
- Quando lançamento de receita com categoria "Vendas" + cultura + silo selecionado → baixa automática no estoque do silo
- Novo campo no formulário de receita: "Silo de origem" e "Quantidade vendida (kg ou sacas)"
- US-08, US-19

### Sprint S-06: Integração Abastecimento → Estoque
- Registrar abastecimento gera saída automática de combustível no estoque
- Movimentações visíveis na aba de detalhes do produto
- US-12, US-14

### Sprint S-07: Integração Atividade → Estoque
- Aprimorar formulário de atividade (tipos expandidos, insumos)
- Lista de tipos de operação expansível (além dos 4 atuais) — US-35
- Stats cards no topo: total atividades, área trabalhada, custo total — US-36
- Baixa automática de insumos usados
- Vinculação à safra ativa
- US-20, US-21, US-22, US-23, US-35, US-36

### Sprint S-08: Financeiro ↔ Máquinas
- Lançamentos financeiros vinculados a uma máquina aparecem na ficha da máquina
- Aba de "Movimentações" na ficha da máquina (entradas/saídas) — US-34
- Cadastro de contas bancárias com saldo auto-atualizado
- Upload de nota fiscal
- US-10, US-17, US-18, US-34

### Sprint S-09: Filtro Global Aprimorado
- Garantir que TODAS as telas respeitam o filtro de safra
- Testar mudança de safra e confirmar que dados zeram/mudam
- US-28, US-29

### Sprint S-10: Relatórios Enriquecidos
- Mais gráficos e detalhamentos nos relatórios
- UX inspirada na EGRO (referência de qualidade mencionada pelo cliente) — US-37
- Workflow iterativo: clientes pedem, dev implementa
- Dados reais integrados dos outros módulos
- US-24, US-25, US-26, US-27, US-37

---

## Histórico de Contratos Anteriores

| Sprint | Período | Resultado | Notas |
|--------|---------|-----------|-------|
| — | — | — | Primeiro sprint do projeto com harness |
