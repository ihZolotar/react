# План: від Context до Redux Toolkit + розбір помилок

## Контекст

`react_ped_project` — навчальний застосунок (Next.js 15.2.4 / React 19 / MUI v6 / Firestore) для CRUD контактів, написаний самотужки під час вивчення React і TypeScript. Ментор дав завдання на наступну ітерацію: перевести керування станом на Redux + Redux Toolkit і покрити типами форми, запити, компоненти, стор, редюсери та екшени; паралельно опрацювати Hooks API, generics і Promises/async-await.

Аудит коду показав, що пункти ментора — не абстрактне нагадування. Кожен має конкретне відображення в цьому репозиторії:

| Пункт ментора | Що саме за ним стоїть |
|---|---|
| Redux + RTK | `contactsContext.tsx` перестворює `value` на кожен рендер, через що ~130 рядків `useCallback`/`useMemo` у `page.tsx` не працюють; один глобальний `loading` на шість операцій |
| TS всюди | `as Contact[]` на сирих даних Firestore; три різні сигнатури однієї операції update (`Omit` vs `Partial` vs `ContactFormValues`) |
| Hooks API | `useMemo` для кешування JSX; `useEffect` з порожнім масивом залежностей на неммоізовану функцію; `useTheme()` викликано поза власним `ThemeProvider` |
| Generics | Жодного `withConverter<Contact>()`, жодного власного дженерика |
| Promises / async-await | `signInAnonymously` як fire-and-forget на імпорті модуля; помилки Firestore тричі перезагортаються в загальні рядки; діалоги закриваються та втрачають введені дані при збої |

Мета — пройти це поетапно, з поясненням причини кожної зміни, а не просто «переписати на Redux».

**Рішення, узгоджені до старту:**
- Redux через слайс + `createAsyncThunk` поверх наявного `contactsService.ts` (не RTK Query).
- Баги розбираємо **окремим етапом до** міграції, щоб було видно, які з них Redux прибирає сам, а які ні.
- ESLint/Prettier підганяємо під наявний код (одинарні лапки), код не переформатовуємо.
- Тести поки не додаємо.

**Перед стартом:** закомітити незбережене — `contactsTable.tsx`, `page.tsx`, `layout.tsx`, `CLAUDE.md`. Працюємо в гілці від `dev`.

---

## Фаза 0. Правила співпраці → CLAUDE.md

Дописати до `CLAUDE.md` секцію `## Working with the owner of this repo`:

- Це навчальний проєкт. У чаті пояснювати **що і навіщо** робиться: яка була проблема, чому саме таке рішення, які альтернативи.
- Мова спілкування — українська.
- **Не залишати коментарів у коді.** Пояснення йдуть у чат; коментарі власник додає сам за потреби. Зрозумілість — через іменування і структуру.
- Не робити «мовчазних» покращень поза межами поточного кроку — назвати знахідку в чаті й дати вирішити.

**Заразом виправити помилку в самому CLAUDE.md.** Там написано, що «adding a server component means keeping it outside this layout's client boundary». Це неточно: `{children}`, передані *крізь* клієнтський компонент, рендеряться на сервері й приходять уже готовим payload — серверні сторінки працюють і зараз. Реальний виграш від розділення кореневого layout — можливість експортувати `metadata`, а не розблокування серверних компонентів.

---

## Фаза 1. Зробити лінтер придатним до використання

Зараз `npm run lint` дає сотні помилок на недоторканому коді, тому ним ніхто не користується — і саме тому баги з Фази 2 ніхто не спіймав.

**`prettier.config.js`** — `singleQuote: true` (код скрізь із одинарними лапками).

**`eslint.config.mjs`** — прибрати блок `rules` з `indent`, `quotes`, `semi`. Вони стоять **після** `...compat.extends(..., "prettier")` і скасовують те, що `eslint-config-prettier` щойно вимкнув. Форматування — робота Prettier, не лінтера. Залишити `@typescript-eslint/no-unused-vars`.

**Увімкнути type-aware лінтинг** — `parserOptions.project` + `plugin:@typescript-eslint/recommended-type-checked`. Це вмикає `no-floating-promises` і `no-misused-promises`, які автоматично ловлять помилки з Фази 2.3.

`eslint-plugin-prettier` є в `package.json`, але ніде не використовується — підключити або видалити.

**Перевірка:** `npm run lint` завершується з керованою кількістю попереджень, серед яких реальні (`no-floating-promises`, невикористані `err`).

---

## Фаза 2. Розбір помилок

