# Arquitetura do Projeto: Fazenda São Bento

Esta documentação serve como referência estrita para a evolução do sistema em conformidade com o design system atual e as melhores práticas propostas na restruturação 2026.

## 1. Organização por Comportamento (Feature-Based)

Novas funcionalidades não devem ser criadas como arquivos soltos gigantes (ex: `src/pages/relatorios.tsx` contendo toda a lógica e 3 componentes). Em vez disso, o projeto adotará a arquitetura de **Isolamento por Comportamento**.
A lógica, UI e tipagens de uma funcionalidade específica residem na mesma pasta:

- O código é agrupado no diretório `src/features/`.
- Cada feature tem sua própria subpasta com um nome representativo da área. (Ex: `src/features/financeiro/`, `src/features/atividades/`).
- Dentro da pasta da feature, devem estar:
  - `page.tsx`: o entrypoint da rota
  - Módulos ou subcomponentes (ex: `components/FormularioAtividade.tsx`, `components/InsumosTable.tsx`)
  - Outros utilitários relativos àquele comportamento.

### Estrutura Base (Exemplo):
```
src/
  features/
    financeiro/
      components/
        ReceitasTable.tsx
        DespesasTable.tsx
        AccountManagerModal.tsx
      page.tsx
```

### Por que Isolamento por Comportamento?
Se houver um bug em "Atividades" nos cálculos da sub-tabela de recursos, corrigir aquele arquivo isolado dentro da pasta de "Atividades" possui chance praticamente nula de vazar e afetar o comportamento de "Colheita".

## 2. Padrão Thin Client / Fat Server

- **Thin Client**: O front-end (esta base de código React) atua predominantemente na **captura de intenções do usuário**, organização da exibição gráfica e transição de telas.
- **Fat Server**: A inteligência complexa de negócios e permissões residem no backend.
- Como lidamos com dados? Usamos os hooks disponíveis na SDK interna `@workspace/api-client-react`, passando parâmetros necessários. Não inclua lógica rígida de manipulação ou chaves sensíveis espalhadas no código front-end. O front-end reage aos formatos do backend e invoca as mutações.

## 3. Diretrizes de Execução (AI Guidelines)

1. **Pesquise antes de fazer**: Nunca reinvente do zero o que já foi abstraído na lib (ex. use `MobileListControls`, Tabs do Shadcn, BarChart/PieChart usando `recharts` através do provider `ChartContainer`).
2. **Atualização do `App.tsx`**: Quando um novo entrypoint (ex: `src/features/atividades/page.tsx`) for criado, a rota será exposta via `App.tsx` importando `import Atividades from "@/features/atividades/page"`.
3. **Padrão Gradual**: Páginas legadas antigas em `src/pages` ficarão lá temporariamente. As novas demandas já seguirão o novo padrão.
