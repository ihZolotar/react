# План: повне оновлення залежностей

## Контекст

Фази 0-2 з `PLAN.md` завершені: лінтер полагоджено й увімкнено type-aware правила, 13 багів виправлено, збірка зелена. Наступний крок — оновити залежності **до** структурної перебудови (Фаза 3) і міграції на Redux (Фаза 4), щоб не правити ті самі файли двічі. Конкретна причина саме такого порядку: `contactsTable.tsx` імпортує `@mui/material/Grid2`, а цього шляху в MUI v7+ не існує фізично.

З 26 залежностей 25 застарілі, серед них сім мажорних стрибків.

## Політика версій

**Коли остання версія пакета конфліктує з рештою архітектури — беремо найвищу сумісну, а не найновішу.** Стабільна робота важливіша за число у версії.

Це правило одразу спрацювало двічі — обидва конфлікти нижче.

### Конфлікт 1: TypeScript 7 vs typescript-eslint

`typescript-eslint` у **всіх** опублікованих версіях, включно з canary, оголошує `typescript: ">=4.8.4 <6.1.0"`. Гілки v9 не існує. Це не просто peer-попередження: у v8.65.0 додали явну перевірку на TS 7, бо typescript-eslint кидає рантайм-виняток — API TypeScript, які він читає при завантаженні модуля, у сімці `undefined`.

TypeScript 7 — це переписаний на Go компілятор (`tsgo`). Microsoft сама пише, що 7.0 **не постачає програмний API** (він планується на 7.1), і рекомендує екосистемам, які потребують API компілятора, поки лишатись на 6.0.

→ **TypeScript 6.0.3.** Це все одно два мажори вгору. Повертаємось до сімки окремим кроком, коли typescript-eslint її підтримає.

### Конфлікт 2: ESLint 10 vs eslint-config-next

`eslint-config-next@16.3.4` оголошує `eslint: ">=9.0.0"`, але пакети, які він тягне за собою, обмежені дев'яткою:

| Залежність | Стеля `eslint` |
|---|---|
| `eslint-plugin-react` 7.37.5 | `^9.7` |
| `eslint-plugin-import` 2.32.0 | `^9` |
| `eslint-plugin-jsx-a11y` 6.10.2 | `^9` |

