# Documentação de Processo — Metodologia Deborah Felloni

**Fonte:** Transcrição do vídeo "Workflow completo para criar aplicações profissionais com Cloud Code" — Deborah Felloni
**Aplicado a:** Ajustes Locações São Bento (Pedro Lima), reunião 26/03/2026

---

## 1. Visão Geral

A metodologia é um antídoto aos 5 padrões problemáticos do Vibe Coding. O objetivo é criar **aplicações profissionais** (não protótipos), que sejam fáceis de dar manutenção e que não virem uma bagunça impossível de resolver.

O workflow tem **4 fases obrigatórias**, executadas **na ordem**, sem pular nenhuma:

```
SPEC → BREAK → PLAN → EXECUTE
```

---

## 2. Os 5 Problemas do Vibe Coding (e as Soluções)

| # | Problema | Por que acontece | Solução na metodologia |
|---|---|---|---|
| 1 | **IA engasga** em tarefas grandes | Lota a janela de contexto | **BREAK**: Quebrar em tarefinhas pequenas |
| 2 | **Código bagunçado** (complicado, duplicado) | IA reinventa a roda; duplica código que já existe | **PLAN**: Pesquisar código reutilizável + padrões documentados |
| 3 | **IA "desobedece"** (mexe no arquivo errado) | Você não disse QUAIS arquivos mexer | **PLAN**: Listar exatamente quais arquivos criar/modificar |
| 4 | **Arruma uma coisa, quebra outra** (cobertor de pobre) | Falta isolamento; responsabilidades juntas | **Arquitetura**: Organizar por comportamento isolado |
| 5 | **Gafes de segurança** | Lógica de negócio ou chaves no frontend | **Regra "Thin Client, Fat Server"** |

---

## 3. As 4 Fases

### Fase 1: SPEC (`spec.md`)

Escrever um documento que lista **todas as páginas**, e para cada página:
- **Componentes** que existem naquela página
- **Comportamentos** (behaviors) que o usuário pode fazer naquela página

> Esse documento dá clareza sobre o que vai ser construído e passa essa mesma clareza para a IA.

**O que entra no Spec:**
- Descrição geral do projeto
- Lista de todas as páginas
- Para cada página: componentes e comportamentos
- O Spec é **um documento grande e completo** — é o ponto de partida

**Entregável:** `spec.md`
**Aprovação:** ✅ Usuário revisa antes de prosseguir

---

### Fase 2: BREAK (Issues)

Pegar o Spec e **quebrar em tarefinhas pequenas** (issues). Regras:

- **Cada página** do Spec vira uma issue
- **Cada comportamento** do Spec vira uma issue
- **Começar pelo protótipo** (frontend visual, não funcional) para validar se está certo
- **Depois** implementar a parte funcional
- A issue começa **com poucas linhas** — apenas o nome e uma descrição simples
- A issue fica detalhada depois da fase de Plan

> Isso é MUITO importante para que a IA não engasgue. Se você der uma tarefa muito grande, ela vai falhar no meio.

**Entregável:** Pasta `issues/` com arquivos `001-*.md`, `002-*.md`, etc.
**Aprovação:** ✅ Usuário revisa antes de prosseguir

---

### Fase 3: PLAN (uma issue por vez)

Para **cada issue**, antes de implementar, rodar um planejamento que consiste em:

#### 3.1 Pesquisa interna (na base de código)
- Buscar **trechos de código que já existem** no projeto e que podem ser reutilizados/importados
- Evitar duplicar componentes, funções, padrões que já foram criados

#### 3.2 Pesquisa externa (documentações, internet)
- Buscar **padrões de implementação comprovados** e documentados
- Ler documentação de dependências externas que serão usadas
- Evitar que a IA reinvente a roda

#### 3.3 O que o Plan deve conter

Depois do planejamento, a issue deixa de ter 3 linhas e passa a ter um documento completo:

| Seção | O que descreve |
|---|---|
| **Descrição** | O que é essa tarefa |
| **Cenários** | Caminho feliz (happy path), edge cases, cenários de erro |
| **Tabelas/Dados** | Tabelas do banco que precisam ser criadas/modificadas, colunas |
| **Arquivos** | Quais arquivos criar ou modificar, e O QUE criar/modificar em cada um |
| **Dependências** | Dependências externas necessárias |
| **Checklist** | Lista de tarefas resumindo tudo que deve ser feito |

> **Regra de ouro:** Se não está no plan, a IA não pode mexer. Isso resolve o problema da "desobediência" — se você especifica exatamente quais arquivos mexer, a IA não tem como mexer em arquivos errados.

**Entregável:** Arquivo `plans/00X-*.md` para cada issue
**Aprovação:** ✅ Usuário revisa antes de prosseguir

---

### Fase 4: EXECUTE (uma issue por vez)

Implementar o planejamento da issue. Durante a execução:

- Usar **agentes e skills especializados por camada** (ex: agente de banco de dados, agente de frontend, agente de componentes)
- Seguir os **documentos de apoio** (Architecture, Design System)
- Implementar **APENAS** o que está no plan — nada além

**Entregável:** Código implementado + diff
**Aprovação:** ✅ Usuário testa e confirma

---

## 4. Documentos de Apoio

| Documento | Propósito |
|---|---|
| **Architecture** (`ARCHITECTURE.md`) | Organização do projeto, padrões de isolamento, regra thin client/fat server |
| **Design System** (`DESIGN_SYSTEM.md`) | Tokens de cor, tipografia, componentes visuais, regras de UI |
| **Spec** (`spec.md`) | Especificação completa de páginas, componentes e comportamentos |
| **Issues** (`issues/`) | Tarefinhas atômicas derivadas do Spec |
| **Plans** (`plans/`) | Planejamento detalhado de cada issue |

> Esses documentos dizem para a IA como o projeto está organizado, onde estão as coisas, onde ela deve buscar coisas — para ela não fazer besteira e não criar bagunça.

---

## 5. Princípios Fundamentais

1. **Nunca dar uma tarefa grande demais.** Sempre quebrar em tarefinhas. Janela de contexto limpa = melhor performance do modelo.
2. **Nunca deixar a IA adivinhar.** Dizer exatamente quais arquivos criar/modificar.
3. **Sempre pesquisar antes de implementar.** Evitar código duplicado e reinvenção de roda.
4. **Isolamento de comportamentos.** Cada funcionalidade fica na sua "pastinha" — mexer numa coisa não pode quebrar outra.
5. **Thin Client, Fat Server.** Frontend só captura intenções do usuário e renderiza respostas. Toda lógica fica no backend. Nenhuma chave ou segredo no frontend.
6. **Se não está no plan, não mexe.** A documentação é a lei.

---

## 6. Aplicação neste Projeto (Locações São Bento)

| Fase | Status | Documento |
|---|---|---|
| Spec | ✅ Completo | `spec.md` — 11 requisitos extraídos da transcrição da reunião |
| Break | ⏳ Aguardando aprovação do Spec | `issues/` — será criado após aprovação |
| Plan | ⏳ Após Break | `plans/` — um por issue |
| Execute | ⏳ Após Plan | Código — uma issue por vez |

**Origem dos requisitos:** Transcrição completa da reunião de 26/03/2026 (Pedro Lima, Rafael Barbosa, Lucas Pires).
**Design System:** `DESIGN_SYSTEM.md v1.5.0` — Zero Shadow, Tokens HSL, Mobile-First, Hyper-Rounded.
