export interface IUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  deleted?: boolean;
  provider?: string;
  lang?: string;
  username?: string;
  email?: string;
  password?: string;
  authorities?: IAuthority[];
  imageUrl?: string;
  code?: string | null;
}

export interface IUserAll {
  id: string;
  firstName: string;
  lastName: string;
  provider: string;
  username: string;
  email: string;
  authorities: IAuthority[];
  imageUrl?: string;
  lang?: string;
}

export interface IAuthority {
  authority: string;
}

export interface IMenu {
  name: string;
  path: string;
  icon: string;
}

export class User implements IUser {
  constructor() {
  }
}

export const PAGE_SIZE = 10;
