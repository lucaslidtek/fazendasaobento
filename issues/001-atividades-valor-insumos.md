# 001 — Adicionar Preço/Valor aos Insumos das Atividades

**Módulo:** Atividades de Campo
**Regras:** RN-065, RN-068
**Prioridade:** 🔴 Alta
**Depende de:** Nenhuma

---

## Descrição

Cada produto/insumo adicionado a uma atividade deve ter campos de **preço unitário** e **valor calculado** para possibilitar o cálculo de custo da atividade e, futuramente, o custo da safra.

Atualmente, o formulário de atividades registra para cada produto apenas: `nome`, `quantidade`, `unidade`.

Deve passar a registrar também:
- **Preço unitário** (R$/unidade) — preenchido automaticamente a partir do estoque/financeiro, com possibilidade de edição manual
- **Dosagem/ha** — quantidade usada por hectare (derivado: `quantidade ÷ área`)
- **Valor/ha** — custo do produto por hectare (derivado: `preço unitário × dosagem/ha`)
- **Quantidade total** — quantidade total consumida na área (já existe como `quantity`)
- **Valor total do produto** — derivado: `preço unitário × quantidade total`

---

## Cenários

- **Happy path:** Usuário adiciona produto, sistema preenche preço do estoque, calcula derivados automáticos
- **Edge case:** Produto sem preço cadastrado → permitir preenchimento manual
- **Edge case:** Área = 0 → dosagem/ha e valor/ha não calculáveis

---

## Checklist

- [ ] Adicionar campo `unitPrice` ao schema de produtos na atividade
- [ ] Adicionar colunas de valor na UI do formulário (dosagem/ha, valor/ha, valor total)
- [ ] Calcular derivados automaticamente ao preencher qtde/preço
- [ ] Exibir subtotal de insumos no final da seção de produtos
- [ ] Atualizar tabela/cards de listagem para exibir valor da atividade
