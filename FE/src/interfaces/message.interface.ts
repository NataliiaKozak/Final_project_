export interface IMessage {
  _id: string;
  text: string; // на бэке это обязательное поле
  // опционально, если когда-нибудь добавишь поддержку картинок в сообщениях
  imageUrl?: string;

  // в getMessages ты делаешь populate, поэтому тип — id или объект
  sender: string | { _id: string; username: string; profileImage?: string };
  recipient: string | { _id: string; username: string; profileImage?: string };

  createdAt: string; // timestamps у схемы включены
}