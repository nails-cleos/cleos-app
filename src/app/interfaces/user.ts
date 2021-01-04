export interface IUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  deleted?: boolean;
  provider?: string;
  username?: string;
  email?: string;
  password?: string;
  authorities?: IAuthority[];
  imageUrl?: string;
}

export interface IAuthority {
  authority: string;
}

export class User implements IUser {
  constructor() {
  }
}

export const PAGE_SIZE = 2;
