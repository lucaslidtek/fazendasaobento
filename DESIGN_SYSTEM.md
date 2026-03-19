# Design System — Fazenda São Bento
**Versão 1.0 · Março 2026**

---

## 1. Visão Geral

O Design System da Fazenda São Bento é a fonte única de verdade para toda a interface do ERP agrícola. Ele garante consistência visual, padroniza componentes reutilizáveis e define as regras de comportamento da UI nos contextos desktop e mobile.

**Princípios de design:**
- **Mobile-first nativo** — o mobile não é uma versão reduzida do desktop; tem identidade própria com bottom nav, FABs, cards e sheets.
- **Clareza sobre sofisticação** — dados operacionais críticos (volumes, status, alertas) devem ser imediatamente legíveis.
- **Consistência sistêmica** — nenhuma cor, espaçamento ou fonte é aplicada de forma ad hoc. Tudo parte de tokens.
- **Hierarquia de toque** — todos os alvos interativos têm no mínimo 44×44 px em mobile.

---

## 2. Paleta de Cores

Todas as cores são definidas como variáveis CSS em `src/index.css` e nunca como classes Tailwind hardcoded (ex.: `text-emerald-600`).

### 2.1 Cores de Marca

| Token | Valor (HSL) | Uso |
|---|---|---|
| `--primary` | 103 57% 17% | Verde escuro — ações primárias, botões CTA, logo |
| `--primary-foreground` | 0 0% 98% | Texto sobre fundo primary |
| `--secondary` | 28 83% 52% | Laranja âmbar — destaque, ícones de aviso leve, acento |
| `--secondary-foreground` | 0 0% 10% | Texto sobre fundo secondary |

### 2.2 Cores Semânticas (Tokens de Status)

Criados como variáveis CSS personalizadas para uso em badges, alertas e indicadores operacionais.

```css
/* Sucesso (colheita normal, estoque ok, máquina ativa) */
--success:           103 57% 28%;
--success-subtle:    103 57% 94%;
--success-text:      103 52% 24%;

/* Aviso (manutenção, atenção) */
--warning:           38 92% 50%;
--warning-subtle:    38 92% 95%;
--warning-text:      38 76% 34%;

/* Informação (itens neutros, transporte) */
--info:              217 91% 60%;
--info-subtle:       217 91% 95%;
--info-text:         217 79% 40%;
```

**Regra de uso:**
- `bg-[hsl(var(--success-subtle))]` + `text-[hsl(var(--success-text))]` → badge de status positivo
- `bg-[hsl(var(--warning-subtle))]` + `text-[hsl(var(--warning-text))]` → banner de aviso
- `bg-destructive/10` + `text-destructive` → erro, estoque crítico, exclusão

### 2.3 Cores de Interface (shadcn/ui)

| Token | Modo Claro | Uso |
|---|---|---|
| `--background` | 60 9% 96% | Fundo da aplicação (bege arenoso) |
| `--card` | 0 0% 100% | Superfície de cards e modais |
| `--border` | 214 32% 91% | Bordas padrão |
| `--muted` | 60 5% 92% | Fundo de seções secundárias, hover states |
| `--muted-foreground` | 215 16% 47% | Textos secundários, labels, placeholders |
| `--foreground` | 222 47% 11% | Texto principal |
| `--destructive` | 0 72% 51% | Erro, perigo, exclusão |

---

## 3. Tipografia

### 3.1 Fontes

Importadas via Google Fonts e definidas em `index.css`:

```css
--font-display: 'Outfit', sans-serif;   /* Títulos, headings, marca */
--font-sans:    'DM Sans', sans-serif;  /* Corpo, labels, dados */
--font-mono:    'JetBrains Mono', monospace; /* Placas, volumes, códigos */
```

### 3.2 Escala de Tamanhos

| Classe | Tamanho | Fonte | Uso |
|---|---|---|---|
| `text-3xl font-bold font-display` | 30px | Outfit Bold | Títulos de página (desktop) |
| `text-2xl font-bold font-display` | 24px | Outfit Bold | Títulos de seção, login |
| `text-xl font-bold` | 20px | DM Sans Bold | Subtítulos, cabeçalhos de modal |
| `text-base font-bold` | 16px | DM Sans Bold | Nome de item em card mobile |
| `text-sm` | 14px | DM Sans | Texto de tabela, formulários |
| `text-xs font-semibold uppercase tracking-wide` | 12px | DM Sans SemiBold | Labels de formulário, cabeçalhos de coluna |
| `font-mono` | variável | JetBrains Mono | Placas, volumes, totais numéricos |

