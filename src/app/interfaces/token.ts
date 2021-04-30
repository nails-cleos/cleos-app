import { IUser } from './user';

export interface Token {
  tokenAccess: string;
  user: IUser;
}

export enum Role {
  admin = 'ROLE_ADMIN',
  customer = 'ROLE_CUSTOMER',
  professional = 'ROLE_PROFESSIONAL'
}
