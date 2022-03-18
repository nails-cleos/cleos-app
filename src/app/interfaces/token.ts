import { IUser } from './user';

export interface Token {
  tokenAccess: string;
  user: IUser;
}

export enum Role {
  admin = 'ROLE_ADMIN',
  manager = 'ROLE_MANAGER',
  professional = 'ROLE_PROFESSIONAL',
  customer = 'ROLE_CUSTOMER'
}