---

## 4. Espaçamento e Layout

### 4.1 Grid e Containers

- **Desktop:** layout com sidebar fixa à esquerda (colapsável via shadcn Sidebar) + área de conteúdo com padding `p-6 lg:p-8`
- **Mobile:** layout sem sidebar + bottom nav fixa + conteúdo com `pb-24` para não sobrepor a barra

### 4.2 Raios de Borda (Border Radius)

| Elemento | Classe | Valor |
|---|---|---|
| Cards de dados | `rounded-2xl` | 16px |
| Botões, inputs | `rounded-xl` | 12px |
| Badges | `rounded-full` | 9999px |
| Modais, sheets | `rounded-2xl` (Dialog) / `rounded-t-3xl` (Sheet) | 16px / 24px |
| Bottom sheet drag handle | `rounded-full` | 9999px |
| Ícones em fundo colorido | `rounded-xl` | 12px |

### 4.3 Sombras

| Situação | Classe |
|---|---|
| FAB (Floating Action Button) | `shadow-lg` |
| Cards no hover | sem sombra, usa `bg-muted/30` |
| Modal/Dialog | sombra padrão shadcn |

---

## 5. Componentes

### 5.1 Botões

```tsx
/* Primário (ação principal) */
<Button className="h-10 px-5">Salvar</Button>          /* desktop */
<Button className="h-12 w-full font-bold">Salvar</Button> /* mobile forms */

/* Secundário / outline */
<Button variant="outline" className="h-10">Cancelar</Button>

/* Destrutivo */
<Button variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-full w-8 h-8">
  <Trash2 />
</Button>

/* Ghost com ícone */
<Button variant="ghost" size="icon" className="rounded-full">
  <MoreHorizontal />
</Button>
```

**Regras:**
- Mobile: altura mínima `h-12` para touch targets adequados
- Desktop: `h-10` é suficiente
- Nunca usar `bg-blue-600` ou similares — usar `variant` ou `className` com variáveis CSS
- Botões secondary/outline usam fundo branco (`bg-white`) e borda suave (`border-border/50`), sem sombra e não devem ser transparentes.

### 5.2 FAB (Floating Action Button)

Substitui o botão "Adicionar" do header em mobile. Sempre posicionado `bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40` para ficar acima da bottom nav.

```tsx
<button
  onClick={() => setIsOpen(true)}
  className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
>
  <Plus className="w-6 h-6" />
</button>
```

Quando há dois FABs na mesma tela (ex.: Estoque tem "Movimentar" + "Novo Produto"), o principal fica em `right-4` e o secundário em `right-20`, com tamanho menor (`w-12 h-12`) e estilo outline.

### 5.3 Cards Mobile

Padrão usado em todas as listagens mobile (`sm:hidden`):

```tsx
<div className="bg-card rounded-2xl border p-4 touch-card">
  {/* Conteúdo organizado em flex row */}
  <div className="flex items-start justify-between gap-3">
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground font-medium mb-0.5">Metadado</p>
      <p className="font-bold text-foreground text-base leading-tight truncate">Título</p>
      <p className="text-sm text-muted-foreground mt-0.5">Subtítulo</p>
    </div>
    <div className="flex flex-col items-end gap-1">
      {/* Valor numérico principal, ações */}
    </div>
  </div>
</div>
```

A classe `touch-card` (definida em `index.css`) aplica `active:scale-[0.98]` e `transition-transform` para feedback tátil.

### 5.4 Formulários

**Desktop:** `<Dialog>` com `sm:max-w-[400-500px]`  
**Mobile:** `<Sheet side="bottom">` com `rounded-t-3xl`

```tsx
<SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8 max-h-[92vh] overflow-y-auto">
  <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" /> {/* Drag handle */}
  <SheetHeader className="text-left mb-4">
    <SheetTitle className="text-lg">Título do Form</SheetTitle>
  </SheetHeader>
  {/* Form content */}
</SheetContent>
```

**Labels:** sempre `text-xs font-bold text-muted-foreground uppercase tracking-wide`  
**Inputs:** `h-11` em mobile, `h-9` ou `h-10` em desktop  
**Botões de ação no form:** `flex gap-3` com cada botão `flex-1`

### 5.5 Tabelas (Desktop)

