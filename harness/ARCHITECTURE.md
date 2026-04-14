# ARCHITECTURE.md
> Decisões de arquitetura, padrões obrigatórios e anti-padrões proibidos.
> O agente implementador deve consultar este arquivo antes de criar qualquer arquivo ou estrutura.

---

## Estrutura de Pastas

```
src/
├── App.tsx               # Router principal (Wouter)
├── main.tsx              # Entry point React
├── index.css             # Design tokens + utilities TailwindCSS
├── components/
│   ├── ui/               # ShadCN base components (Button, Input, Dialog, etc.)
│   ├── layout/           # AppLayout (sidebar + topbar + mobile nav)
│   └── dashboard/        # Widgets do dashboard
├── contexts/
│   └── FarmContext.tsx    # Filtro global de Safra + Talhão (Provider + hook)
├── features/             # Módulos de domínio (feature folders)
│   ├── colheita/         # Registro de Colheita + Transporte + Silos
│   │   └── page.tsx      # Tela principal com tabela desktop + cards mobile
│   ├── estoque/          # Estoque de Insumos
│   │   ├── page.tsx      # Lista de produtos
│   │   └── detalhes.tsx  # Movimentações do produto
│   ├── financeiro/       # Gestão Financeira centralizada
│   │   └── page.tsx      # Lançamentos + Contas bancárias
│   ├── atividades/       # Atividades de campo
│   │   └── page.tsx      # Registro de operações agrícolas
│   ├── relatorios/       # Relatórios Inteligentes
│   │   └── page.tsx      # Charts + análises
│   └── talhoes/          # Gestão de Talhões
│       ├── page.tsx
│       └── detalhes.tsx
├── pages/                # Páginas de cadastro/admin (padrão antigo)
│   ├── dashboard.tsx
│   ├── login.tsx
│   ├── maquinas.tsx / maquina-detalhes.tsx
│   ├── caminhoes.tsx / caminhao-detalhes.tsx
│   ├── culturas.tsx / cultura-detalhes.tsx
│   ├── abastecimento.tsx
│   ├── safras.tsx / safra-detalhes.tsx
│   └── usuarios.tsx / usuario-detalhes.tsx
├── hooks/                # Custom hooks (useToast, etc.)
├── lib/                  # Utilitários, configs, demo data
│   ├── demo-data.ts      # DADOS MOCK — fonte principal para protótipo
│   ├── auth.ts           # AuthProvider (bypass para protótipo)
│   ├── colors.ts         # Badge styles por cultura
│   ├── api-crops.ts      # Fetch de culturas
│   ├── brazilian-banks.ts # Lista de bancos brasileiros
│   └── utils.ts          # cn() e helpers
└── references/           # Assets de referência
```

---

## Padrões Obrigatórios

### Nomenclatura
- Arquivos de componentes: `PascalCase.tsx` (ex: `AppLayout.tsx`)
- Páginas e features: `kebab-case.tsx` (ex: `maquina-detalhes.tsx`) ou `page.tsx` dentro de feature folder
- Constantes: `UPPER_SNAKE_CASE` (ex: `DEMO_HARVESTS`)
- Variáveis e funções: `camelCase`
- Tipos/Interfaces: `PascalCase` (ex: `FinancialRecord`, `BankAccount`)

### Imports
- Use paths absolutos com `@/` para imports internos
- Nunca use `../../../` — configurado no `tsconfig.json` paths
- Exemplo: `import { Button } from "@/components/ui/button"`

### Componentes
- Prefira componentes funcionais com hooks
- Props sempre tipadas com `interface` ou `type`
- Formulários: `react-hook-form` + `zod` para validação
- Listas: **Tabela para desktop** (`hidden sm:block`), **Cards para mobile** (`sm:hidden`)
- Formulários grandes: **Dialog para desktop**, **Sheet (bottom) para mobile**
- FAB (Floating Action Button) para ação primária no mobile

### Estado e Data Fetching
- `TanStack Query` (`useQuery`, `useMutation`) para dados da API
- `FarmContext` para filtro global de safra/talhão
- `useState` + `useMemo` para estado local com dados mock
- Demo data em `src/lib/demo-data.ts` como fallback quando API não responde

### Design System
- Componentes base: **ShadCN/UI** customizados
- Bordas arredondadas: `rounded-2xl` (cards), `rounded-xl` (inputs), `rounded-3xl` (dialog)
- Cores de status via CSS variables: `--success-subtle`, `--warning-subtle`, `--info-subtle`
- Badges de cultura coloridas via `getCultureBadgeStyle()`
- Typography: `font-bold`, `font-black` para headers, `text-xs` / `text-[10px]` para labels
- Ícones: **Lucide React** exclusivamente
- Gráficos: **Recharts** (BarChart, PieChart, AreaChart)

### Tratamento de Erros
- Toast (`useToast`) para feedback de sucesso/erro
- `confirm()` nativo para confirmações destrutivas
- `try/catch` em mutations com toast de erro

---

## Anti-Padrões Proibidos

❌ **Nunca faça isso:**

- Input de texto livre onde existe um cadastro (usar Select/dropdown)
- Lógica de negócio complexa dentro de JSX — extraia para hooks ou funções helper
- `any` em TypeScript sem justificativa (usar tipos do demo-data ou definir interfaces)
- Ignorar o filtro global de safra em uma nova tela
- Criar formulários sem validação Zod
- Duplicar componentes de layout (usar `AppLayout` sempre)
- Quebrar responsividade (toda lista precisa de versão desktop + mobile)
- Cores hardcoded — usar CSS variables do design system
- `console.log` em código de produção

---

## Módulos e Fluxos de Dados

### Fluxo: Colheita → Silo
```
Registro de Colheita
  ├── Dados: cultura, talhão, sacas, peso líquido, umidade, impureza
  ├── Logística: caminhão (dropdown), destino/silo (dropdown)
  └── Efeito: soma peso líquido no estoque do silo destino
```

### Fluxo: Financeiro → Estoque de Insumos
```
Lançamento Financeiro (Despesa + Categoria "Combustível" ou "Insumos")
  ├── Status: "Pago"
  └── Efeito: entrada automática no estoque do produto correspondente
```

### Fluxo: Financeiro → Silo (Venda)
```
Lançamento Financeiro (Receita + Categoria "Vendas" + Silo de origem)
  └── Efeito: baixa automática no estoque do silo (peso líquido / sacas)
```

### Fluxo: Abastecimento → Estoque
```
Registro de Abastecimento (máquina + litros)
  └── Efeito: saída automática de combustível no estoque
```

### Fluxo: Atividade → Estoque
```
Registro de Atividade (insumos utilizados)
  └── Efeito: baixa automática de cada insumo no estoque
```

---

## Testes

**Framework:** Vite (sem testes configurados ainda — protótipo)
**Validação mínima:** Build completa sem erros (`npm run build`)
**Futuro:** Vitest + Testing Library quando backend for adicionado

---

## Variáveis de Ambiente

**Regra:** Toda variável nova deve ser adicionada ao `.env.example`.

```bash
# Nenhuma variável necessária para o protótipo (dados mock)
# Futuro:
# VITE_API_URL=         # URL da API backend
# VITE_SUPABASE_URL=    # Supabase project URL
# VITE_SUPABASE_KEY=    # Supabase anonymous key
```
