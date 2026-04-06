# 009 — Padronizar Campo `cultures` nos Harvests

**Módulo:** Global (dados + telas)
**Prioridade:** 🟢 Baixa
**Depende de:** Nenhuma

---

## Descrição

`DEMO_HARVESTS` usa `cultures: ["soja"]` (array), mas 4 telas acessam `h.culture` (singular, que não existe), causando badges vazias e potencial crash em `cultura-detalhes.tsx`.

### Telas afetadas

| Arquivo | Campo acessado | Corrigir para |
|---|---|---|
| `maquina-detalhes.tsx:580` | `h.culture` | `h.cultures?.join(", ")` |
| `talhoes/detalhes.tsx:438,463` | `h.culture` | `h.cultures?.join(", ")` |
| `cultura-detalhes.tsx:117` | `h.culture.toLowerCase()` | Filtrar via `h.cultures.some(...)` |
| `usuario-detalhes.tsx:533,578` | Fallback OK | Manter |

---

## Checklist

- [ ] Corrigir `maquina-detalhes.tsx` para usar `h.cultures`
- [ ] Corrigir `talhoes/detalhes.tsx` para usar `h.cultures`
- [ ] Corrigir `cultura-detalhes.tsx` para filtrar pelo array `cultures`
- [ ] Testar que badges de cultura aparecem nas 3 telas