```tsx
<div className="hidden sm:block bg-card rounded-2xl border overflow-hidden">
  <Table>
    <TableHeader className="bg-muted/40">
      <TableRow>
        <TableHead>Coluna</TableHead>
        {/* Última coluna de ações: w-[52px] sem header */}
        <TableHead className="w-[52px]" />
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => navigate(`/detalhes/1`)}>
        {/*
          IMPORTANTE: Não usar ícone "Olho" para Detalhes. A linha deve ser inteira clicável (cursor-pointer).
          Colocar `onClick={(e) => e.stopPropagation()}` na `TableCell` de ações para não disparar navegação ao editar/excluir.
        */}
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon"><MoreHorizontal/></Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

### 5.6 Badges de Status

```tsx
/* Positivo / OK */
<Badge variant="outline" className="bg-[hsl(var(--success-subtle))] text-[hsl(var(--success-text))] border-[hsl(var(--success)/0.2)]">
  Normal
</Badge>

/* Aviso */
<Badge variant="outline" className="bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning)/0.2)]">
  Manutenção
</Badge>

/* Crítico / Erro */
<Badge variant="destructive">Crítico</Badge>

/* Admin */
<Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
  <ShieldAlert className="w-3 h-3 mr-1" /> Admin
</Badge>

/* Operador */
<Badge variant="outline" className="bg-[hsl(var(--info-subtle))] text-[hsl(var(--info-text))] border-[hsl(var(--info)/0.2)]">
  Operador
</Badge>
```

### 5.7 Indicadores de Status com Ponto

Para listas mobile onde o badge seria pesado demais:

```tsx
<div className="flex items-center gap-2">
  <div className={`w-2 h-2 rounded-full ${dot}`} />
  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
    {label}
  </span>
</div>
```

---

## 6. Navegação

### 6.1 Sidebar (Desktop — `sm` e acima)

- Usa shadcn `<Sidebar>` com `collapsible="icon"`
- Trigger (`<SidebarTrigger>`) visível apenas no desktop
- 4 módulos principais + separador + 4 módulos de administração/configuração
- Itens de admin aparentes apenas para `user.role === 'admin'`

### 6.2 Bottom Nav (Mobile — abaixo de `sm`)

Arquivo: `src/components/layout/MobileBottomNav.tsx`

4 tabs fixas na barra: **Início**, **Colheita**, **Transporte**, **Máquinas**  
1 botão **Mais** → abre `<Sheet side="bottom">` com lista de módulos secundários:

| Módulo | Ícone | Rota |
|---|---|---|
| Abastecimento | Fuel | `/abastecimento` |
| Estoque | Package | `/estoque` |
| Caminhões | Truck | `/caminhoes` |
| Usuários | Users | `/usuarios` |

**Posicionamento:** `fixed bottom-0 left-0 right-0 z-50`  
**Altura:** `h-16` + `pb-safe` para safe area no iOS  
**Indicador ativo:** barra verde no topo do item + ícone preenchido

### 6.3 Header

**Desktop:** título da fazenda + botão de toggle da sidebar + breadcrumbs de página  
**Mobile:** logo pequena + nome da página atual (centrado) + sem trigger de sidebar

---

## 7. Padrões de Página

Cada página operacional segue esta estrutura dual:

```
src/pages/[modulo].tsx
├── <AppLayout>
│   ├── Header (desktop e mobile): título com contagem (ex: "Colheita (6)") + descrição + botão primário (Dialog). O ícone do título deve ter a classe `hidden sm:block` para não aparecer no celular.
│   ├── [hidden sm:block] Tabela desktop
│   ├── [sm:hidden] Cards mobile (sem string lateral de "X registros" repetida)
│   └── [sm:hidden] FAB + Sheet (formulário mobile)
```

**Conteúdo condicional:**
- `hidden sm:block` → visível apenas no desktop
- `sm:hidden` → visível apenas no mobile

---

## 8. Páginas de Autenticação

Todas as páginas de auth (Login, Registro, Recuperar Senha) compartilham o mesmo layout split:

**Desktop:** painel esquerdo com gradiente escuro + logo + marca / painel direito com formulário  
**Mobile:** cabeçalho com gradiente (logo + nome) + curva branca de transição + formulário abaixo

### Gradiente padrão de autenticação:
```css
background: linear-gradient(160deg, hsl(103,57%,12%) 0%, hsl(103,52%,19%) 100%);
```

### Textura de fundo (padrão hatching):
```css
background-image: url("data:image/svg+xml,...") /* grid diagonal */
opacity: 0.04
```

---

## 9. Animações

Usamos **Framer Motion** para animações de entrada e transições de UI.

| Situação | Configuração |
|---|---|
| Entrada de página | `initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} duration: 0.4` |
| Logo / imagem | `initial={{ scale: 0.88 }} animate={{ scale:1 }} ease:[0.22,1,0.36,1]` |
| Acento decorativo (barra) | `initial={{ scaleX:0 }} animate={{ scaleX:1 }} delay: 0.45` |
| Form expansível | `AnimatePresence` + `height: 0 → auto` |
| Ícone chevron de toggle | `animate={{ rotate: open ? 180 : 0 }}` |

**Easing padrão para entradas:** `[0.22, 1, 0.36, 1]` (ease-out spring-like)

---

## 10. Ícones

Biblioteca: **Lucide React**

| Módulo | Ícone | Cor |
|---|---|---|
| Dashboard | `LayoutDashboard` | `text-primary` |
| Colheita | `Wheat` | `text-primary` |
| Transporte | `Truck` | `text-[hsl(var(--info))]` |
| Máquinas | `Tractor` | `text-muted-foreground` |
| Abastecimento | `Fuel` | `text-muted-foreground` |
| Estoque | `Package` | `text-secondary` |
| Usuários | `Users` | `text-primary` |
| Caminhões | `Truck` | `text-[hsl(var(--info))]` |
| Sucesso / entrada | `ArrowDownRight` | `text-[hsl(var(--success-text))]` |
| Saída / risco | `ArrowUpRight` | `text-destructive` |
| Alerta crítico | `AlertTriangle` | `text-destructive` |
| Admin | `ShieldAlert` | `text-primary` |
| Diesel | `Droplets` | `text-[hsl(var(--info))]` |

**Tamanhos padrão:**
- `w-4 h-4` — ícones inline em textos e botões compactos
- `w-5 h-5` — ícones em botões padrão
- `w-6 h-6` — ícones no FAB
- `w-7 h-7` — ícones em títulos de página (desktop)
- `w-8 h-8` — loading spinner

---

## 11. Estados de Loading e Vazio

### Loading
```tsx
<div className="p-8 flex justify-center">
  <Loader2 className="w-8 h-8 text-primary animate-spin" />
