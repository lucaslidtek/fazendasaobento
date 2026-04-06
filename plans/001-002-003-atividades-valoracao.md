# PLAN — Issues 001 + 002 + 003: Valoração de Atividades

**Escopo:** Adicionar preço/valor aos insumos, calcular custo/ha e valor total das atividades.
**Regras:** RN-065, RN-066, RN-068
**Status:** Aguardando aprovação

---

## 1. Descrição

As três issues são um bloco único de implementação, pois tocam os mesmos arquivos e dependem umas das outras. O objetivo é transformar a tela de Atividades de um simples registro de "o que foi feito" para um **registro com valoração completa**, onde cada atividade mostra quanto custou.

### O que muda

Cada produto na atividade passa a ter: `unitPrice` (R$/unidade).

A partir disso, calculamos automaticamente:
- **Dosagem/ha** = `quantity ÷ areaHectares` (já implícito pela unidade, mas pode exibir se)
- **Valor/ha** = `unitPrice × (quantity ÷ areaHectares)` se unidade não for por ha; ou `unitPrice × quantity` se já for /ha
- **Valor total do produto** = `unitPrice × quantidadeTotal`
- **Valor total da atividade** = Σ valores dos produtos
- **Custo/ha da atividade** = `valorTotal ÷ areaHectares`

---

## 2. Cenários

| Cenário | Entrada | Esperado |
|---|---|---|
| Happy path | Pulverização com 2 insumos (Glifosato R$45/L, 3L/ha, 20ha) | Valor produto: R$2.700 / Custo/ha: R$135/ha |
| Sem preço | Produto adicionado sem preço unitário | Campo editável mostra R$0,00, valor total = R$0 |
| Sem insumos | Atividade sem produtos (ex: Incorporação) | Valor total = R$0,00, custo/ha = R$0,00 |
| Área = 0 | Bug/edge case | Custo/ha exibe "—" |
| Múltiplos produtos | 3 insumos com preços diferentes | Soma individual de cada produto |
| Preço do estoque | Produto existe no DEMO_PRODUCTS | Preenche preço automaticamente (futuro: do Financeiro) |

---

## 3. Tabelas / Dados

### 3.1 Mudança no `ActivityRecord` (demo-data.ts)

```diff
 products: {
   productId?: number;
   name: string;
   quantity: number;
   unit: string;
+  unitPrice: number;    // R$ por unidade (L, kg, sc, un)
 }[];
```

### 3.2 Mudança no DEMO_PRODUCTS (demo-data.ts)

Adicionar `unitPrice` ao DEMO_PRODUCTS para ter um preço de referência:

```diff
 { id: 1, name: "Semente Soja RR", category: "Sementes", currentStock: 450, minStock: 100, unit: "SC",
+  unitPrice: 180.00  // R$/saca
 },
```

### 3.3 Mudança no DEMO_ACTIVITIES (demo-data.ts)

Cada produto nas atividades demo recebe `unitPrice`:

```diff
 products: [
-  { productId: 1, name: "Semente Soja RR", quantity: 2.5, unit: "sc/ha" },
+  { productId: 1, name: "Semente Soja RR", quantity: 2.5, unit: "sc/ha", unitPrice: 180.00 },
 ]
```

---

## 4. Arquivos a Modificar

### [MODIFY] demo-data.ts
`src/lib/demo-data.ts`

**Mudanças:**
1. Adicionar `unitPrice: number` ao tipo do array `products` dentro de `ActivityRecord` (linha 124)
2. Adicionar `unitPrice?: number` ao `DEMO_PRODUCTS` (linhas 299-304)
3. Atualizar todos os `DEMO_ACTIVITIES` para incluir `unitPrice` nos produtos (linhas 246-297)

---

### [MODIFY] atividades/page.tsx
`src/features/atividades/page.tsx`

**Mudanças no Schema (linha 87-100):**
1. Adicionar `unitPrice: z.coerce.number().min(0)` ao objeto do array `products`

**Mudanças no FormContent (linha 124-314):**
1. Adicionar campo `unitPrice` (Input tipo number) ao lado de `quantity`
2. Auto-preencher `unitPrice` quando produto é selecionado (via `DEMO_PRODUCTS`)
3. Calcular e exibir inline: valor total do produto = `unitPrice × quantity`
4. Calcular e exibir no rodapé da seção: **Valor Total** e **Custo/ha**

**Mudanças na Tabela Desktop (linha 568-659):**
1. Adicionar colunas: "Valor Total", "R$/ha"
2. Formatar como moeda brasileira: `R$ X.XXX,XX`

**Mudanças nos Cards Mobile (linha 662-715):**
1. Exibir valor total em destaque (substituir posição do "ha" como métrica primária)
2. Exibir custo/ha como métrica secundária

**Mudanças nos Cards de Estatísticas (linha 489-516):**
1. Card "Total de Atividades" → manter
2. Card "Área Trabalhada" → manter mas adicionar "Custo Total: R$ X" como terceira linha
3. Adicionar novo card: "Custo Médio/ha" com o cálculo da média

**Mudanças no Stats (linha 364-368):**
1. Calcular `totalCost` e `avgCostPerHa` no mesmo useMemo

---

## 5. Dependências

- **Nenhuma dependência externa** nova
- Usa apenas padrões já existentes no projeto: `z.coerce.number()`, `useMemo`, formatação inline com `toLocaleString('pt-BR')`

---

## 6. Padrão de Formatação de Moeda (Pesquisa Interna)

O projeto já usa consistentemente:
```tsx
R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
```

Vou seguir o mesmo padrão. Encontrado em:
- `financeiro/page.tsx` (linhas 540, 555, 570, 723)
- `relatorios/page.tsx` (linhas 306, 318, 330)
- `caminhao-detalhes.tsx` (linhas 321, 361)

---

## 7. Checklist de Implementação

### demo-data.ts
- [ ] Adicionar `unitPrice: number` ao type dos products em `ActivityRecord`
- [ ] Adicionar `unitPrice` ao array `DEMO_PRODUCTS`
- [ ] Atualizar `DEMO_ACTIVITIES` com unitPrice em cada produto

### atividades/page.tsx — Schema + Form
- [ ] Adicionar `unitPrice` ao zod schema
- [ ] Adicionar campo Input de preço no FormContent
- [ ] Auto-preencher unitPrice ao selecionar produto do select
- [ ] Calcular e exibir inline: valor total de cada produto
- [ ] Exibir subtotal da seção de insumos
- [ ] Exibir custo/ha derivado no rodapé do formulário

### atividades/page.tsx — Listagem Desktop
- [ ] Adicionar coluna "Valor Total" na tabela
- [ ] Adicionar coluna "R$/ha" na tabela
- [ ] Formatar valores com padrão brasileiro

### atividades/page.tsx — Listagem Mobile (Cards)
- [ ] Exibir valor total no card
- [ ] Exibir custo/ha como métrica secundária

### atividades/page.tsx — Estatísticas
- [ ] Calcular totalCost nos stats
- [ ] Calcular avgCostPerHa nos stats
- [ ] Adicionar/atualizar cards de estatísticas
