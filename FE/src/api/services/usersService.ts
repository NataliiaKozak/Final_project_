// import { $api } from "../api";

// export const getUserByIdApi = async (userId: string) => {
//   try {
//     const { data } = await $api.get(`/user/${userId}`);
//     return data;
//   } catch (e) {
//     console.error(e);
//     throw new Error("Ошибка при получении пользователя");
//   }
// };

//2
import { $api } from '../api';
import type { IUser } from '../../interfaces/api.interface';

export const getUserByIdApi = async (userId: string): Promise<IUser> => {
  try {
    const { data } = await $api.get<IUser>(`/api/users/${userId}`);
    return data;
  } catch (err) {
    console.error(err);
    throw new Error('Ошибка при получении пользователя');
  }
};

// дженерик <IUser> на get и Promise<IUser> — чтобы убрать any и точно соответствовать форме ответа getProfile (с виртуалами и счётчиками).