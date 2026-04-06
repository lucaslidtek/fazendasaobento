# Workflow de Desenvolvimento — Spec-Driven

> **Este documento é uma DIRETIVA OPERACIONAL.** O agent DEVE seguir estas fases ao receber qualquer solicitação de feature, refatoração ou correção não-trivial.

---

## Pipeline Obrigatório

```
SPEC → BREAK → PLAN → EXECUTE → VERIFY
```

**Cada fase produz um entregável.** O agent não avança para a próxima fase sem aprovação do usuário (exceto quando o usuário explicitamente autoriza execução autônoma).

---

## Fase 1: SPEC (Entender o Escopo)

**Trigger:** Usuário pede uma feature, melhoria, ou o agent identifica uma necessidade.

**O que fazer:**
1. Ler os docs de referência relevantes (`BUSINESS_RULES.md`, `ARCHITECTURE.md`, `DESIGN.md`)
2. Analisar os arquivos existentes impactados (grep, view_file)
3. Documentar o que precisa mudar — de forma clara e técnica

**Entregável:** Resumo do escopo apresentado ao usuário (pode ser inline na conversa ou um artifact)

**Gate:** ✅ Usuário confirma o escopo

---

## Fase 2: BREAK (Quebrar em Issues)

**O que fazer:**
1. Pegar o escopo aprovado e dividir em **issues atômicas** — cada uma executável em uma única sessão de contexto
2. Numerar sequencialmente: `issues/001-*.md`, `issues/002-*.md`, etc.
3. Cada issue deve ter: título, descrição curta (3-5 linhas), prioridade, dependências

**Regras:**
- Uma issue = uma unidade de trabalho isolada (1 página, 1 comportamento, 1 fix)
- Priorizar: protótipo visual (UI) antes da funcionalidade (lógica)
- Consultar `BUSINESS_RULES.md` para identificar validações, edge cases e regras de domínio que impactam a issue
- Se o escopo é pequeno (1-2 arquivos, <50 linhas de mudança), pode pular a criação formal de issues

**Entregável:** Pasta `issues/` com arquivos markdown

**Gate:** ✅ Usuário revisa a lista de issues

---

## Fase 3: PLAN (Planejar Cada Issue)

**O que fazer para cada issue, antes de escrever qualquer código:**

### 3.1 Pesquisa Interna
- `grep_search` por componentes, funções e padrões que já existem no projeto
- Identificar código reutilizável — NUNCA duplicar
- Verificar `ARCHITECTURE.md` para saber onde cada coisa mora
- Consultar `BUSINESS_RULES.md` para validar que a implementação respeita as regras de domínio (fórmulas, fluxos, campos obrigatórios)

### 3.2 Pesquisa Externa (se necessário)
- Consultar documentação de libs usadas no projeto
- Buscar patterns comprovados para o problema

### 3.3 Escrever o Plan

| Seção | Conteúdo |
|---|---|
| **Descrição** | O que é a tarefa e por que é necessária |
| **Arquivos** | Quais arquivos `[MODIFY]` / `[NEW]` / `[DELETE]` — e O QUE muda em cada um |
| **Dados** | Modelos, interfaces ou campos que mudam |
| **Cenários** | Happy path + edge cases |
| **Checklist** | Lista de tarefas verificável |

> **REGRA DE OURO:** Se não está no plan, não mexe. O plan é o contrato — protege contra edições acidentais em arquivos errados.

**Entregável:** `plans/00X-*.md`

**Gate:** ✅ Usuário aprova o plan (ou autoriza execução direta)

---

## Fase 4: EXECUTE (Implementar)

**O que fazer:**
1. Implementar **APENAS** o que está no plan — nada além
2. Seguir os padrões de código do projeto (ver `ARCHITECTURE.md` e `DESIGN.md`)
3. Respeitar as regras de negócio documentadas em `BUSINESS_RULES.md` (campos obrigatórios, fórmulas, fluxos de dados)
4. Reutilizar componentes existentes antes de criar novos
5. Fazer edits cirúrgicos — jamais reescrever um arquivo inteiro

**Entregável:** Código implementado

---

## Fase 5: VERIFY (Validar)

**O que fazer:**
1. Verificar visualmente no browser (browser_subagent) que a mudança funciona
2. Capturar screenshots como evidência
3. Confirmar que não quebrou nada adjacente
4. Atualizar o checklist da issue (marcar `[x]`)

**Entregável:** Walkthrough com screenshots + confirmação

---

## Documentos de Referência

| Documento | Para quê | Caminho |
|---|---|---|
| **Architecture** | Estrutura de pastas, padrões, stack | `src/references/ARCHITECTURE.md` |
| **Design System** | Cores, tipografia, componentes UI | `src/references/DESIGN.md` |
| **Business Rules** | Regras de negócio extraídas dos stakeholders | `src/references/BUSINESS_RULES.md` |
| **Issues** | Tarefas atômicas | `issues/*.md` |
| **Plans** | Planejamento detalhado de cada issue | `plans/*.md` |

---

## Regras Invioláveis

1. **Janela de contexto limpa.** Tarefas grandes = quebrar em issues. Nunca empurrar tudo de uma vez.
2. **Sem adivinhação.** Especificar quais arquivos criar/modificar. Sem edits surpresa.
3. **Pesquisar antes de implementar.** Grep no código existente. Ler docs de referência. Zero duplicação.
4. **Isolamento.** Cada feature na sua área. Mexer numa coisa não pode quebrar outra.
5. **Se não está no plan, não mexe.** A documentação é lei.
6. **Verificar sempre.** Sem "acho que funciona" — abrir no browser, capturar screenshot, confirmar.
