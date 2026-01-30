import { IMenu, IUserAll } from './user';

export interface Token {
  tokenAccess: string;
  user: IUserAll;
  menus: IMenu[];
}

export enum Role {
  admin = 'ROLE_ADMIN',
  manager = 'ROLE_MANAGER',
  roomAdmin = 'ROLE_ROOM_ADMIN',
  professional = 'ROLE_PROFESSIONAL',
  customer = 'ROLE_CUSTOMER'
}
