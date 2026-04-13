import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import {
  deleteUser,
  disableUsersSuccess,
  getAllCustomers,
  getAllDisableUsers,
  getCustomerOverview,
  getMyUser,
  getUser,
  getUsersPage,
  mergeUsers,
  resendToken,
  restore,
  saveUser,
  setRole,
  updateMyPhoto,
  updateMyUser,
  userFailure,
  userSaveSuccess,
  userSelected,
  userSuccess,
} from '../user.actions';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Role, Token } from '../../interfaces/token';
import { getLocale } from '../../util/helper';
import { Pagination } from '../../interfaces/pagination';
import { IOverview, IUserAll } from '../../interfaces/user';
import { IApiResponse, success, successResponse } from '../../interfaces/common';
import { ToastType } from '../../shared/toast/toast.model';
import { loginSuccess } from '../auth.actions';
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class UserEffects {
  translate: TranslateService = inject(TranslateService);
  actions: Actions = inject(Actions);
  userService: UserService = inject(UserService);
  router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getUsersPage),
    switchMap(({ page, sort, direction, size, filter }) => effectRequest(
      this.userService.getUsersPage(page, sort, direction, size, filter)
        .pipe(switchMap((value: Pagination<IUserAll>) => of(userSuccess({ data: { kind: 'pagination', value } })))),
      action => action,
      userFailure,
    )),
  ));

  getAllCustomers$ = createEffect(() => this.actions.pipe(
    ofType(getAllCustomers),
    switchMap(() => effectRequest(
      this.userService.getCustomers()
        .pipe(switchMap((value: IUserAll[]) => of(userSuccess({ data: { kind: 'list', value } })))),
      action => action,
      userFailure,
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getUser),
    switchMap(({ id }) => effectRequest(
      this.userService.getUser(id)
        .pipe(switchMap((selected?: IUserAll) => of(userSelected({ selected })))),
      action => action,
      userFailure,
    )),
  ));

  findMe$ = createEffect(() => this.actions.pipe(
    ofType(getMyUser),
    switchMap(() => effectRequest(
      this.userService.getMyUser().pipe(switchMap((selected?: IUserAll) =>
        of(userSelected({ selected, profile: true })))),
      action => action,
      userFailure,
    )),
  ));

  overviewData$ = createEffect(() => this.actions.pipe(
    ofType(getCustomerOverview),
    switchMap(({ id }) => effectRequest(
      this.userService.getCustomerOverview(id)
        .pipe(switchMap((value: IOverview) => of(userSuccess({ data: { kind: 'overview', value } })))),
      action => action,
      userFailure,
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(saveUser),
    switchMap(({ user, role }) => effectRequest(
      this.userService.saveUser(user, role).pipe(switchMap((response: { response: IApiResponse, key: string }) => {
        const message = this.translate.instant(response.key, { displayName: response.response.name });
        const path = `users/${ response.response.id }`;
        return successResponse(userSaveSuccess, message, path, 'users');
      })),
      action => action,
      userFailure,
    )),
  ));

  setRole$ = createEffect(() => this.actions.pipe(
    ofType(setRole),
    switchMap(({ id, role, displayName, action }) => effectRequest(
      this.userService.setRole(id, role).pipe(switchMap(() => this.requestSuccess(`USER.ROLES.${ action }`,
        displayName, `users/${ id }`, this.translate.instant(`COMMON.ROLES.${ role }`)))),
      action => action,
      userFailure,
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateMyUser),
    switchMap(({ user, redirectUrl }) => effectRequest(
      this.userService.updateMyUser(user).pipe(switchMap((response: Token) => {
        const message = this.translate.instant('COMMON.PROFILE.UPDATED.MESSAGE',
          { displayName: response.user.displayName });
        const lang = user.locale;
        return success(userSaveSuccess, message ? message : message, undefined, undefined, undefined,
          loginSuccess({
            token: response,
            queryParams: { state: btoa(JSON.stringify({ returnUrl: redirectUrl, lang })) },
          }));
      })),
      action => action,
      userFailure,
    )),
  ));

  updatePhoto$ = createEffect(() => this.actions.pipe(
    ofType(updateMyPhoto),
    switchMap(({ file }) => effectRequest(
      this.userService.updateMyPhoto(file).pipe(switchMap((response: Token) => {
        const lang = getLocale(this.translate.getCurrentLang()).language;
        return success(userSaveSuccess, 'COMMON.PROFILE.UPDATED.PHOTO', undefined, undefined, undefined,
          loginSuccess({
            token: response,
            queryParams: { state: btoa(JSON.stringify({ returnUrl: `/${ lang }/auth/profile`, lang })) },
          }));
      })),
      action => action,
      userFailure,
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteUser),
    switchMap(({ id, displayName }) => effectRequest(
      this.userService.deleteUser(id).pipe(switchMap(() =>
        this.requestSuccess('USER.DELETED.MESSAGE', displayName, undefined, undefined, 'warning', true))),
      action => action,
      userFailure,
    )),
  ));

  restore$ = createEffect(() => this.actions.pipe(
    ofType(restore),
    switchMap(({ id, user }) => effectRequest(
      this.userService.restore(id, user)
        .pipe(switchMap((response: IApiResponse) => this.requestSuccess('USER.RESTORE.MESSAGE', response.name))),
      action => action,
      userFailure,
    )),
  ));

  resend$ = createEffect(() => this.actions.pipe(
    ofType(resendToken),
    switchMap(({ id }) => effectRequest(
      this.userService.resendToken(id)
        .pipe(switchMap(() => this.requestSuccess('USER.ACTIVATION_RESEND.MESSAGE'))),
      action => action,
      userFailure,
    )),
  ));

  getAllDisableUsers$ = createEffect(() => this.actions.pipe(
    ofType(getAllDisableUsers),
    switchMap(() => effectRequest(
      this.userService.getAllDisableUsers()
        .pipe(switchMap((users: IUserAll[]) => of(disableUsersSuccess(users ? { users } : { users: [] })))),
      action => action,
      userFailure,
    )),
  ));

  mergeUsers$ = createEffect(() => this.actions.pipe(
    ofType(mergeUsers),
    switchMap(({ oldUserId, newUserId }) => effectRequest(
      this.userService.mergeUsers(oldUserId, newUserId)
        .pipe(switchMap(() => this.requestSuccess('USER.MERGE.SUCCESS'))),
      action => action,
      userFailure,
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(userSelected),
    tap(({ selected, profile }) => {
      if (!profile) {
        this.router.navigate([this.translate.getCurrentLang(), 'users', selected?.id]);
      }
    }),
  ), { dispatch: false });

  private requestSuccess(
    key: string,
    displayName?: string,
    path?: string,
    role?: Role,
    toastType?: ToastType,
    reload: boolean = false,
  ) {
    const message = this.translate.instant(key, { role, displayName });
    return success(userSaveSuccess, message, path, reload, toastType);
  }
}
