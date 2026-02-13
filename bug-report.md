# 🐛 BUG REPORT — Instagram Clone (ICH IT Career Hub)

> **Дата**: 12.02.2026
> **Тестировщик**: Наталия (аккаунты: `nata137`, `Tefani`, `Tefani2`, `Michael`)
> **Стек**: Express + TypeScript + MongoDB/Mongoose (BE), React + TypeScript + Redux + Vite (FE)
> **Скриншоты**: папка `screenshots/` (ссылки на номера скринов из ручного тестирования)

---

## Как пользоваться этим документом

Каждый баг имеет:

- **ID** — уникальный номер для ссылок
- **Приоритет** — 🔴 критичный / 🟠 высокий / 🟡 средний / 🟢 низкий
- **Файлы** — точные пути к файлам, где нужно исправлять
- **Причина** — анализ кода, объясняющий почему баг возникает
- **Фикс** — конкретные инструкции что менять

---

## 🔴 КРИТИЧНЫЕ БАГИ (функционал не работает)

### BUG-01: Лайки постов — shared state, можно лайкнуть только 1 пост

**Скрины**: 5, 6, 8, 9, 40
**Симптом**: На странице Home можно поставить лайк только одному посту. После лайка одного поста — лайки на остальных не работают. Иногда нужно сначала лайкнуть пост №3, чтобы заработали остальные.
**Файлы**:

- `FE/src/redux/slices/likesSlice.ts`
- `FE/src/components/home/postItem/PostItem.tsx`

**Причина**: В `likesSlice.ts` используется единый `state.loading = true` для ВСЕХ лайков. Пока `loading: true` (ждём ответ сервера), все остальные лайки блокируются. Кроме того, в `PostItem.tsx` состояние `isLiked` инициализируется как `false` при каждом рендере — бэкенд не возвращает информацию, лайкнул ли текущий пользователь пост.

**Фикс**:

1. В `likesSlice.ts` — убрать глобальный `loading`, использовать `loadingByPostId: Record<string, boolean>` для каждого поста отдельно.
2. В `PostItem.tsx` — при монтировании проверять, есть ли userId текущего пользователя в массиве `post.likes[]`. Но проблема: бэкенд `GET /posts` (getAllPosts) не возвращает массив `likes` с userId — он хранит ObjectId документов Like, а не userId. Нужно на бэке в `postController.ts` → `getAllPosts` добавить populate для likes или добавить поле `isLikedByMe`.
3. Альтернативный подход: на бэке в `toggleLike` возвращать актуальный `likesCount` и `isLiked: boolean`, а на фронте использовать эти данные.

---

### BUG-02: Счётчик комментариев всегда 0

**Скрины**: 1, 2, 3, 4, 7, 28
**Симптом**: У всех постов отображается 0 комментариев, хотя комментарии реально есть. После добавления комментария — показывает 1 вместо реального количества. При повторном открытии поста — снова 0.

**Файлы**:

- `BE/src/models/PostModel.ts` — виртуальное поле `commentsCount`
- `BE/src/controllers/commentController.ts` — `addComment` не добавляет comment.\_id в Post.comments[]
- `FE/src/components/posts/postModal/PostModal.tsx`

**Причина**: Виртуальное поле `commentsCount` в PostModel считает `(this.comments ?? []).length`. Но массив `Post.comments[]` НИКОГДА не обновляется — в `commentController.ts` → `addComment` создаётся Comment, но его `_id` не пушится в `Post.comments[]`. Поэтому `comments.length` всегда = 0 (или сколько было при создании поста).

**Фикс** (два варианта):

- **Вариант А** (рекомендуемый): Удалить виртуальное поле `commentsCount`. Вместо этого в контроллерах, где нужен счётчик, делать `await Comment.countDocuments({ post: postId })`. В `getPostById` добавить это число в ответ.
- **Вариант Б**: В `addComment` после `await comment.save()` добавить:
  ```ts
  await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
  ```
  И аналогично в `deleteComment`:
  ```ts
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: commentId },
  });
  ```

---

### BUG-03: Лайки комментариев не работают

**Скрины**: 4, 14
**Симптом**: Клик на сердечко у комментария — нет реакции. Все комментарии отображаются с закрашенным сердечком сразу после добавления, хотя лайк не ставился.

