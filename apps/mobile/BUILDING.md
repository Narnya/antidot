# Building the mobile app (EAS) — readiness notes

> **Status (INFRA-008):** placeholder configuration only. **No builds run, no Expo
> login, no credentials, no store submission configured.** This documents intent and
> the steps required before the first real build.

Product rules are unaffected — see [`/docs/00_PRODUCT_CORE.md`](../../docs/00_PRODUCT_CORE.md) (first source of truth).

## Where EAS lives (monorepo)

- This is a **pnpm monorepo**; the mobile app is the workspace package `@social-events/mobile`.
- EAS Build config for a monorepo lives in the **app directory**, not the repo root:
  [`apps/mobile/eas.json`](./eas.json).
- **Run all EAS commands from `apps/mobile/`** (not the repo root), e.g.:
  ```bash
  cd apps/mobile
  eas build --profile preview --platform ios
  ```
- Metro is already monorepo-aware ([`metro.config.js`](./metro.config.js)); with
  `node-linker=hoisted` (root [`.npmrc`](../../.npmrc)) EAS can resolve hoisted deps.

## Build profiles ([`eas.json`](./eas.json))

| Profile       | Intent                            | Notes                                                                                                                                           |
| ------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `development` | Internal dev/testing later        | `distribution: internal`. `developmentClient: false` — **do not** set `true` until `expo-dev-client` is added (it is **not** a dependency yet). |
| `preview`     | Closed-beta internal builds later | `distribution: internal`.                                                                                                                       |
| `production`  | App Store / Google Play later     | No submit config; defaults only.                                                                                                                |

No EAS **Submit**, no EAS **Update** channels, and no app-signing credentials are
configured. These are deliberate later steps.

## Environment / secrets

- Follow the env strategy from **INFRA-006**: only `EXPO_PUBLIC_*` values reach the
  client; the **service role key is never in this app** ([`/docs/07_SECURITY_RLS.md`](../../docs/07_SECURITY_RLS.md) §8).
- **Never commit secrets.** Real `.env*` files are gitignored; see
  [`apps/mobile/.env.example`](./.env.example). EAS build-time secrets (if ever needed)
  are managed via EAS environment variables / secrets, not committed to git.

## TODO before the first real internal build

1. **Decide app name + bundle identifiers** — `app.json` has no `ios.bundleIdentifier`
   / `android.package` yet; do **not** invent final IDs here. (Brand name decision:
   "Antidot" — see Product Core; bundle IDs still need a product decision.)
2. **Configure the Expo account/project** — `eas init` / set `expo.owner` + project ID
   (requires Expo login; not done in INFRA-008).
3. **Configure credentials** — iOS signing / Android keystore via EAS-managed
   credentials (no `credentials.json` in repo).
4. **Reconcile dependency versions** — run `npx expo install --fix` (the hand-authored
   SDK pins are unverified).
5. **Validate a build profile** — start with `preview` (internal distribution).
6. **Run the first internal preview build** — `eas build --profile preview`.

> Steps 1–6 are out of scope for INFRA-008 and require network + an Expo account.
> Production builds and store submission come later, after a product decision on
> identifiers and a security review.
