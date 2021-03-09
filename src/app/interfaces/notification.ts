export interface INotification {
  id: string;
  message: string;
  navigation: string;
  date: Date;
  read: boolean;
}

export const PAGE_SIZE = 100;