**Файлы**:

- `FE/src/components/comments/commentContent/CommentContent.tsx`
- `BE/src/controllers/likeController.ts` → `toggleLikeComment`
- `BE/src/models/CommentModel.ts`

**Причина**:

1. Бэкенд `toggleLikeComment` создаёт документ Like (отдельная коллекция), но не обновляет `Comment.likes[]`. Виртуальное поле `likesCount` считает `this.likes.length` — массив всегда пуст.
2. Фронтенд: в `CommentContent.tsx` иконка `FaHeart` не имеет состояния liked/unliked — нет проверки, лайкнул ли текущий пользователь комментарий. CSS-класс всегда одинаковый (закрашенное сердечко).
3. Бэкенд не возвращает после toggle обновлённый комментарий — фронт не знает новое состояние.

**Фикс**:

1. В `toggleLikeComment` после создания/удаления Like — обновлять `Comment.likes[]`:
   ```ts
   // При добавлении:
   await Comment.findByIdAndUpdate(commentId, { $addToSet: { likes: userId } });
   // При удалении:
   await Comment.findByIdAndUpdate(commentId, { $pull: { likes: userId } });
   ```
2. Возвращать в ответе `{ liked: boolean, likesCount: number }`.
3. На фронте в `CommentContent.tsx` — добавить состояние `isLiked` для каждого комментария, проверяя `comment.likes.includes(myId)`.

---

### BUG-04: Profile показывает ВСЕ посты (и свои, и чужие) вместо только своих

**Скрины**: 13, 58
**Симптом**: На странице Profile отображаются и свои, и чужие посты. А должны быть только свои.

**Файлы**:

- `FE/src/components/posts/postsList2/PostList2.tsx`
- `FE/src/redux/slices/postsSlice.ts` → thunk `getAllPosts`

**Причина**: `PostList2.tsx` (используется в ProfilePage) вызывает `dispatch(getAllPosts())` — это `GET /posts`, который возвращает ВСЕ посты. Должен вызываться `GET /posts/user/:userId` с ID текущего пользователя.

**Фикс**: В `PostList2.tsx` заменить:

```ts
// БЫЛО:
dispatch(getAllPosts());
// НУЖНО:
const authUser = useSelector((state: RootState) => state.auth.user);
dispatch(getOtherUserPosts(authUser._id)); // или создать отдельный thunk getMyPosts
```

И использовать `state.posts.otherUserPosts` вместо `state.posts.posts` для отображения.

---

### BUG-05: Home показывает свои посты (не должен)

**Скрины**: (связан с BUG-04)
**Симптом**: На Home могут показываться свои посты, хотя должны быть только чужие.

**Файлы**:

- `FE/src/components/home/homePagePosts/HomePagePosts.tsx`
- `BE/src/controllers/postController.ts` → `getAllPosts`

**Причина**: Фронтенд в `HomePagePosts.tsx` (class component) уже фильтрует свои посты:

```ts
const filtered = data.filter((p) => authorId !== meId);
```

Это работает корректно, НО: `meId` берётся из `localStorage.getItem('user')`. Если localStorage битый или пуст — фильтрация не работает. Также бэкенд `getAllPosts` возвращает ВСЕ посты без исключений — лучше фильтровать на сервере.

**Фикс**: В бэкенде `postController.ts` → `getAllPosts` добавить поддержку query-параметра `?excludeAuthor=userId`:

```ts
const filter: any = {};
if (req.query.excludeAuthor) {
  filter.author = { $ne: req.query.excludeAuthor };
}
const posts = await Post.find(filter)...
```

---

### BUG-06: Счётчик постов всегда 0 в своём профиле

**Скрины**: 15, 16, 45, 58, 63, 65
**Симптом**: В собственном профиле `postsCount` = 0, хотя посты есть. При этом из чужого профиля (через Search) количество постов отображается правильно.

**Файлы**:

- `FE/src/redux/slices/authSlice.ts`
- `FE/src/components/profiles/currentUserProfile/CurrentUserProfile.tsx`
- `BE/src/controllers/userController.ts` → `getProfile`

