# SENSORS.md
> Sensores são comandos que retornam 0 (passou) ou 1 (falhou).
> O agente nunca julga se o código está bom. Os sensores julgam.
> **Rode todos os sensores antes de marcar qualquer tarefa como concluída.**

---

## Regra de Ouro

> Se um sensor falha, a tarefa **não está concluída**. Não há exceções.
> Corrija o erro, rode os sensores novamente, só então marque como feito.

---

## Sensores Obrigatórios

### 1. Type Check
```bash
npx tsc --noEmit
```
**Quando rodar:** Após qualquer alteração em arquivos `.ts` ou `.tsx`
**Passa se:** Sem erros de tipo
**Falha se:** Qualquer erro de tipo

---

### 2. Build
```bash
npm run build
```
**Quando rodar:** Ao final de cada tarefa e ao final de cada sprint
**Passa se:** Build Vite completa sem erros
**Falha se:** Qualquer erro de compilação

---

### 3. Dev Server
```bash
npm run dev
```
**Quando rodar:** Ao final de cada tarefa, verificar que o app roda
**Passa se:** App carrega no navegador sem erros no console
**Falha se:** Crash na inicialização ou erros de runtime no console

---

### 4. Validação Visual (Manual)
**Quando rodar:** Ao final de cada tarefa que altera UI
**Passa se:**
- Desktop: Tabela/formulário renderiza correto em tela > 640px
- Mobile: Cards/Sheet renderiza correto em tela < 640px
- Não há overflow horizontal, texto cortado ou elementos sobrepostos
- Filtro global de safra funciona na tela alterada
**Falha se:** Qualquer quebra visual

---

## Sensores por Tipo de Tarefa

| Tipo de tarefa | Sensores obrigatórios |
|---|---|
| Bug fix | type-check + build + verificação visual |
| Novo componente UI | type-check + build + verificação visual |
| Nova feature/integração | type-check + build + dev server + verificação visual |
| Feature completa (fim de sprint) | **todos os sensores** |

---

## Sensor de Saúde Rápida

> Rode este comando para verificar tudo de uma vez:

```bash
npx tsc --noEmit && npm run build
```

---

## Interpretando Resultados

### Exit code 0 = sensor passou
```bash
echo $?  # deve retornar 0
```

### Exit code 1+ = sensor falhou
- Não avance para o próximo item
- Copie o erro completo
- Corrija antes de continuar
- Se não conseguir corrigir em 2 tentativas, documente em `PROGRESS.md` > Bloqueios

---

## Adicionando Novos Sensores

Quando o projeto evoluir (backend, testes, etc.), adicione sensores aqui:

```markdown
### [N]. [Nome do Sensor]
```bash
[comando]
```
**Quando rodar:** [condição]
**Passa se:** [critério]
**Falha se:** [critério]
```
