# 005 — Exportar PDF Formatado da Colheita (Estilo Relatório do Silo)

**Módulo:** Colheita
**Regras:** RN-025, RN-027
**Prioridade:** 🟡 Média
**Depende de:** Nenhuma (pode ser feita em paralelo)

---

## Descrição

Criar uma exportação em **PDF formatado** dos registros de colheita, no estilo do relatório que o silo envia para o celular do Júnior.

Conforme Vídeo 1: o relatório contém uma tabela simples com cada caminhão como uma linha, mostrando: Data, Peso Entrada, Umidade (%), Impureza (%), Peso Líquido, Motorista, Placa do Caminhão.

### Requisitos do PDF
- **Filtrável por cultura** (RN-025: "relatório de milho", "relatório de soja")
- Título dinâmico: "Relatório de Colheita — [Cultura] — Safra [X]"
- Tabela com os campos acima
- Totalizadores no rodapé: Total Peso Bruto, Total Peso Líquido, Total Sacas, Produtividade Média
- Layout limpo e profissional para impressão

---

## Cenários

- **Happy path:** Filtro "Soja", safra 2025/2026 → PDF com todos os registros de soja
- **Edge case:** Sem registros → PDF com mensagem "Nenhum registro encontrado"
- **Edge case:** Registro sem peso → exibir "—"

---

## Checklist

- [ ] Criar template de impressão/PDF para colheita
- [ ] Implementar filtro por cultura na geração
- [ ] Adicionar totalizadores no rodapé
- [ ] Botão "Exportar PDF" na tela de Colheita (já existe "Imprimir PDF" — melhorar)
- [ ] Testar geração em diferentes quantidades de registros
