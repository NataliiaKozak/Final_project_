import { $api } from '../api';
import type { IUser } from '../../interfaces/user.interface';

export const getUserByIdApi = async (userId: string): Promise<IUser> => {
  try {
    const { data } = await $api.get<IUser>(`/users/${userId}`);
    return data;
  } catch (e) {
    console.error(e);
    throw new Error('Ошибка при получении пользователя');
  }
};

