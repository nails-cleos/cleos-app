import { Pagination } from './pagination';

export interface INotification {
  id: string;
  message: string;
  navigation: string;
  date: number;
  notDate: Date;
  read: boolean;
  deleted: boolean;
}

export interface INotificationDTO {
  unread: number;
  page: Pagination<INotification>;
}

export const PAGE_SIZE = 10;