**Причина**: `CurrentUserProfile.tsx` читает `user.postsCount` из `state.auth.user`. Но `authSlice` хранит данные, которые были записаны при LOGIN/REGISTER — в этот момент `postsCount` не передаётся (его нет в ответе `/auth/login`). Позже, когда создаётся пост, `authSlice.user.postsCount` не обновляется.
При этом `getProfile` на бэке корректно считает `postsCount: await Post.countDocuments({ author: id })` — но этот эндпоинт вызывается только для ЧУЖИХ профилей (через `getUserById` в `OtherProfile.tsx`).

**Фикс**:

1. При монтировании `CurrentUserProfile` — вызывать `dispatch(getUserById(authUser._id))` для получения актуальных данных.
2. Либо после создания поста — обновлять `authSlice.user.postsCount`.
3. Лучший вариант: при входе на `/profile` делать запрос `GET /users/:myId` и использовать данные оттуда.

---

### BUG-07: Followers/following — нестабильные счётчики, пропадают при перезагрузке

**Скрины**: 29, 30, 51, 52, 53, 54, 55, 59, 63, 64, 65, 67, 68
**Симптом**: При первой загрузке показываются и followers, и following. После перезагрузки одно из них пропадает. У разных пользователей пропадает разное (у Michael — following, у nata137 — followers). Количество меняется хаотично.

**Файлы**:

- `FE/src/components/profiles/follows/Follows.tsx`
- `BE/src/controllers/userController.ts` → `getProfile`
- `BE/src/models/UserModel.ts` — виртуальные поля + массивы followers/following

**Причина**: В проекте ДВА источника данных для подписок:

1. **Массивы** `User.followers[]` / `User.following[]` в UserModel — эти массивы НИКОГДА не обновляются при follow/unfollow (followController работает только с коллекцией Follow).
2. **Коллекция** Follow (FollowModel) — здесь реальные данные.

Виртуальные поля `followersCount` / `followingCount` в UserModel считают длину массивов `this.followers.length` — которые всегда пусты или содержат устаревшие данные.

В `getProfile` бэкенд делает: `followersCount: user.followers.length` — а user.followers это тот самый пустой/устаревший массив.

Одновременно `Follows.tsx` делает `GET /follows/:userId/followers` и `GET /follows/:userId/following` — эти запросы идут в коллекцию Follow и возвращают ПРАВИЛЬНЫЕ данные.

**Race condition**: `getProfile` и `Follows.tsx` запрашивают данные параллельно. Кто приходит первым — тот и рисуется. Из-за разного времени ответа — иногда видим правильные данные, иногда нет.

Дополнительно: `Follows.tsx` загружает данные только когда `follow.followers === 'Loading...'`, и при повторном рендере может не обновиться.

**Фикс** (РЕКОМЕНДУЕМЫЙ — комплексный):

1. **Удалить массивы** `followers[]` / `following[]` из UserModel. Удалить виртуальные поля `followersCount` / `followingCount`.
2. В `getProfile` считать подписчиков через Follow:
   ```ts
   const followersCount = await Follow.countDocuments({ following: id });
   const followingCount = await Follow.countDocuments({ follower: id });
   ```
3. На фронте использовать данные из `getProfile`, а не дублировать запросы в `Follows.tsx`.

---

### BUG-08: Лайки постов — счётчик накручивается бесконечно

**Скрин**: 30
**Симптом**: Можно кликать на лайк бесконечно, счётчик увеличивается каждый раз (было 5 кликов подряд без остановки).

**Файлы**:

- `FE/src/components/posts/postModal/PostModal.tsx` → `handleLikePost`
- `BE/src/controllers/likeController.ts` → `toggleLike`

**Причина**: В `PostModal.tsx` → `handleLikePost`:

```ts
await $api.post(`/likes/post/${post._id}`);
setLikesCount((p) => p + 1); // ВСЕГДА +1, даже если бэк удалил лайк (toggle!)
```

Бэкенд правильно делает toggle (удалить если есть / добавить если нет), но фронтенд ВСЕГДА увеличивает на 1, независимо от ответа. Кроме того, быстрые клики создают race condition.

**Фикс**:

