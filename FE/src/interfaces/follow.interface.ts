export interface IFollowItem {
  _id: string;
  username: string;
  profileImage?: string;
}

// Локальные счётчики в UI
export interface ILocalFollow {
  followers: 'Loading...' | number;
  following: 'Loading...' | number;
}

// Контроллеры getFollowers/getFollowing возвращают популяцию пользователя.
// Мы отдаем на фронт только карточку юзера.