Кожен пункт — окрема тема з поясненням у чаті перед правкою.

### 2.1. Втрата даних користувача

**`editContactForm.tsx:40` — `active: contact?.active || true`**
`false || true === true`. Будь-який неактивний контакт, відкритий на редагування, повертається у стан «активний» — бо `active` входить у `ContactFormValues` і відправляється разом із формою, хоча користувач його не бачить. Тема: різниця `||` і `??`, і чому поле, яким форма не керує, взагалі не має бути в її values.

**`page.tsx:79-83, 92-96` — діалог закривається і стирає введене при помилці**
`handleAddContact` ловить помилку, показує сповіщення і **не перекидає її далі**. Дочірній компонент бачить, що `await onSubmit(values)` виконався успішно, і безумовно робить `resetForm(); onClose();`. Користувач бачить помилку — і порожню форму. `catch` у `addContactForm.tsx:40` при цьому недосяжний. Тема: як `await` бачить проковтнуту помилку і чому `rethrow` тут обов'язковий.

### 2.2. Помилки, які видно на екрані

**`contactsTable.module.css` — 6 із 8 класів не існують**
Визначені лише `.tableRow`, `.deleteButton`, `.activeText`. Компонент звертається до `styles.mobileCard`, `.active`, `.inactive`, `.tableCellEmail`, `.tableCellPhone`, `.actionButton` — усі `undefined`, у DOM летить `class="undefined undefined"`. Саме тому активні й неактивні картки на мобільному виглядають однаково. `.deleteButton` визначений і не використовується. Тема: чому TypeScript це не ловить (CSS-модулі типізовані як `Record<string, string>`).

**`contactsTable.tsx:164` — сторінка пагінації не скидається**
Ніщо не скидає `page` при видаленні або пошуку. На 2-й сторінці з 6 контактів видалення одного дає порожню таблицю і «6-5 of 5».

**`layout.tsx:211` — `useTheme()` викликано поза власним `ThemeProvider`**
`RootLayout` викликає `useTheme()` у тілі, а `<ThemeProvider theme={theme}>` рендерить нижче, у своєму ж `return`. Хук читає **дефолтну** тему MUI, а не `src/theme/theme.ts`. Працює лише випадково: `breakpoints.down('sm')` збігається в обох. Тема: хук читає контекст, який стоїть **над** компонентом, а не той, який компонент сам рендерить.

**`contactsTable.tsx:214-218` — компаратор ніколи не повертає `0`**
Рівні значення дають `-1`, що порушує контракт `Array.prototype.sort` і перемішує рядки з однаковим прізвищем.

**`contactsTable.tsx:237` — «No contacts found. Add your first contact.»** показується і для порожнього результату пошуку.

### 2.3. Async / Promises (пункт 5 ментора)

**`firebaseConfig.ts:18-22` — fire-and-forget на імпорті модуля**
`signInAnonymously(auth)` стартує як побічний ефект імпорту, і ніхто його не чекає. `contactsService.ts` створює посилання на колекцію теж на імпорті, а `contactsContext` стріляє `getContacts()` на монтуванні. Якщо правила безпеки вимагають `request.auth != null`, перше завантаження падає з `permission-denied` залежно від таймінгу мережі — класичний недетермінований баг. Плюс `console.log` з повним об'єктом користувача. Тема: чому час імпорту модуля — найгірше місце для незавершеного promise.