1. Бэкенд `toggleLike` должен возвращать `{ liked: boolean, likesCount: number }`:
   ```ts
   const count = await Like.countDocuments({ post: postId });
   res.json({ liked: !deleted, likesCount: count });
   ```
2. Фронт — использовать ответ:
   ```ts
   const { data } = await $api.post(`/likes/post/${post._id}`);
   setLikesCount(data.likesCount);
   setIsLiked(data.liked);
   ```
3. Добавить debounce или блокировку повторных кликов.

---

### BUG-09: Кнопка Delete Post видна для ЧУЖИХ постов

**Скрины**: 23, 24, 30, 31
**Симптом**: При открытии чужого поста видна кнопка "Delete Post" и меню с "Удалить" / "Изменить". При попытке удалить чужой пост — нет адекватного оповещения (бэк возвращает 403, но UI это не показывает).

**Файлы**:

- `FE/src/components/posts/postModal/PostModal.tsx`

**Причина**: В `PostModal.tsx` кнопка удаления и меню (три точки) отображаются ВСЕГДА, без проверки `post.author._id === currentUser._id`. Бэкенд правильно проверяет авторство (403), но фронтенд не фильтрует UI-элементы.

**Фикс**: В `PostModal.tsx` добавить проверку:

```tsx
const isMyPost =
  (typeof post.author === 'string' ? post.author : post.author?._id) ===
  currentUser?._id;
```

И показывать кнопки удаления/редактирования только если `isMyPost === true`.

---

## 🟠 ВЫСОКИЕ БАГИ (серьёзные проблемы UX)

### BUG-10: Explore не загружается при первом визите

**Скрины**: 35, 36, 37, 38
**Симптом**: При нажатии на Explore — пустой список. Посты появляются только после перехода на Profile и обратно.

**Файлы**:

- `FE/src/pages/explorePage/ExplorePage.tsx`
- `FE/src/redux/slices/postsSlice.ts`
- `BE/src/routes/postRoutes.ts`

**Причина**: В `postRoutes.ts` маршрут `/explore` объявлен ПОСЛЕ `/:id`:

```ts
router.get('/', getAllPosts);
router.get('/explore', explorePosts); // ← после /:id
router.get('/:id', getPostById);
```

Express матчит `/explore` как `:id = "explore"` и вызывает `getPostById("explore")`, который возвращает ошибку "Некорректный ID поста".

**Фикс**: Переместить `/explore` ПЕРЕД `/:id`:

```ts
router.get('/explore', explorePosts); // ← ДО /:id
router.get('/user/:userId', getUserPosts);
router.get('/:id', getPostById); // ← ПОСЛЕ /explore
router.get('/', getAllPosts);
```

Также на фронте `ExplorePage.tsx` использует `state.posts.posts` (поле `posts`) вместо `state.posts.explore`. Нужно использовать `explore`:

```ts
// БЫЛО:
const { posts, loading, error } = useSelector(
  (state: RootState) => state.posts,
);
// НУЖНО:
const { explore, loading, error } = useSelector(
  (state: RootState) => state.posts,
);
```

---

### BUG-11: Клик на имя/аватар автора открывает пост, а не профиль

**Скрины**: 10, 11, 14, 15
**Симптом**: При нажатии на имя пользователя или его аватар — открывается пост (модалка), а не переход на профиль.

**Файлы**:

- `FE/src/components/home/postItem/PostItem.tsx`
- `FE/src/components/comments/commentContent/CommentContent.tsx`

**Причина**: В `PostItem.tsx` весь `<li>` имеет `onClick={onClick}` (открытие модалки поста). Клик на аватаре и имени "всплывает" (event bubbling) до `<li>` и открывает пост. Нет отдельного обработчика для перехода на профиль.

**Фикс**:

1. На аватаре и имени автора — добавить `onClick` с `e.stopPropagation()` + `navigate('/profile/${authorId}')`.
2. В `CommentContent.tsx` — на аватаре/имени комментатора — аналогично добавить навигацию на профиль.

---

### BUG-12: Вкладки (Notifications, Search, Create) не закрывают предыдущую панель

**Скрины**: 32, 33, 34
**Симптом**: При переключении между вкладками в Sidebar — предыдущая панель остаётся открытой поверх.

**Файлы**:

