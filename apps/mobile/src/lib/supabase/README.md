# Supabase mobile client (AUTH-001)

Безопасный публичный wrapper Supabase JS клиента для Expo mobile app.

## Назначение

- Создаёт **single shared Supabase client** для mobile приложения.
- Использует **только публичный/anon-safe ключ** (publishable key).
- Хранит сессию в AsyncStorage; `processLock` защищает от гонок при refresh.
- AppState listener запускает/останавливает auto-refresh на native при переходе
  приложения в foreground / background.

## Границы безопасности (binding)

- ✅ Mobile читает **только** `EXPO_PUBLIC_*` env vars.
- 🚫 `SUPABASE_SERVICE_ROLE_KEY` **никогда** не используется в mobile (он server-only,
  guarded `import 'server-only'` в `apps/admin/src/config/serverEnv.ts`).
- 🚫 Никаких AI keys / приватных API keys в этом wrapper'е.
- 🚫 Никакого admin API.
- 🚫 Никаких screens / signup / login / OAuth — это AUTH-002+ tickets.

См. также:

- [`/docs/07_SECURITY_RLS.md`](../../../../../docs/07_SECURITY_RLS.md) §6 (auth & role model)
- [`/docs/19_ENV_CONFIG_STRATEGY.md`](../../../../../docs/19_ENV_CONFIG_STRATEGY.md) §4 (mobile env conventions)
- [`/docs/29_AUTH_BETA_ONBOARDING_IMPLEMENTATION_PLAN.md`](../../../../../docs/29_AUTH_BETA_ONBOARDING_IMPLEMENTATION_PLAN.md) §6, §7, §15 (AUTH-001 spec)

## Env переменные

Mobile wrapper читает:

| Переменная                             | Назначение                                         | Обязательность      |
| -------------------------------------- | -------------------------------------------------- | ------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`             | URL Supabase проекта                               | ⚠️ для runtime auth |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | публичный ключ (preferred, Supabase 2024+)         | ⚠️ для runtime auth |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`        | transitional alias (если PUBLISHABLE_KEY не задан) | альтернатива        |

Если **обе** PUBLISHABLE_KEY и ANON_KEY заданы, PUBLISHABLE_KEY имеет приоритет.

### Skeleton-фаза (текущая)

Если env пустой:

- wrapper создаёт client с placeholder URL (`https://placeholder.invalid`) и
  placeholder key — **import не падает**, typecheck/lint/test проходят;
- в `__DEV__` режиме wrapper логирует `console.warn`;
- export `isSupabaseConfigured: boolean` показывает, реальный ли env;
- **network calls упадут** в runtime — это корректно для skeleton-фазы.

### Настройка локального dev

1. Скопировать `apps/mobile/.env.example` в `apps/mobile/.env`.
2. Заполнить `EXPO_PUBLIC_SUPABASE_URL` и `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   значениями локального или staging Supabase проекта.
3. Перезапустить Expo dev server (env подхватывается во время bundle build).

> **Никогда не коммитьте `.env`.** Только `.env.example` отслеживается git.

## Использование (для будущих tickets — AUTH-002+)

```ts
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

// Auth-screens проверяют isSupabaseConfigured перед попыткой auth call.
// Без сконфигурированного env — show dev-friendly error / fallback.
```

## Не делает (binding scope ограничения AUTH-001)

- ❌ нет signup / login / OAuth — AUTH-002 / AUTH-003 / AUTH-004;
- ❌ нет session-persistence wiring помимо storage option — AUTH-005;
- ❌ нет logout логики — AUTH-006;
- ❌ нет protected route gates — AUTH-007;
- ❌ нет onboarding gate — ONB-014;
- ❌ нет profile tables / migrations — DBV2-004 (Sprint 4);
- ❌ нет RLS policies — RLSV2-001+ (Sprint 4).