</div>
```

### Lista vazia
```tsx
<div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground text-sm">
  Nenhum registro encontrado.
</div>
```

---

## 12. Utilidades CSS Customizadas

Definidas em `src/index.css`:

```css
.touch-card {
  transition: transform 0.1s ease;
  &:active { transform: scale(0.98); }
}

.pb-safe {
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}

.font-display { font-family: var(--font-display); }
.font-mono    { font-family: var(--font-mono); }
```

---

## 13. Checklist de Consistência

Antes de adicionar qualquer novo componente ou página, verifique:

- [ ] Nenhuma cor Tailwind hardcoded (`text-blue-600`, `bg-emerald-500`) — usar variáveis CSS
- [ ] Página tem versão mobile (cards `sm:hidden`) e desktop (tabela `hidden sm:block`)
- [ ] **Formulários Mobile (Bottom Sheets):** TODOS os formulários na visão mobile (tanto para adicionar quanto para editar itens), incluindo aqueles dentro de páginas de detalhes (ex: Detalhes de Máquina, Detalhes de Estoque, Meu Perfil), **OBRIGATORIAMENTE** devem abrir usando o componente `<Sheet>` com `side="bottom"` e `className="rounded-t-3xl"`. Nunca utilize `<Dialog>` para formulários em telas de celular.
- [ ] Campos de formulário (Inputs, Selects, Textareas) devem ter estilo "flat" (sem sombras/`shadow-sm`), apenas com `border` leve (já padronizado nos componentes base).
- [ ] Ações na listagem desktop **OBRIGATORIAMENTE** devem seguir a ordem `[Exportar] [Filtros] [Nova Entidade]` (exatamente nesta ordem, da esquerda para a direita). Os dois primeiros com `variant="outline"` e ícone à esquerda; o de adição com variante padrão (cor de fundo e texto branco) e ícone de `Plus`. Textos: "Exportar", "Filtros", "Nova [Colheita, etc]". Sem prefixo "(2)" no texto principal do botão.
- [ ] **Ações na listagem Mobile:** Os botões auxiliares na visão de celular (Filtros e Exportar) devem ser renderizados utilizando o componente compartilhado `<MobileListControls />`. **ATENÇÃO:** A cor da borda de botões secundários e filtros (`variant="outline"`) **OBRIGATORIAMENTE** tem que ser exata e idêntica à borda dos cards de listagem de celular (usando `border-border`, sem qualquer opacidade/clareamento). O próprio arquivo `button.tsx` já foi ajustado para remover `border-border/50`, garantindo a cor unificada.
- [ ] **Títulos de Listagem:** Devem sempre estar visíveis no mobile (o container `<div className="flex...">` ao redor do `h1` deve fluir sem o uso de `hidden sm:block`). O título deve incorporar a contagem dinamicamente (ex: `Título (6)`) e o ícone nativo ao lado do texto deve ter `hidden sm:block` para desaparecer nas telas pequenas. A contagem subindo para o header elimina a necessidade do hint inline "X registros" no topo da listagem de cards.
- [ ] **Top Navbar Mobile (MobileHeader):** 
  - Cor de fundo **OBRIGATORIAMENTE** igual à da Sidebar (`bg-sidebar`), sem borda divisória na base.
  - Textos de título e botões de aba/hambúrguer devem usar tons claros da sidebar (`text-sidebar-foreground` e `text-sidebar-foreground/80`).
- [ ] **Tab Bar Responsiva (MobileBottomNav):** 
  - Deve SEMPRE ter fundo branco (`bg-white`) garantindo espaçamento base com `style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}`.
  - A tab **Ativa** deve possuir um fundo (ex: `bg-primary/12`) com bordas arredondadas (ex: `rounded-2xl`) que engloba **TUDO** (tanto o ícone quanto o texto), parecendo um botão completo e largo em formato visual de pílula (`h-[3.5rem] w-full max-w-[4.5rem]`). Letras e ícone ativos ficam coloridos (`text-primary`).
- [ ] O contêiner principal de rolagem (`AppLayout.tsx`) deve utilizar `pb-[calc(6rem+env(safe-area-inset-bottom))]` no mobile para que as listas terminem sempre acima da nova Tab Bar estendida.
- [ ] Listagens padrão em todas as telas **DEVEM** usar a dupla: `<div className="hidden md:block"><Table/></div>` e `<div className="md:hidden space-y-4">...cards...</div>` para garantir responsividade perfeita no celular. Tabelas nunca devem ser espremidas na vertical sem adaptação.
- [ ] FAB posicionado em `bottom-[calc(5.5rem+env(safe-area-inset-bottom))]` OBRIGATORIAMENTE para flutuar de forma responsiva acima da bottom nav. Os botões inline de listagem (como `Novo Abastecimento` ou `Novas Movimentações`) DEVEM ser escondidos no mobile (`hidden md:flex`) deixando o FAB como substituto exclusivo para adições pelo telefone.
- [ ] Listas e Tabelas que levam a detalhamento de páginas têm as linhas (desktop) ou cards (mobile) 100% clicáveis (`cursor-pointer`). Não usar ícones isolados de "Visão"/"Olho". Usar `e.stopPropagation()` nas ações independentes (Editar/Excluir).
- [ ] Abas de detalhes virtuais ou perfis que exibem listagens já existentes no ERP (ex: Histórico de Colheita, Transporte) DEVEM reaproveitar a exata mesma estrutura visual das telas de origem correspondentes (Tabela padrão no Desktop, Cards flutuantes responsivos no Mobile).
- [ ] Inputs de formulário com `h-11` em mobile
- [ ] Botões com `h-12 w-full` em forms mobile
- [ ] Labels de formulário seguem: `text-xs font-bold text-muted-foreground uppercase tracking-wide`
- [ ] Cards mobile com `bg-card rounded-2xl border p-4 touch-card`
- [ ] Badges de status usando variáveis semânticas (`--success`, `--warning`, etc.) e bordas com opacidade suave na cor correspondente (ex: `border-[hsl(var(--success)/0.2)]`), evitando bordas puramente neutras/chamativas.
- [ ] Entidades categóricas iterativas (como Culturas e Serviços) devem ser renderizadas como Badges usando `getCultureBadgeStyle` ou `getServiceBadgeStyle` de `colors.ts` para consistência visual.
- [ ] Tags de histórico (compra, aplicação, etc.) seguem o padrão das badges de status (`bg-success-subtle / text-success-text` para positivos, `bg-destructive / text-destructive` para negativos) com bordas suaves referentes à respectiva cor.
- [ ] Fontes tipográficas via variável: `font-display` para títulos, body padrão para texto
- [ ] Ícones em tamanhos padronizados conforme tabela da seção 10

---

*Fazenda São Bento ERP — Documento gerado em Março de 2026*
