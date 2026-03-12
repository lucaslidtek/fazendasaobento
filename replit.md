# Fazenda São Bento — Sistema de Gestão Agrícola

## Overview

ERP agrícola interno para a Fazenda São Bento. Substitui planilhas operacionais com um sistema web centralizado.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Auth**: JWT (bcryptjs + jsonwebtoken)
- **Routing**: Wouter

## Default Admin Account

- Email: `admin@fazendas.bento`
- Password: `admin123`

Run seed: `pnpm --filter @workspace/scripts run seed`

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (auth, all modules)
│   └── fazenda-sao-bento/  # React frontend (all pages + components)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Admin user seeding script
```

## Modules

1. **Colheita** — Registro de colheita (soja, feijão, milho) com produtividade automática
2. **Transporte** — Controle de caminhões e fretes
3. **Máquinas** — Cadastro de tratores, colheitadeiras, equipamentos
4. **Abastecimento** — Registro de diesel por máquina
5. **Estoque de Insumos** — Produtos com entradas/saídas e controle de estoque mínimo
6. **Dashboard** — KPIs, gráficos de colheita por cultura e consumo de diesel

## API Routes

All routes require JWT authentication (Bearer token in header).

- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Register
- `GET /api/auth/me` — Current user
- `GET/POST /api/machines` — Machines CRUD
- `GET/POST /api/trucks` — Trucks CRUD
- `GET/POST /api/harvest` — Harvest records CRUD
- `GET/POST /api/transport` — Transport records CRUD
- `GET/POST /api/fueling` — Fueling records CRUD
- `GET/POST /api/products` — Products CRUD
- `GET/POST /api/stock-movements` — Stock movements (validates stock ≥ 0)
- `GET /api/dashboard/summary` — Dashboard aggregated stats
- `GET/POST/PUT/DELETE /api/users` — User management (admin only)

## Business Rules

- Abastecimento must be linked to a machine
- Colheita must be linked to a culture (soja/feijão/milho)
- Stock cannot go negative (enforced server-side)
- Admin role can manage users; Operador role can register operations
- Produtividade (sc/ha) is auto-calculated from sacas / hectares

## DB Schema Tables

- `users` — Auth users with role (admin/operador)
- `machines` — Farm equipment and machinery
- `trucks` — Trucks fleet
- `harvest` — Harvest records
- `transport` — Transport/freight records
- `fueling` — Diesel fueling records
- `products` — Input products inventory
- `stock_movements` — Stock entry/exit movements