- `FE/src/components/navigation/sidebar/Sidebar.tsx`

**Причина**: Sidebar использует локальные состояния для каждой панели (Search, Notifications, Create), но при открытии одной панели не закрывает остальные.

**Фикс**: Использовать единый state `activePanel: 'search' | 'notifications' | 'create' | null`:

```ts
const [activePanel, setActivePanel] = useState<string | null>(null);
const togglePanel = (panel: string) => {
  setActivePanel((prev) => (prev === panel ? null : panel));
};
```

---

### BUG-13: Имя автора не обновляется в старых постах после смены username

**Скрин**: 31
**Симптом**: После смены username (natalia → natalia_updated1) — в старых постах автор отображается со старым именем "User".

**Файлы**:

- `BE/src/controllers/postController.ts` → `getAllPosts`, `getPostById`
- `FE/src/components/home/postItem/PostItem.tsx`

**Причина**: В постах хранится только `author: ObjectId` (ссылка). При populate всё должно подтягиваться актуальное. Но: если populate не сработал (поле не загружено), фронтенд fallback — `const authorName = typeof item.author === 'string' ? 'User' : item.author?.username ?? 'User'`. То есть если `author` осталось строкой (ObjectId), имя показывается как "User".

Это может происходить если бэк вернул пост без populate (например, из getAllPosts без полного populate или из кэша).

**Фикс**: Убедиться, что ВСЕ контроллеры, возвращающие посты, делают `.populate('author', 'username profileImage fullName')`. Проверить `getAllPosts`, `getUserPosts`, `getPostById`.

---

### BUG-14: Поиск показывает текущего пользователя в результатах

**Скрин**: 12
**Симптом**: При поиске — в результатах виден собственный профиль.

**Файлы**:

- `BE/src/controllers/searchController.ts`
- `FE/src/components/search/searchContent/SearchContent.tsx`

**Причина**: `searchController.ts` → `searchUsers` не исключает текущего пользователя из результатов. Маршрут не имеет `protect` middleware, поэтому `req.user` недоступен.

**Фикс** (два варианта):

- **На бэке**: Добавить `protect` middleware к маршруту поиска, и в контроллере добавить `{ _id: { $ne: req.user.id } }` в фильтр.
- **На фронте**: В `SearchContent.tsx` фильтровать результаты:
  ```ts
  const filtered = results.filter((u) => u._id !== authUser?._id);
  ```

---

### BUG-15: Текст поста после редактирования не обновляется сразу

**Скрины**: 25, 26, 27
**Симптом**: После нажатия Submit при редактировании поста — текст не меняется в модалке. Виден только после закрытия и повторного открытия.

**Файлы**:

- `FE/src/components/posts/postModal/PostModal.tsx` → `handleSaveEdit`

**Причина**: `handleSaveEdit` вызывает `$api.put(...)` и затем `onUpdatePosts()` (рефетч списка), `setShowEditModal(false)`. Но НЕ обновляет локальный state модалки — `post.description` остаётся старым, пока модалка не перемонтируется.

**Фикс**: После успешного PUT — обновить локальное описание:

```ts
setEditedDescription(newDescription);
// и обновить отображаемый текст поста
post.description = editedDescription; // или использовать state
```

Либо после `onUpdatePosts()` закрыть и снова открыть модалку.

---

### BUG-16: Нет оповещения об успешном обновлении профиля

**Скрины**: 17, 18, 19, 20, 42
**Симптом**: При изменении профиля (фото, био, username) — данные сохраняются в БД, но пользователь не видит оповещения "Profile updated successfully".

**Файлы**:

- `FE/src/components/profiles/editProfileForm/EditProfileForm.tsx` (или `FE/src/pages/editProfilePage/EditProfilePage.tsx`)

**Причина**: В форме редактирования профиля нет toast/alert после успешного обновления. Для создания поста такое оповещение есть (скрин 43).

**Фикс**: После успешного `dispatch(updateProfile(...))` добавить:

```ts
setSuccessMessage('Profile updated successfully');
// или использовать тот же компонент toast, что и при создании поста
```

---

### BUG-17: Меню "три точки" — кнопки "Go to post" / "Copy link" / "Cancel" не работают