**`contactsService.ts:106-118, 127-137` — помилка втрачається тричі**
`updateContact` кидає `new Error("Contact with id X not found")` **всередині** `try`, тому власний `catch` одразу перезагортає її в `"Failed to update contact with id X"` — причину знищено. Далі контекст замінює це на `'Failed to update contact'`, а `page.tsx` — ще раз на те саме. Код помилки Firestore не доходить нікуди. Тема: збереження причини (`cause`), і чому `handleFirebaseError` **повертає** Error замість кидати (кожен виклик мусить пам'ятати `throw`).

**`page.tsx:79, 92, 103, 115`** — чотири `catch (err)`, де `err` не використовується.
**`page.tsx:137`** — `handleSearch()` без `await` і без `.catch()`.

### 2.4. TypeScript (пункти 2 і 3 ментора)

**`contactsService.ts:72, 93, 148` — `as Contact[]` на сирих даних Firestore**
`doc.data()` повертає `DocumentData`; каст стверджує форму, яку ніхто не перевіряв. Документ без `email` пройде систему типів і впаде на `.toLowerCase()`. **Найкраще місце для дженериків у проєкті:** замінити касти на `FirestoreDataConverter<Contact>` і `collection(db, 'contacts').withConverter(contactConverter)` — після цього `getDocs` повертає типізований результат без жодного `as`.

**`contactSchema.ts:32` — `newContactInitialValues` без типу.** Додати `satisfies ContactFormValues`, щоб нове обов'язкове поле в `Contact` ламало збірку, а не форму мовчки.

**`layout.tsx:233, 239` — `pathname as string`.** `usePathname()` уже повертає `string`.

### 2.5. Firestore

- `contactsService.ts:57-62` — `where('active','==',true)` + `orderBy('last_name')` потребує композитного індексу; не падає лише тому, що `activeOnly` завжди `false`. Або додати `firestore.indexes.json`, або прибрати непотрібний шлях.
- `contactsService.ts:142-158` — пошук викачує всю колекцію без `limit`. Для навчального обсягу прийнятно, але має бути свідомим рішенням (у Фазі 4 це взагалі зникає).
- `contactsService.ts:106, 127` — `getDoc` перед кожним записом подвоює вартість читань і є TOCTOU-перевіркою: документ можна видалити між `getDoc` і `updateDoc`. `updateDoc` і так падає на неіснуючому документі.

### 2.6. Прибирання

- Видалити шість коментарів-нагадувань разом із виправленням того, на що вони вказують: `layout.tsx:34`, `page.tsx:37`, `page.tsx:53`, `page.tsx:141`, `contactsTable.tsx:48`, `contactsTable.tsx:280`.
- `src/styles/globals.css` і `src/styles/page.module.css` не імпортує **жоден** файл. `globals.css` підключити в кореневому layout (Фаза 3), `page.module.css` видалити як залишок `create-next-app`.
- `layout.tsx:44` — `window.location.assign('/')` у fallback помилки робить повне перезавантаження.
- `contactsTable.tsx:293` — `aria-sort` має стояти на `<th>` (`TableCell`), а не на `TableSortLabel` всередині.

**Перевірка:** `npm run build` чистий. Вручну — відредагувати неактивний контакт (лишається неактивним); обірвати мережу і зберегти форму (діалог не закривається, дані на місці); видалити контакт із другої сторінки; перевірити вигляд активної/неактивної картки на вузькому екрані.

---

## Фаза 2.5. Оновлення залежностей

Окремий план: [PLAN-DEPENDENCIES.md](./PLAN-DEPENDENCIES.md). Стоїть перед Фазою 3 навмисно — `contactsTable.tsx` імпортує `@mui/material/Grid2`, шлях, якого в MUI v7+ не існує, тож інакше ті самі файли довелось би правити двічі.

---

## Фаза 3. Структура Next.js App Router

Те, що зроблено в обхід конвенцій App Router. Стоїть перед Redux навмисно: розділення кореневого layout — це саме те місце, куди потім стане `StoreProvider`.

### 3.1. Кореневий layout має бути серверним компонентом

`src/app/layout.tsx:1` — `'use client'` на корені. Чотири речі це спричиняють: `usePathname()`, `useState` для `mobileOpen`, `useTheme()` + `useMediaQuery()`, і `<ThemeProvider theme={theme}>` — об'єкт теми містить функції (`palette.augmentColor`, `transitions.create`), тож не може перетнути межу сервер→клієнт як проп.

Наслідки видно в самому файлі: неможливий експорт `metadata` / `viewport`, звідси саморобний `<head>` (рядки 221-223) і повна відсутність `<title>`. Плюс `ContactsProvider` обгортає **всі** маршрути, тож домашня сторінка теж тягне повне читання колекції.

**Розділити на три файли:**
- `src/components/appProviders.tsx` (`'use client'`) — імпортує `theme` **сам**, рендерить `AppRouterCacheProvider` → `ThemeProvider` → `CssBaseline` → `StoreProvider` → `{children}`. Тема не перетинає межу, бо клієнтський модуль імпортує її напряму.
- `src/components/appShell.tsx` (`'use client'`) — `usePathname`, `mobileOpen`, `useMediaQuery`, `NavigationBar`, `SideDrawer`, `Footer`, `ErrorBoundary`.
- `src/components/errorFallback.tsx` (`'use client'`) — це рівно те, про що твій коментар на `layout.tsx:34`.

`layout.tsx` лишається серверним: `metadata`, `viewport`, `<html>`, `<body>`, імпорт `globals.css`, рендер `<AppProviders><AppShell>{children}</AppShell></AppProviders>`.

### 3.2. Спеціальні файли App Router, яких немає

| Файл | Що замінює зараз |
|---|---|
| `error.tsx` | ручний `ErrorBoundary` + `ErrorFallback` у layout |
| `loading.tsx` | `<CircularProgress/>` всередині `contactsTable.tsx:229` |
| `not-found.tsx` | нічого — 404 дефолтний |

`error.tsx` автоматично отримує `reset()` замість `window.location.assign('/')`; `loading.tsx` вмикається через Suspense на рівні сегмента маршруту.

### 3.3. Іменування та розташування

- **`/contact` → `/contacts`** — ресурс у множині. Змінює URL і посилання в `NAV_ITEMS` та `src/app/page.tsx`.
- **`components/` → `_components/`** — Next не робить маршрут із цього каталогу (маршрути створюють лише `page.tsx`/`route.ts`), тож помилки немає. Але префікс підкресленням — явна конвенція «це не маршрут».
- **camelCase імена компонентів** (`contactsTable.tsx`) — у React прийнято `ContactsTable.tsx`. Суто конвенція; якщо міняти — одним комітом. ⚠️ macOS має регістронечутливу ФС: перейменовувати через проміжну назву (`git mv contactsTable.tsx tmp.tsx && git mv tmp.tsx ContactsTable.tsx`).

### 3.4. Що лишити як є

`src/{services,types,validation,theme,utils}` поза `app/` — правильно. `src/` як корінь замість кореня репозиторію — підтримувана конвенція Next.

**Перевірка:** `npm run build` показує домашню сторінку як статичну (`○`); у вкладці браузера з'явився заголовок; view-source містить твій `<title>`; кинути помилку в сторінці — спрацьовує `error.tsx` із робочою кнопкою повтору.

---

## Фаза 4. Міграція на Redux Toolkit

`@reduxjs/toolkit` і `react-redux` ще не встановлені.

> Приємна деталь, яку варто усвідомити: сервіс уже повертає `created_at`/`updated_at` як ISO-**рядки**, а не Firestore `Timestamp`. Саме тому `serializableCheck` у RTK пройде без жодного налаштування. Якби там були `Timestamp`, міграція була б значно болючішою.

### 4.1. Файли

```
src/store/index.ts               rootReducer, makeStore, RootState, AppDispatch, ThunkConfig
src/store/hooks.ts               useAppDispatch / useAppSelector / useAppStore
src/store/storeProvider.tsx      'use client'
src/store/contactsThunks.ts      шість createAsyncThunk
src/store/contactsSlice.ts       стан, редюсери, extraReducers
src/store/contactsSelectors.ts   селектори
src/utils/toErrorMessage.ts      unknown → string
```

Напрямок імпортів: `store/index.ts` → `contactsSlice.ts` → `contactsThunks.ts` → `services/contactsService.ts`. Один напрямок, як і в теперішній трирівневій схемі.

**Єдине ребро назад — тільки типи.** `contactsThunks.ts` потребує `RootState` зі `store/index.ts`, який імпортує слайс. Це цикл, і він нешкідливий **лише** тому, що імпорт стирається при компіляції:

```ts
import type { RootState } from '@/store';
```

Прибереш слово `type` — під `isolatedModules` це все одно скомпілюється, але в рантаймі `configureStore` може отримати `undefined` замість редюсера. Варто зламати навмисно один раз, щоб побачити.

### 4.2. Типізований стор

```ts
export const rootReducer = combineReducers({
    contacts: contactsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) =>
    configureStore({ reducer: rootReducer, preloadedState });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];

export interface ThunkConfig {
    state: RootState;
    rejectValue: string;
}
```

Три навмисні деталі:

1. **`RootState` виводиться з `rootReducer`, а не з `makeStore`.** Якщо написати `RootState = ReturnType<AppStore['getState']>` і водночас `makeStore(preloadedState?: Partial<RootState>)`, TypeScript падає з «`makeStore` implicitly has return type `any` because it does not have a return type annotation and is referenced directly or indirectly in one of its return expressions». Виведення з редюсера розриває самопосилання. Це варто відтворити навмисно.
2. **`AppDispatch = AppStore['dispatch']`** — indexed access на типі, не ручний юніон. Додаси другий слайс — обидва типи оновляться самі.
3. **`ThunkConfig` навмисно без `dispatch`.** `thunkApi.dispatch` за замовчуванням уже вміє диспатчити інші тунки і повертає проміс із `.unwrap()`. Додавання `dispatch: AppDispatch` заштовхнуло б виведений тип `AppStore` у типи самих тунків і створило б справжній цикл виведення.

```ts
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
```

`.withTypes` — форма react-redux 9. У старих туторіалах побачиш `TypedUseSelectorHook` — те саме, але багатослівніше. Для розуміння: `useAppSelector` розгортається у

```ts
<Selected>(selector: (state: RootState) => Selected) => Selected
```

`Selected` ніде не пишеться на місці виклику — він виводиться з типу повернення селектора. `const items = useAppSelector(selectContacts)` дає `Contact[]` без жодної анотації.

### 4.3. Стор створюється на кожен запит

```tsx
'use client';

const StoreProvider = ({ children }: { children: ReactNode }) => {
    const storeRef = useRef<AppStore | null>(null);

    if (storeRef.current === null) {
        storeRef.current = makeStore();
    }

    return <Provider store={storeRef.current}>{children}</Provider>;
};
```

Чому не `export const store = configureStore(...)` на рівні модуля: такий стор створюється один раз на Node-процес, а процес обслуговує **всі** запити всіх користувачів — контакти одного відвідувача лишалися б у сторі під час рендеру сторінки наступного. Це і витік стану між запитами, і витік пам'яті, що росте з трафіком.

Дві деталі React 19: `useRef<AppStore>()` без аргументу — **помилка компіляції** під `@types/react@19`, потрібні `| null` і явний `null`. І перевірка `if (current === null)`, а не `useRef(makeStore())` — інакше `makeStore()` викликається на кожному рендері дарма.

`StoreProvider` живе в **layout**, а не в сторінці: layout не перемонтовується при клієнтській навігації, тож `/` → `/contacts` → `/` зберігає завантажені контакти.

### 4.4. Типи

Додати до `src/types/index.ts`:

```ts
export type RequestStatus = 'idle' | 'pending' | 'succeeded' | 'failed';
export type ContactDraft = Omit<Contact, 'id' | 'created_at' | 'updated_at'>;

export interface ContactIdArg { id: string; }
export interface UpdateContactArg extends ContactIdArg { changes: Partial<ContactDraft>; }

export type SortField = 'first_name' | 'last_name' | 'email' | 'phone';
export type SortOrder = 'asc' | 'desc';
export interface ContactsSort { field: SortField; order: SortOrder; }
```

`ContactDraft` заміщає теперішній `ContactFormValues = Omit<Contact, 'id'>`. Сервіс сам пише `created_at`/`updated_at`, тож форма не повинна мати змоги їх підставити — `Omit` із трьома ключами це кодує. Заразом зникає `active` із values, що і є фіксом бага 2.1 на рівні типів.

### 4.5. Форма стану — і що вона виправляє

```ts
interface ContactsState {
    items: Contact[];
    selectedContactId: string | null;
    searchQuery: string;
    sort: ContactsSort;
    listStatus: RequestStatus;
    listError: string | null;
    createStatus: RequestStatus;
    pendingIds: Record<string, boolean>;
    mutationError: string | null;
}
```

Анотувати `const initialState: ContactsState` явно — не косметика: це те, що обриває цикл виведення типів з 4.1. Без анотації виведений тип стану доводиться резолвити через `extraReducers`, які посилаються на тунки, які посилаються на `RootState`.

**Теперішній єдиний `loading: boolean` розпадається на три осі** — за тим, на що дивиться користувач, а не за тим, яка функція виконується:

| Поле | Ставлять | Читає |
|---|---|---|
| `listStatus` | fetch, search | скелетон / затемнення таблиці |
| `createStatus` | add | кнопка Submit у діалозі Add |
| `pendingIds` | update, delete | Switch і кнопки **одного** рядка |

Правила рендеру, що з цього випливають: спінер лише на **першому** завантаженні (`listStatus === 'pending' && items.length === 0`); при рефетчі з уже наявними рядками — таблиця лишається змонтованою під `<LinearProgress />`; рядок у процесі мутації — `disabled` лише на своїх контролах. Це усуває поточну поведінку, коли перемикання одного switch демонтує всю таблицю і скидає сортування та сторінку.

Помилки діляться так само: `listError` → банер `<Alert>` («дані не ті, що ти думаєш»), `mutationError` → `<Snackbar>` (невдалий перемикач не означає, що таблиця застаріла).

**Пошук:** `items` завжди тримає **повний** список; пошук — це `searchQuery` + селектор-фільтр. Це виправляє баг, через який пошук ламає перевірку унікальності email (зараз `contacts` перезаписується відфільтрованою вибіркою, і форма валідує лише серед знайдених), і заразом прибирає похід у Firestore на кожен пошук. Тому тунка `searchContacts` у списку нижче **немає**, а `searchContacts` із сервісу видаляється.

### 4.6. Тунки — головне місце з дженериками

```ts
export const fetchContacts = createAsyncThunk<Contact[], FetchContactsArg, ThunkConfig>(
    'contacts/fetchContacts',
    async ({ activeOnly = false }, { rejectWithValue }) => {
        try {
            return await getContacts(activeOnly);
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Failed to fetch contacts'));
        }
    },
    { condition: (_arg, { getState }) => getState().contacts.listStatus !== 'pending' },
);
```

Решта: `addContact<Contact, ContactDraft>`, `updateContact<UpdateContactArg, UpdateContactArg>`, `deleteContact<string, ContactIdArg>`, `toggleContactActive<UpdateContactArg, ContactIdArg>`.

Три речі, які тут важливо побачити:

- **`Returned` і `ThunkArg` незалежні.** `deleteContact` приймає `{ id }`, повертає `string`. `updateContact` приймає й повертає той самий тип — бо `updateContactInService` резолвиться у `void`, тож редюсеру треба, щоб аргумент повернули назад. П'ять тунків — п'ять різних пар.
- **`deleteContact` приймає об'єкт, а не голий `string`, суто через типи.** Матчери нижче звужують `action` до **юніону** і читають `action.meta.arg.id` — це типізується лише якщо кожен член юніону має `.id`. Дизайн API продиктований системою типів. Варто спершу написати «негарно» (`typeof action.meta.arg === 'string' ? ... : ...`), щоб фікс відчувався заслуженим.
- **`toggleContactActive` — це урок async.** `getState()` типізований як `RootState` **тільки** завдяки дженерику `{ state: RootState }` — прибери його, і повернеться `unknown`. І головне: `dispatch(thunk())` повертає проміс, який **резолвиться навіть коли тунк відхилився**. `.unwrap()` — це те, що перекидає помилку далі, щоб `try/catch` і `await` поводились так, як виглядають. Видалити `.unwrap()` і побачити, що `catch` не спрацьовує — найкорисніші п'ять секунд усієї міграції.

```ts
export const toErrorMessage = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;
```

Дрібниця, але саме тут з'являється звуження `unknown`. Коректна вона тому, що `handleFirebaseError` у сервісі гарантує: кожне відхилення — справжній `Error`.

### 4.7. `extraReducers` без шестикратного повтору

`addCase` — лише для `fulfilled`, бо кожен із них справді різний. `addMatcher` — для `pending`/`rejected`, бо вони згортаються у кілька форм:

```ts
const isRowMutationPending = isAnyOf(updateContact.pending, deleteContact.pending);
const isRowMutationSettled = isAnyOf(
    updateContact.fulfilled, updateContact.rejected,
    deleteContact.fulfilled, deleteContact.rejected,
);
const isMutationRejected = isAnyOf(addContact.rejected, updateContact.rejected, deleteContact.rejected);
```

Дванадцять обробників життєвого циклу стають шістьма `addCase` + чотирма `addMatcher`.

Три правила, які інакше вкусять:

- **Усі `addCase` мають іти перед усіма `addMatcher`.** Інакше білдер кидає помилку при створенні слайса.
- **Спрацьовують обидва.** `updateContact.fulfilled` викликає і свій `addCase`, і `isRowMutationSettled`. У цьому й суть: case робить доменний патч, matcher — бухгалтерію.
- **`toggleContactActive` навмисно не входить у жоден матчер.** Він усередині диспатчить `updateContact`, і життєвий цикл *того* тунка вже ставить і знімає `pendingIds[id]`. Інакше id додався б і знявся двічі, і перше зняття «розспінерило» б рядок, поки зовнішній тунк ще в польоті. Це ж і аргумент за явні `isAnyOf(...)` замість суцільного `action.type.endsWith('/pending')`: суцільний не вміє сказати «крім цього» і дає `action` як `UnknownAction`, де `action.meta.arg` не існує.

Тут же — **Immer**: `state.items.push(...)` виглядає як мутація, але нею не є. Це місце, де RTK найсильніше відрізняється від «класичного» Redux із туторіалів.

### 4.8. Селектори

Правило одне: `useSelector` порівнює результат **за посиланням**, тож меморизувати треба рівно тоді, коли селектор **конструює нове значення**.

- **`selectSortedContacts` — заслужено.** `[...contacts].sort()` створює новий масив на кожен виклик. Без `createSelector` будь-який dispatch у застосунку — навіть той, що чіпає `pendingIds` чужого рядка — дає нове посилання, провалює порівняння і перерендерює таблицю.
- **`selectContactById` — не потрібно.** `.find()` повертає елемент, який уже є в масиві: те саме посилання на вході й на виході. Обгортка в `createSelector` ще й тихо ламається — дефолтний розмір кешу 1, тож чергування двох id перераховує щоразу.
- **`selectIsContactPending(id)` — не потрібно**, і тут тонкість: це селектор-**фабрика**, тож `useAppSelector(selectIsContactPending(contact.id))` створює нову функцію на кожен рендер. Це безпечно **лише тому, що повертається булеан** — примітив порівнюється за значенням. Той самий патерн, що повертає об'єкт, дав би нескінченний ререндер. Найнаочніша можлива демонстрація того, що робить порівняння в `useSelector`.

**У сторі:** `items`, `searchQuery`, `sort`, усі статуси й помилки, `selectedContactId`.
**У компоненті:** текст у полі пошуку, `page` / `rowsPerPage`, відкритість діалогів, **увесь стан Formik**.

Пагінація — канонічний випадок карго-культу: її не читає ніхто поза `contactsTable.tsx`, а «скинути на сторінку 0 при зміні rowsPerPage» — чиста логіка вигляду. Formik теж лишається собою: Redux потрібен для стану, який переживає компонент-власник, а форма в діалозі — не переживає.

**Сортування — чесно спірне рішення.** Лишити `sortField`/`sortOrder` у компоненті з наявним `useMemo` працює бездоганно і коду менше. Перенесення в стор — це те, що робить `selectSortedContacts` безпараметровим і робить урок про `createSelector` конкретним. Рекомендація: перенести, але усвідомлювати, що причина педагогічна, а не архітектурна. Не варто виносити з цього правило «стан UI належить Redux».

### 4.9. Порядок міграції — застосунок не ламається довше ніж на крок

Кожна фаза закінчується `npm run build` (єдиний реальний type-check) і, де змінюється UI, `npm run dev` на **http://localhost:3003**.

| Крок | Що робимо | Стан застосунку |
|---|---|---|
| 0 | `npm i @reduxjs/toolkit react-redux` + розширення Redux DevTools | працює як раніше |
| 1 | розширити `src/types/index.ts` | суто additive |
| 2 | створити всі файли `src/store/*` і `toErrorMessage.ts` — **нічого їх не імпортує** | працює на Context; тут вирішуються всі проблеми з дженериками, без ризику для живого застосунку |
| 3 | змонтувати `StoreProvider` поверх `ContactsProvider` | обидві системи співіснують; DevTools бачить `initialState` і жодного екшена |
| 4 | **`contacts/page.tsx`** — замінити `useContacts()` на `useAppSelector` + `dispatch`; прибрати локальний `submitting` | єдиний ризиковий крок, один файл |
| 4b | `contactsTable.tsx` — `selectSortedContacts`, `setSort`, `pendingIds`; `page`/`rowsPerPage` лишаються локальні | перевірити: перемикач на 3-й сторінці не скидає сторінку |
| 5 | прибрати `ContactsProvider`, видалити `src/context/` | `npm run build` миттєво знайде вцілілі імпорти |

У кроці 4 ефект виглядає так:

```tsx
useEffect(() => {
    dispatch(fetchContacts({}));
}, [dispatch]);
```

`dispatch` референційно стабільний, тож масив залежностей чесний, а не «щоб лінтер замовк». `condition` у тунку робить подвійний виклик ефекту в StrictMode React 19 нешкідливим — другий dispatch відсікається, бо `listStatus === 'pending'`. Це видно в DevTools: `fetchContacts/pending` один раз, не два.

Крок 5 навмисно останній: доки він не виконаний, крок 4 відкочується зміною одного файлу.

### 4.10. Що видаляється, що лишається

**Видаляється:** увесь `src/context/contactsContext.tsx` (разом із мертвим `selectedContact` / `setSelectedContact` / `getContact`, яких не читає жоден компонент); `searchContacts` із сервісу; локальний `submitting` у `page.tsx` (зникає дублювання `formik.isSubmitting || isSubmitting`, яке зараз синхронізується руками у восьми місцях); проп `loading` і ранній `return` зі спінером у таблиці; `useMemo` для `sortedContacts`; проп `contacts`, що прокидався в діалоги.

**Лишається без змін:** `contactsService.ts` — Redux не має знати про Firestore; `contactSchema.ts` (міняється лише джерело `contacts`); `contactForm.tsx` (лише перенацілити `ContactFormValues` на `ContactDraft`); `firebaseConfig.ts`, `theme.ts`, CSS-модулі.

**Стає мертвим свідомо:** `getContactById` у сервісі втрачає єдиного викликача. Не чіпаємо (сервіс не переписуємо), але це рішення, а не недогляд. Захочеш оживити — сьомий тунк `fetchContactById` з типом повернення `Contact | null`.

**Побічний виграш:** `selectedContactId: string | null` замість збереження об'єкта. Зараз `page.tsx:53` тримає `currentContact` як захоплений знімок, тож після оновлення діалог показує застарілі дані. Зберігання id і читання через селектор робить цей клас застарілості структурно неможливим.

---

## Фаза 5. Закриття пунктів ментора

**Hooks API (пункт 2).** Redux прибирає `useContext` і переписує меморизацію так, щоб вона нарешті працювала. Лишаються хуки з природним місцем у цьому застосунку:
- `useDeferredValue` — поле пошуку лишається чуйним, поки фільтрація відстає.
- `useOptimistic` — перемикач `active`: миттєвий відгук з автоматичним відкотом при помилці.
- `useId` — прив'язка `label` / `aria-describedby` у формі замість хардкодних `id`.
- `useTransition` — не показувати спінер під час перемикання сортування.

Правило для розбору: перед додаванням хука відповісти, **яку конкретну проблему в цьому файлі** він вирішує. Половина нинішньої меморизації існує тому, що на це питання ніхто не відповідав.

**Generics (пункт 3).** Чотири місця, де дженерики прибирають касти, а не прикрашають: `FirestoreDataConverter<Contact>` (2.4); `createAsyncThunk<Returned, ThunkArg, ThunkConfig>` (4.6); `RootState = ReturnType<typeof rootReducer>` + `AppDispatch = AppStore['dispatch']` (4.2); власний `useDebouncedValue<T>(value: T, delay: number): T` — щоб побачити параметр типу у власному коді, а не лише в чужих бібліотеках.

Окремо варто дійти до того, чому `action.payload` у `.rejected` має тип `string | undefined`: тунк, який кинув помилку замість `rejectWithValue`, не має payload — лише `action.error`. Маленький точний урок про те, що юніон описує реальні рантайм-випадки.

**Promises / async-await (пункт 5).** Ланцюжок `cause` у помилках (2.3); `.unwrap()` (4.6); `condition` і послідовність запитів; окреме порівняння `Promise.all` проти послідовних `await` на прикладі `getDoc`-перед-записом із 2.5.

**TypeScript на формах (пункт 2).** Звести три сигнатури update до однієї. `ContactDraft` робить структурно неможливою відправку формою поля, яким володіє сервер.

---

## Інструменти та скіли

**Плагін IDE.** У проєкті є `.idea/` — тобто WebStorm або IntelliJ. Варто поставити офіційний плагін Claude Code для JetBrains: він дає живі діагностики TypeScript із IDE, тож помилки типів видно одразу, без `npm run build`. Для навчального проєкту це найкорисніша інтеграція — коротший цикл зворотного зв'язку.

**Вбудовані скіли** (ставити нічого не треба):
- `/code-review` — розбір змін перед комітом; знайде саме той клас помилок, що у Фазі 2.
- `/run` — запустити застосунок і перевірити зміну візуально.
- `claude-in-chrome` — перевірка UI в браузері: мобільні картки, стани помилок, пагінація після видалення.

**Скіли під цей проєкт** (створити **після** Фази 4, коли конвенції усталені — інакше скіл зафіксує невирішене):
- `new-slice` — генерує типовий RTK-слайс за конвенціями з Фази 4.
- `explain-change` — після правки пояснює в чаті: що було, чому неправильно, що стало, який принцип за цим.

---

## Загальна перевірка

```bash
npm run lint      # чисто після Фази 1
npm run build     # єдиний реальний type-check (tsconfig має noEmit)
npm run dev       # http://localhost:3003
```

Наскрізний сценарій: додати контакт → відредагувати неактивний (лишається неактивним) → пошук → перевірити, що валідація унікальності email бачить **усі** контакти, а не лише знайдені → очистити пошук → видалити з другої сторінки → перемкнути `active` (таблиця не мигає спінером, сторінка й сортування збережені) → звузити вікно до мобільного вигляду.

## Порядок

Фази 1 → 2 → 3 → 4 → 5, кожна окремим комітом (усередині Фази 4 — по кроку з таблиці 4.9).
