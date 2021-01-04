import { IUser } from './user';

export interface Token {
  tokenAccess: string;
  user: IUser;
}

export enum Role {
  Admin = 'ROLE_ADMIN',
  Customer = 'ROLE_CUSTOMER',
  Professional = 'ROLE_PROFESSIONAL'
}