**Скрин**: 21
**Симптом**: В выпадающем меню (три точки) работают только "Delete" и "Edit". Остальные три пункта ничего не делают.

**Файлы**:

- `FE/src/components/posts/postModal/PostModal.tsx`

**Причина**: Обработчики для этих действий не реализованы (пустые или отсутствуют).

**Фикс**:

- "Go to post": `navigate('/post/${post._id}')` или скролл к посту.
- "Copy link": `navigator.clipboard.writeText(window.location.origin + '/post/${post._id}')`.
- "Cancel": `setShowActionMenu(false)`.

---

## 🟡 СРЕДНИЕ БАГИ (UX-проблемы)

### BUG-18: Фото в профиле разного размера

**Скрины**: 22, 44, 47
**Симптом**: В сетке постов профиля — фотографии разного размера, не заполняют ячейки равномерно.

**Файлы**:

- `FE/src/components/posts/postsList2/postList2.module.css`

**Фикс**: Для `<img>` в сетке постов профиля:

```css
.postList img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* заполнение без искажения */
  aspect-ratio: 1 / 1; /* квадратные ячейки */
}
```

---

### BUG-19: Нет поля fullName в профиле

**Скрин**: (косвенно — бэкенд поддерживает, фронт не отображает)
**Симптом**: В профиле показывается только username, нет fullName. По требованиям преподавателя — нужен поиск по fullName тоже.

**Файлы**:

- `FE/src/components/profiles/currentUserProfile/CurrentUserProfile.tsx`
- `FE/src/components/profiles/otherProfile/OtherProfile.tsx`

**Причина**: Бэкенд хранит и возвращает `fullName`, поиск по нему работает (searchController ищет по `username` и `fullName`). Но фронтенд компоненты профиля не отображают `fullName`.

**Фикс**: Добавить отображение `user.fullName` под username в профиле.

---

### BUG-20: Аватар непропорционально большой, мало расстояния между счётчиками

**Скрин**: 69
**Симптом**: Аватар профиля слишком большой по отношению к блоку информации. Числа в счётчиках (posts, followers, following) прижаты к названиям.

**Файлы**:

- `FE/src/components/profiles/currentUserProfile/currentUserProfile.module.css`
- `FE/src/components/profiles/otherProfile/otherProfile.module.css`

**Фикс**: Уменьшить размер аватара и добавить gap:

```css
.gradient_border img {
  width: 120px;
  height: 120px;
} /* было больше */
.currentUserProfile_statistic p {
  gap: 4px;
}
.currentUserProfile_statisticCount {
  margin-right: 4px;
}
```

---

### BUG-21: Размеры окна создания поста и текстового поля маленькие

**Скрины**: 39, 50
**Симптом**: Окно создания поста мелкое, смайл-кнопка крупная, поле текста маленькое.

**Файлы**:

- `FE/src/components/create/imageForm/ImageForm.tsx` (или CSS-модуль)
- `FE/src/components/posts/postModal/postModal.module.css`

**Фикс**: Увеличить размеры модалки, textarea, уменьшить emoji-кнопку через CSS.

---

### BUG-22: Иконки лайка и комментария не выровнены по горизонтали

**Скрин**: 13
**Симптом**: В карточке поста — символы лайка и комментария с текстом не выровнены на одной линии.

**Файлы**:

- CSS-модуль PostItem или PostModal

**Фикс**: `display: flex; align-items: center; gap: 8px;` для контейнера иконок.

---

### BUG-23: При клике на сердечко комментария — выделяется имя и аватар автора

**Скрин**: (описан в пункте 9 тестирования)
**Симптом**: При клике на иконку лайка у комментария — визуально выделяется имя автора и аватар.

**Файлы**:

- `FE/src/components/comments/commentContent/commentContent.module.css`

**Причина**: CSS `user-select` не задан, либо event bubbling вызывает выделение текста.

**Фикс**: Добавить `user-select: none;` к контейнеру комментария и `cursor: pointer;` к иконке лайка.

---

### BUG-24: Отписка не генерирует уведомление

**Скрин**: 66
**Симптом**: При отписке от пользователя — у него нет уведомления об этом.

**Файлы**:

- `BE/src/controllers/followController.ts` → `unfollowUser`

**Причина**: `unfollowUser` удаляет документ Follow, но не создаёт notification. В реальных соцсетях (Instagram) отписка тоже НЕ создаёт уведомление.

**Решение**: Это нормальное поведение — Instagram не уведомляет об отписках. Баг можно закрыть как "won't fix".

---

### BUG-25: Notification — кнопка "Read" не работает (404)

**Скрин**: 60
**Симптом**: Клик на кнопку "Read" у уведомления — ничего не происходит.

**Файлы**:

- `FE/src/components/notifications/item/item.tsx`
- `BE/src/routes/notificationRoutes.ts` (проверить наличие маршрута PATCH)

**Причина**: В `item.tsx` вызывается `$api.patch('/notifications/${_id}', { isRead: true })`. Но на бэке есть только `markAsRead` (отмечает ВСЕ уведомления), нет PATCH для одного. Маршрут `PATCH /notifications/:id` не существует → 404.

**Фикс**: Добавить на бэке маршрут `PATCH /notifications/:id` или использовать существующий `markAsRead` (PUT /notifications/read-all).

---

### BUG-26: Валидация email при регистрации — плохое сообщение об ошибке

**Скрины**: 56, 57
**Симптом**: При вводе текста в поле email — ошибка показывается только после нажатия "Sign up", и текст ошибки упоминает только символ @.

**Файлы**:

- `FE/src/components/auth/registerForm/RegisterForm.tsx`

**Фикс**:

1. Добавить inline-валидацию `onBlur` для email (проверка regex).
2. Улучшить текст ошибки: "Please enter a valid email address (e.g. user@example.com)".

---

### BUG-27: Messages / Socket.io не настроены

**Скрин**: 33
**Симптом**: Страница Messages пустая, чат не работает.

**Файлы**:

- `BE/src/controllers/messageController.ts`
- `FE/src/components/messages/`
- `FE/src/api/socket.ts`

**Причина**: Socket.io не настроен, MessageController может быть не полностью реализован.

**Фикс**: Реализовать полноценно.

---

## 🟢 НИЗКИЕ БАГИ (UI/косметика)

### BUG-28: Кнопка "Назад" из профиля в поиск не работает

**Скрин**: (после BUG-14)
**Симптом**: После перехода из Search на профиль — кнопка назад не возвращает в поиск.

**Причина**: Search открывается как sidebar-панель, а не как отдельная страница. `navigate(-1)` работает для страниц, но не для панелей.

**Фикс**: Управлять историей панелей через state или URL query params.

---

### BUG-29: Отступы между комментариями отсутствуют

**Скрин**: 4-1
**Симптом**: Комментарии прижаты друг к другу без отступов.

**Файлы**:

- `FE/src/components/comments/commentContent/commentContent.module.css`

**Фикс**: Добавить `margin-bottom: 12px;` или `gap: 12px;` к `.comment`.

---

### BUG-30: Адаптив — проверить для разных экранов

**Симптом**: Не проверена адаптивная вёрстка.

**Фикс**: Добавить media queries для мобильных устройств (375px, 768px, 1024px).

---

## 📋 ПОРЯДОК ИСПРАВЛЕНИЯ (рекомендация)

### Фаза 1 — Критичная архитектура (делать ПЕРВЫМ):

1. **BUG-10** — Fix route order `/explore` before `/:id` (1 строка)
2. **BUG-07** — Удалить виртуальные поля followers/following, использовать `Follow.countDocuments()`
3. **BUG-02** — Исправить счётчик комментариев (удалить виртуальное поле, использовать `countDocuments`)
4. **BUG-04** — Profile: показывать только свои посты
5. **BUG-06** — Счётчик постов: загружать реальные данные при входе в профиль

### Фаза 2 — Лайки (всё связано, делать вместе):

6. **BUG-01** — Убрать глобальный loading, добавить isLiked state
7. **BUG-08** — Возвращать likesCount + liked из toggle
8. **BUG-03** — Лайки комментариев: синхронизировать Comment.likes[]

### Фаза 3 — UX-проблемы:

9. **BUG-09** — Скрыть Delete/Edit для чужих постов
10. **BUG-11** — Клик на автора → профиль (stopPropagation + navigate)
11. **BUG-12** — Sidebar: одна панель одновременно
12. **BUG-15** — Обновление текста после редактирования
13. **BUG-16** — Toast при обновлении профиля
14. **BUG-14** — Исключить себя из поиска
15. **BUG-13** — Проверить populate во всех контроллерах

### Фаза 4 — Messages / Socket.io:

16. **BUG-27** - Настроить Messages / Socket.io

### Фаза 5 — Стилизация:

17. **BUG-18** — object-fit: cover для фото в сетке
18. **BUG-19** — Отображать fullName
19. **BUG-20** — Размер аватара и spacing счётчиков
20. **BUG-21** — Размеры окна создания поста
21. **BUG-22** — Выравнивание иконок
22. **BUG-23** — user-select: none
23. **BUG-29** — Отступы комментариев
24. **BUG-30** — Адаптив

### Далее остальные баги

### Хронология нахождения багов и их перечень. 12.02.26

### Баги после внесения изменений и проверки. 12.02.26 около 23.00
Часть багов пофиксено. Но:
1. Вкладка Home:
   1.1. при клике на лайк к любому посту независимо от очередности, не происходит изменение сердечка на красный цвет, и нет изменения количества лайков. Но данные в БД сохранились и у пользователя, чей пост я лайкнула, а также пришло оповещение в Notification. (Скрин 70, 71)
   1.2. Как и прежде, не отражается количество комментариев, хоть они на самом деле есть.
2. Когда я открыла чужой пост, то есть несколько багов:
   2.1. после того, как я лайкнула пост или комментарий – нет изменений цвета лайка и нет изменения в количестве лайков.
   1.3. относительно комментариев: нет общего количества комментариев к посту, хоть они на самом деле есть. Только при добавлении нового комментария появляется 1, но после закрытия поста и открытия его снова, количество постов = 0. (Скрин 72, 73)
   2.2. ниже количества постов указана дата. Вероятно, это дата оставления последнего поста. Любой даты там быть не должно.
   2.3. Кликнув на имя в самом верху поста, нет перехода на профиль. Ниже - есть возможность перейти в профиль пользователя, оставившего комментарий (Скрин 74)
3. Когда я захожу в Profile и выбираю любой из своих постов, то есть несколько багов (скрин 75):
   3.1. нет моей аватарки и того, под каким именем я залогинилась,
   3.2. нет текста к посту и всего, что отражалось раньше, комментариев с лайками;
   3.3. иконка комментариев огромного размера,
   3.4. дата комментария, чего не должно быть;
   3.5. нет перехода к окну, в котором есть CRUD-операции с постом (трех точек в правом верхнем углу, нажимая на которые я могу вызвать окно с перечнем про удалить, изменить свой пост, получить линк, отменить и т.д.)
4. поведение с вкладками Notifications, Create, Profile. Все раннее открытые вкладки закрываются, при переходе с Home на Search, Explore, Messages, но:
   4.1. после Create нажимаю на вкладку Profile, то окно Create не закрывается, а поверх окна Profile находится окно Create. Пару раз также было после Search (Search -> Profile), после Notifications (Notifications -> Profile). Разово притормаживание открывания вкладок.
   т.е. при нажимании слева в списке на Profile, открытые раннее на один шаг вкладки (Create, Search или Notifications) становятся поверх него.(скрин 76)
   4.2. когда клацаю на Search, Notification, Create, то окно появляется, но сами слова «Search», «Notification», «Create» не выделяется жирным (скрин 77)
5. не работает Messages: со своего профиля выбираю другой профиль, нажимаю на кнопку “Message”, но появляется надпись Dialоg, Select a dialogе станица не найдена (дважды текст) и выбрать диалог нельзя (скрин 78)
6. Если пройти путь Home –> перейти в чужой пост –> в моем комментарии клацнуть на мой ник -> перейти в мой профиль, то вернуться назад в пост, где я была, клацнув на кнопку влева в браузере, я не могу
7. В Notifications нет возможности перейти к посту, который был лайкнут или с комментарием или на профиль человека (скрин 79)
8. по стилям.


### Баги после перезапуска серверов. 13.02.26 около 3.00
