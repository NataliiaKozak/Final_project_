export interface IFollowItem {
  _id: string;
  username: string;
  profileImage?: string;
}

// Local follow counts in UI (null = loading)
export interface ILocalFollow {
  followers: number | null;
  following: number | null;
}

// Контроллеры getFollowers/getFollowing возвращают популяцию пользователя.
// Мы отдаем на фронт только карточку юзера.