Це відомий незакритий баг: [vercel/next.js#91702](https://github.com/vercel/next.js/issues/91702). Чи ламаються плагіни насправді під ESLint 10, чи лише скаржиться npm — офіційного підтвердження немає.

→ **ESLint 9.39.5** (найновіша 9.x).

## Цільові версії

| Пакет | Зараз | Ціль | Чому не latest |
|---|---|---|---|
| `next`, `eslint-config-next` | 15.2.4 | **16.3.4** | — |
| `react`, `react-dom` | 19.0.0 | **19.2.8** | — |
| `@mui/material`, `-nextjs` | 6.4.8 | **9.4.0** | — |
| `firebase` | 11.5.0 | **12.18.0** | — |
| `react-error-boundary` | 5.0.0 | **6.1.5** | — |
| `@typescript-eslint/*` | 8.28.0 | **8.69.0** | — |
| `typescript` | 5.8.2 | **6.0.3** | latest 7.0.2 ламає typescript-eslint |
| `eslint` | 9.23.0 | **9.39.5** | latest 10.10.0 ламає eslint-config-next |
| `prettier`, `formik`, `yup`, `react-icons`, `@types/*`, `@emotion/*` | — | latest | — |

Node 22.23.1 покриває всі вимоги (найвища — Next і Firebase: Node 20+).

## Передумова

Незакоміченими висять 14 файлів плюс `PLAN.md` і `src/utils/toErrorMessage.ts`. Оскільки `package-lock.json` лишається в `.gitignore` (рішення власника), git — **єдина** точка відкату. Комітимо роботу Фаз 0-2 перед першою зміною версій, інакше невдале оновлення змішається з нею.

Далі кожен крок — окремий комміт. Відкат: `git checkout <commit> -- package.json && rm -rf node_modules .next && npm install`.

---

## Крок 1. Безпечні мінори й патчі

`react`, `react-dom`, `@types/*`, `prettier`, `formik`, `yup`, `react-icons`, `@emotion/*`, `@typescript-eslint/*`, `eslint` (у межах 9.x), `@eslint/eslintrc` → 3.3.7.

Заразом прибрати `@next/env` — він у `dependencies`, але не використовується ніде.

Ризик мінімальний. Перевірка після кроку.

## Крок 2. TypeScript 5.8 → 6.0.3

TS 6 змінює **дефолти**, і два з них можуть зачепити:

- **`types` за замовчуванням стає `[]`** — автопошук `@types/*` вимикається. Найризикованіший пункт; імовірно доведеться додати `"types": ["node"]` у `tsconfig.json`.
- **`noUncheckedSideEffectImports` за замовчуванням `true`** — може дати помилки на імпортах виду `import './globals.css'`.
- `baseUrl` видалено — нас не стосується, ми використовуємо `paths` без `baseUrl`.
- `moduleResolution: "bundler"` лишається підтримуваним; `strict: true` уже стоїть.

## Крок 3. MUI 6.4 → 9.4

**MUI v8 не існує.** Опубліковані мажори — 5, 6, 7, 9; вісімку пропустили заради вирівнювання з MUI X. Тож два кроки.

### 3a. Кодмоди застарілих API (ще на v6)

```bash
npx @mui/codemod@latest deprecations/all ./src
```

### 3b. → v7

```bash
npm i @mui/material@7 @mui/material-nextjs@7
npx @mui/codemod@latest v7.0.0/all ./src
```

Обов'язковий ручний фікс — шлях імпорту `Grid`:

```diff
-import Grid from '@mui/material/Grid2';
+import Grid from '@mui/material/Grid';
```

Старий `Grid` (з `item`/`xs`) перейменували на `GridLegacy`, а `Grid2` став просто `Grid`. Ти вже був на `Grid2`, тож `<Grid container spacing={1}>` і `size={12}` — **уже новий API**, вони не міняються. Змінюється лише рядок імпорту.

### 3c. → v9

```bash
npm i @mui/material@9 @mui/material-nextjs@9
npx @mui/codemod@latest v9.0.0/system-props ./src
```

У `v9.0.0` існує **лише один** кодмод — `system-props`. Пресетів `all`/`preset-safe` для дев'ятки немає.

Три види ручних змін:

**`InputProps` видалено** (`page.tsx:174`):
```diff
-InputProps={{ startAdornment: ..., endAdornment: ... }}
+slotProps={{ input: { startAdornment: ..., endAdornment: ... } }}
```
Пастка з регістром: `InputProps` → `slotProps.input`, але `inputProps` → `slotProps.htmlInput`. Другий випадок у нас теж є — `Switch` у `contactsTable.tsx:329`.

**Системні пропи прибрані з `Box`, `Typography`, `Grid`, `Stack`, `Link`, `Dialog`** — 10 місць: `contactsTable.tsx` (108, 113, 117, 130, 237, 324, 337), `layout.tsx` (35, 200), `page.tsx` (207). Кодмод робить це сам, але diff треба прочитати.

```diff
-<Box display="flex" justifyContent="center" p={4}>
+<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
```

`variant` і `gutterBottom` у `Typography` — власні пропи компонента, лишаються. Прибирається `color`, `display`, `p`, `py`, `gap`.

**Поведінкові дрібниці:** `TablePagination` тепер форматує числа через `Intl.NumberFormat` за локаллю. `ListItemIcon` зменшив min-width 56 → 36px — зсуне верстку шухляди.

### Що НЕ стосується

`@mui/icons-material` не використовується (іконки з `react-icons`) — видалення legacy-іконок нас оминає. `GridLegacy` не використовуємо. `cssVariables` лишається opt-in, тож `createTheme({ palette: {...} })` працює дослівно. **Emotion лишається движком за замовчуванням** — Pigment CSS у стані «alpha, on hold», усі три `@emotion/*` потрібні й далі.

## Крок 4. Next 15 → 16

```bash
npx @next/codemod@canary upgrade latest
```

### `next lint` видалено

Це головна зміна для нас. `next build` більше **не запускає лінт**, а ключ `eslint` у `next.config` видалено.

```diff
-"lint": "next lint"
+"lint": "eslint ."
```

Кодмод `next-lint-to-eslint-cli` це вміє, але він також перезаписав би `eslint.config.mjs`. **Наш конфіг чіпати не треба** — ми у Фазі 1 вже зробили його робочим, з `recommendedConfig` у `FlatCompat` і type-aware правилами. Тому скрипт правимо вручну.

Наслідок, який варто усвідомити: лінт більше не є частиною `npm run build`. Тепер це окремий крок, і його треба ганяти свідомо — тим цінніший хук, що робить це автоматично.

### Turbopack став типовим для `next build`

Для нас безпечно: власного webpack-конфігу немає (`next.config.ts` порожній). Прапорець `--turbopack` у скрипті `dev` стає зайвим.

### Решта

- `metadata` / `viewport` / кореневий layout — **без змін**. Це важливо: Фаза 3 із `PLAN.md` лишається чинною як спланована.
- Async Request APIs (`cookies()`, `headers()`, `params`) — ми їх не використовуємо.
- `middleware` → `proxy`, PPR, `next/image` дефолти, паралельні маршрути — не використовуємо.
- Next 16 за замовчуванням запускає локальний `tsc` замість JS API компілятора (`useTypeScriptCli`). З TS 6 це працює штатно.

## Крок 5. Firebase 11 → 12

Найспокійніший мажор. Ламальні зміни v12: Node 20+, ES2020, видалено аліас `firebase/vertexai`. **Жоден із наших імпортів не зачеплено** — `@firebase/firestore` вийшов у складі v12 як мінор 4.9.0, тобто без semver-ламальних змін API. `FirestoreDataConverter` і `withConverter`, які ми додали у Фазі 2, лишаються як є.

## Крок 6. react-error-boundary 5 → 6

Єдина оголошена ламальна зміна 6.0.0 — «ESM-only». API `<ErrorBoundary FallbackComponent={...}>` і пропи `{ error, resetErrorBoundary }` **не змінились**.

Одне місце для уваги: 6.1.0 «виправив виведення типу помилки». Що саме змінилось — у release notes не сказано, тож під `strict: true` тут можлива нова помилка типів у `ErrorFallback`. Перевіряємо `tsc` після кроку.

## Крок 7. eslint-config-next 16 і react-hooks 7

`eslint-config-next@16.3.4` тягне `eslint-plugin-react-hooks ^7.0.0` — незалежно від того, чи оновлюємо ми його напряму.

**Це найгаласливіший крок усього оновлення.** У v7 правила React Compiler **увімкнені в пресеті `recommended` за замовчуванням** — це 14 нових правил, і майже всі рівня `error`:

`set-state-in-effect`, `set-state-in-render`, `purity`, `immutability`, `refs`, `static-components`, `preserve-manual-memoization`, `use-memo`, `error-boundaries`, `globals`, `config`, `gating` — усі `error`; `unsupported-syntax`, `incompatible-library` — `warn`.

На наявному коді найімовірніше засвітяться `set-state-in-effect` (у нас є такий ефект у `contactsTable.tsx` для скидання сторінки), `preserve-manual-memoization` і `immutability`.

Стратегія: спершу подивитись, що саме нафайлить, і розбирати по одному — це прямо збігається з пунктом ментора про Hooks API. Якщо шуму забагато, тимчасово знизити нові правила до `warn`, а не вимикати.

## Крок 8. Лінт-хук

Хук у `.claude/settings.json`, який після кожної моєї правки `.ts`/`.tsx` проганяє `eslint` на змінених файлах. Особливо доречно після Кроку 4, коли лінт перестане бути частиною `npm run build`.

---

## Перевірка

Після **кожного** кроку — окремий комміт і повний набір:

```bash
npx tsc --noEmit
npx eslint .
npm run build
npm run dev          # http://localhost:3003
```

Ручний сценарій: список вантажиться → додати контакт → відредагувати неактивний (лишається неактивним) → пошук → очистити → видалити з другої сторінки → перемкнути `active` → звузити вікно до мобільного (картки з кольоровою лівою рамкою, шухляда навігації).

Окрема увага після Кроку 3: візуальна перевірка всіх 10 місць із `sx`, пагінації (форматування чисел) і мобільних карток.

## Відкладено

- **TypeScript 7** — окремим кроком, коли typescript-eslint додасть підтримку.
- **ESLint 10** — коли закриють [next.js#91702](https://github.com/vercel/next.js/issues/91702).
- Обидва варто перевірити через `npm outdated` раз на кілька місяців.
