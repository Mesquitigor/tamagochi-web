<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

---

# Tamagotchi Web — padrões do projeto (sempre aplicar)

Documento único para contexto do repositório, armadilhas já vistas e como o mantenedor formula pedidos. **Ler em conjunto com as regras Next.js acima.**

## Projeto

- **Stack:** Next.js (versão do repo pode divergir do “Next clássico”; guias em `node_modules/next/dist/docs/`).
- **Backend / dados:** Supabase (Auth + Postgres + RLS). Esquema de referência: `supabase/schema.sql`.
- **Testes:** Vitest + Testing Library (unit/integration), Playwright (E2E). Comandos: `npm run test:run`, `npm run test:e2e`.
- **Idioma da UI:** prioridade **português** (PT) em textos voltados ao utilizador.

## Como formular pedidos (evitar retrabalho)

1. **Nomear o alvo com precisão**  
   - “Layout” pode significar `src/app/layout.tsx` **ou** o layout visual de um componente (ex.: `Device.tsx`).  
   - Preferir: *“alterar o `RootLayout` / metadata”* vs *“alterar o visual do ovo Tamagotchi no `Device.tsx`”*.

2. **Scope**  
   - Pedir mudanças **focadas**; evitar “refatora tudo” sem necessidade.

3. **Segredos**  
   - Não colar chaves reais de produção em chats públicos. Usar placeholders e `.env.local` local.  
   - Variáveis comuns: `NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY` (VAPID via `npx web-push generate-vapid-keys`).

4. **Notificações push**  
   - Sem **par VAPID** no servidor e cliente, subscrição / envio não funciona ou falha silenciosamente se não houver feedback na UI.  
   - Fluxo: permissão do browser → `sw.js` → `POST /api/push/subscribe` → na ação do pet, `evaluateNotificationTriggers` + `web-push` se houver subscrições.

5. **Ficheiros sensíveis**  
   - Evitar pedidos genéricos “atualiza todos os README” se a regra do utilizador for minimizar markdown não pedido.

## Motor de jogo (regras estáveis — evolução conservadora)

- **Prioridade:** não regredir jogabilidade; regras novas devem ser previsíveis e cobertas por testes em `tests/unit/engine.test.ts`.
- **`applyDecay`** devolve `{ pet, randomEventAlert }`. `reduceAction` também (após aplicar ação + decaimento). Código que só precisa do estado usa `.pet`.
- **`last_event_at`:** guarda o último “tick” do evento aleatório horário (`RANDOM_EVENT_INTERVAL_MS` em `src/lib/game/constants.ts`). **Na base Supabase** a coluna tem de existir: aplicar `supabase/migrations/20260402130000_add_last_event_at_to_pets.sql` (ou o bloco equivalente no fim de `schema.sql`). Enquanto a migração não corre, as rotas usam `petsPersist.ts` e repetem o `update`/`insert` sem `last_event_at` — a app não quebra, mas o intervalo horário usa o fallback `last_decay_at` (menos fiável). Depois de migrar, o PostgREST pode precisar de alguns segundos para refrescar o schema cache.
- **Progressão:** `computeCareScore` modula a duração das fases pós-ovo (`CARE_SPEED_BONUS` / `CARE_SPEED_PENALTY`). Limiares exatos: `applyAge` em `engine.ts`.
- **Evento aleatório:** tabela de probabilidades no código; `randomEventAlert` só é `true` quando o efeito é “visível” (ex.: stat ≤ 1, doença, cocô extra). Empate com notificações: `evaluateNotificationTriggers` aceita `opts.randomEventAlert`; prioridade em `notifications.ts` (doente → cocô → fome → triste → **random_event** → sono → evolução).
- **Recusas / consequências:** alimentar com fome cheia (vómito / lanche que fica infeliz), brincar com fome ≤ 1 (custo extra), apagar luz para dormir com felicidade ≤ 1 (recusa + `care_misses`), remédio sem doença (`happiness -1`). Cocô no máximo + doente: +1 `care_misses` por ciclo de decaimento aplicável.
- **Testes com `reduceAction`:** o estado final passa por `applyDecay(Date.now())`. Em testes com timers falsos, alinhar `last_decay_at`, `last_interaction_at` e `last_event_at` ao “agora” simulado (ver `petFresh` em `engine.test.ts`).

## Erros / armadilhas já encontrados neste repo

| Área | Problema | Lição |
|------|-----------|--------|
| **Vitest** | `expect` dentro de `if` | ESLint `vitest/no-conditional-expect` — asserções devem ser determinísticas. |
| **`engine.test` / `applyDecay`** | Morte por fome antes de testar cocô | Ajustar `last_interaction_at` ao fim do intervalo para não disparar `STARVATION_DEATH_MS` antes do assert. |
| **`reduceAction` + timers** | Expectativas de fome/felicidade erradas | `Date.now()` no decaimento após ação ≠ `last_decay_at` antigo da factory — sincronizar timestamps. |
| **`applyDecay` / evento aleatório** | Fome esperada ≠ obtida em testes longos | Fixar `last_event_at` ao `now` do cenário para não disparar evento horário no meio do teste. |
| **`pixelFrames`** | Frame com linha ≠ 16 caracteres | Grelha **16×16** por string; teste em `tests/unit/pixelFrames.test.ts`. |
| **`proxy` / middleware** | `NextRequest` só como `import type` | Usar valor de runtime: `import { NextRequest } from "next/server"` quando o objeto é instanciado. |
| **Ícones LCD** | Largura fixa a empurrar o ecrã para fora do ovo | `Screen` com `max-w` + `Device` com `overflow-hidden` e padding interno suficiente. |
| **Push “não faz nada”** | `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` ausente | `useNotifications` devolve `false` cedo — a UI deve explicar ou abrir modal de configuração. |
| **Metadata vs visual** | “Desfazer layout” desfez favicon | Confirmar se o pedido é **ficheiro** `layout.tsx` ou **CSS/componentes** de UI. |

## Áreas onde vale regressão automática

- `src/lib/game/engine.ts` — decaimento, morte, cocô, evolução.
- `src/lib/game/notifications.ts` — **ordem de prioridade** dos gatilhos (doente → cocô → fome → triste → random_event → sono com luz → evolução).
- `src/lib/auth/credentials.ts` — validação de email/password e mensagens amigáveis.
- Rotas `src/app/api/pets/**` e `push/subscribe` — com mocks Supabase + `web-push`.
- `src/lib/pixelFrames.ts` — invariantes 16×16.

## Convenções de código (preferências do utilizador)

- Mudanças **pequenas e legíveis**; alinhar estilo existente (imports, nomes, TS).
- Mensagens de erro/utilizador em português quando aplicável.
- Para citações de código em discussão, usar o formato de bloco com path e linhas conforme o ambiente Cursor.

## Checklist rápido antes de dar por fechado um pedido “parecido com produção”

- [ ] Supabase: utilizador em Authentication, linha em `pets`, policies RLS ativas.  
- [ ] `.env.local`: Supabase + (se push) VAPID.  
- [ ] `npm run lint` e `npm run test:run` passam.  
- [ ] Push: linha em `push_subscriptions` após ativar notificações no browser.

<!-- END:nextjs-agent-rules -->
