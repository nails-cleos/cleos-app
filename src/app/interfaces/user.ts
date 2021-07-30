export interface IUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dob?: string;
  enabled?: boolean;
  deleted?: boolean;
  provider?: string;
  lang?: string;
  username?: string;
  email?: string;
  password?: string;
  authorities?: IAuthority[];
  imageUrl?: string;
  image?: any;
  code?: string | null;
  referralMax?: number;
  completed?: boolean;
}

export interface IUserAll {
  id: string;
  firstName?: string;
  lastName?: string;
  provider: string;
  username: string;
  email: string;
  authorities: IAuthority[];
  imageUrl?: string;
  lang: string;
  phone?: string;
  dob?: string;
  referralMax?: number;
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
