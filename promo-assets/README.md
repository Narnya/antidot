# promo-assets — материалы для промо-ролика Антидот

> **Связанный документ:** [`docs/PROMO_VIDEO_SCRIPT_v1.md`](../docs/PROMO_VIDEO_SCRIPT_v1.md) — сценарий, войсовер, motion timing, чек-листы.

---

## Что здесь

### `preview.html`

Самовоспроизводящийся HTML-просмотр ролика — все 6 кадров с переходами и Ken Burns зумом, зацикленный на 23 секунды. Открыть двойным кликом или `open promo-assets/preview.html`. Используется для:

- быстрого визуального теста ритма и переходов;
- **screen-recording в MP4** (см. инструкцию в самом HTML — нажать «Hide HUD», запустить QuickTime <kbd>⌃⌘5</kbd>, обвести прямоугольник телефона).

Это не финальный ролик — нет войсовера, нет музыки, нет object-level моушна. Но это **работающее видео из коробки**, годное для презентаций, фидбэка и первой итерации.

### `jitter-export/`

6 кадров сториборда, экспортированных из Figma как **1080×1920 PNG** (9:16, под Reels/Shorts/TikTok).

| Файл | Кадр | Тайминг в ролике | Тег |
|------|------|------------------|-----|
| `01_hook.png` | Хук | 0:00–0:04 | warm-900 dark / center text |
| `02_discover.png` | Альтернатива | 0:04–0:09 | event feed |
| `03_apply.png` | Подача → одобрение | 0:09–0:13 | safety banner |
| `04_meet.png` | Встреча в реале | 0:13–0:17 | full-bleed photo |
| `05_reconnect.png` | Связи | 0:17–0:20 | avatar list |
| `06_brand.png` | Бренд · CTA | 0:20–0:23 | warm-900 dark / logo |

**Total runtime:** ~23 сек.

---

## Как использовать

### Вариант A — через Jitter Figma plugin (recommended)

PNG здесь — фоллбэк. Если у вас Pro Figma, лучше импортировать **напрямую из Figma-файла** прототипа `xZkaKij7DhLPpRE3Ob0Znd` через Jitter plugin (jitter.video). Тогда слои сохранятся, и каждый объект (карточка, аватар, кнопка) анимируется отдельно. ID phone-фреймов — см. [PROMO_VIDEO_SCRIPT_v1.md → раздел Jitter Quickstart](../docs/PROMO_VIDEO_SCRIPT_v1.md#сборка-в-jitter--recommended-workflow).

### Вариант B — через PNG-импорт в Jitter

Если плагина нет — импортировать готовые PNG отсюда. В этом случае каждый кадр анимируется только целиком (fade / slide / zoom).

### Вариант C — без Jitter, через CapCut + Figma Present mode

Записать прототип в Figma Present mode (QuickTime/CleanShot X), смонтировать в CapCut с войсовером и музыкой. Самый простой путь, но переходы будут грубее. См. [PROMO_VIDEO_SCRIPT_v1.md → Технический setup (фоллбэк-стек)](../docs/PROMO_VIDEO_SCRIPT_v1.md#технический-setup-фоллбэк-стек-без-jitter).

---

## Что ещё нужно собрать перед сборкой

- [ ] **Войсовер** — записать в ElevenLabs (3 варианта тона в скрипте). Сохранять как `voiceover_A.mp3` сюда же.
- [ ] **Музыка** — найти warm acoustic loop. Сохранять как `music.mp3`.
- [ ] **Опционально:** прогнать `jitter-export/04_meet.png` через Luma Dream Machine или Runway Gen-3 image-to-video для лёгкой «живости» статичной сцены — это эмоциональный пик ролика.

---

## Safety-чек (перед публикацией)

Все кадры уже соответствуют safety-инвариантам [`docs/00_PRODUCT_CORE.md`](../docs/00_PRODUCT_CORE.md):

- ✅ В кадрах нет точных адресов / пинов на карте (Инв. 1, 9).
- ✅ Нет открытых DM с незнакомцами (Инв. 2) — Reconnect показан как post-event.
- ✅ Нет числового trust score (Инв. 3) — только мягкие ✓-бейджи.
- ✅ Нет dating-механик: ни свайпов, ни мэтчей, ни сердечек, ни процентов совместимости.
- ✅ Лого написан как `Antidot` (без `-e`), домен `antidot.space`.
