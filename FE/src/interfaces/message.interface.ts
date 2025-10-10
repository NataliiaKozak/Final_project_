export interface IMessage {
  _id: string;
  text: string; 
  imageUrl?: string;

  // в getMessages - populate, поэтому тип — id или объект
  sender: string | { _id: string; username: string; profileImage?: string };
  recipient: string | { _id: string; username: string; profileImage?: string };

  createdAt: string; // timestamps у схемы включены
}