import { Pagination } from './pagination';

export interface INotification {
  id: string;
  message: string;
  navigation: string;
  date: Date;
  read: boolean;
}

export interface INotificationDTO {
  unread: number;
  page: Pagination<INotification>;
}

export const PAGE_SIZE = 10;
