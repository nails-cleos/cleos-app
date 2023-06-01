import { Pipe, PipeTransform } from '@angular/core';
import { getUserName } from '../util/helper';
import { IUser, IUserAll } from '../interfaces/user';

@Pipe({
  name: 'userName'
})
export class UserNamePipe implements PipeTransform {

  transform(user?: IUser | IUserAll): string {
    return getUserName(user);
  }
}
