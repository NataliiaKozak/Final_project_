import type { IPost } from '../interfaces/post.interface';

export interface PopulatedAuthor {
  _id: string;
  username: string;
  profileImage?: string;
  fullName?: string;
}

export function isPopulatedAuthor(author: IPost['author']): author is PopulatedAuthor {
  return typeof author === 'object' && author !== null && '_id' in author;
}

export function getAuthorInfo(author: IPost['author']): {
  id: string;
  name: string;
  image: string | undefined;
} {
  if (isPopulatedAuthor(author)) {
    return { id: author._id, name: author.username, image: author.profileImage };
  }
  return { id: author, name: 'User', image: undefined };
}
