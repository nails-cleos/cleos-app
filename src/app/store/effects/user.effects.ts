import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
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

@Injectable()
export class UserEffects {
  translate: TranslateService = inject(TranslateService);
  actions: Actions = inject(Actions);
  userService: UserService = inject(UserService);
  router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getUsersPage),
    switchMap(({ page, sort, direction, size, filter }) =>
      this.userService.getUsersPage(page, sort, direction, size, filter).pipe(
        switchMap((data: Pagination<IUserAll>) => of(userSuccess({ data }))),
        catchError((err: HttpErrorResponse) => of(userFailure({ error: err.error }))),
      )),
  ));

  getAllCustomers$ = createEffect(() => this.actions.pipe(
    ofType(getAllCustomers),
    switchMap(() =>
      this.userService.getCustomers().pipe(
        switchMap((data: IUserAll[]) => of(userSuccess({ data }))),
        catchError((err: HttpErrorResponse) => of(userFailure({ error: err.error }))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getUser),
    switchMap(({ id }) =>
      this.userService.getUser(id).pipe(
        switchMap((selected?: IUserAll) => of(userSelected({ selected }))),
        catchError((err: HttpErrorResponse) => of(userFailure({ error: err.error }))),
      )),
  ));

  findMe$ = createEffect(() => this.actions.pipe(
    ofType(getMyUser),
    switchMap(() =>
      this.userService.getMyUser().pipe(
        switchMap((selected?: IUserAll) => of(userSelected({ selected, profile: true }))),
        catchError((err: HttpErrorResponse) => of(userFailure({ error: err.error }))),
      )),
  ));

  overviewData$ = createEffect(() => this.actions.pipe(
    ofType(getCustomerOverview),
    switchMap(({ id }) =>
      this.userService.getCustomerOverview(id).pipe(
        switchMap((data: IOverview) => of(userSuccess({ data }))),
        catchError((err: HttpErrorResponse) => of(userFailure({ error: err.error }))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(saveUser),
    switchMap(({ user, role }) =>
      this.userService.saveUser(user, role).pipe(
        switchMap((response: { response: IApiResponse, key: string }) => {
          const message = this.translate.instant(response.key, { displayName: response.response.name });
          const path = `users/${response.response.id}`;
          return successResponse(userSaveSuccess, message, path, 'users');
        }),
        catchError((err: HttpErrorResponse) => of(userFailure({ error: err.error }))),
      )),
  ));

  setRole$ = createEffect(() => this.actions.pipe(
    ofType(setRole),
    switchMap(({ id, role, displayName, action }) =>
      this.userService.setRole(id, role).pipe(
        switchMap(() => this.requestSuccess(`USER.ROLES.${action}`,
          displayName, `users/${id}`, this.translate.instant(`COMMON.ROLES.${role}`))),
        catchError((err: HttpErrorResponse) => of(userFailure({ error: err.error }))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateMyUser),
    switchMap(({ user, redirectUrl }) =>
      this.userService.updateMyUser(user).pipe(
        switchMap((response: Token) => {
          const message = this.translate.instant('COMMON.PROFILE.UPDATED.MESSAGE',
            { displayName: response.user.displayName });
          const lang = user.lang;
          return success(userSaveSuccess, message ? message : message, undefined, undefined, undefined,
            loginSuccess({
              token: response,
              queryParams: { state: btoa(JSON.stringify({ returnUrl: redirectUrl, lang })) },
            }));
        }),
        catchError((err: HttpErrorResponse) => of(userFailure({ error: err.error }))),
      )),
  ));

  updatePhoto$ = createEffect(() => this.actions.pipe(
    ofType(updateMyPhoto),
    switchMap(({ file }) =>
      this.userService.updateMyPhoto(file).pipe(
        switchMap((response: Token) => {
          const message = this.translate.instant('COMMON.PROFILE.UPDATED.PHOTO');
          const lang = getLocale(this.translate.getCurrentLang()).language;
          return success(userSaveSuccess, message, undefined, undefined, undefined,
            loginSuccess({
              token: response,
              queryParams: { state: btoa(JSON.stringify({ returnUrl: `/${lang}/auth/profile`, lang })) },
            }));
        }),
        catchError((err: HttpErrorResponse) => of(userFailure({ error: err.error }))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteUser),
    switchMap(({ id, displayName }) =>
      this.userService.deleteUser(id).pipe(
        switchMap(() =>
          this.requestSuccess('USER.DELETED.MESSAGE', displayName, undefined, undefined, 'warning')),
        catchError((err: HttpErrorResponse) => of(userFailure({ error: err.error }))),
      )),
  ));

  restore$ = createEffect(() => this.actions.pipe(
    ofType(restore),
    switchMap(({ id, user }) =>
      this.userService.restore(id, user).pipe(
        switchMap((response: IApiResponse) => this.requestSuccess('USER.RESTORE.MESSAGE', response.name)),
        catchError((err: HttpErrorResponse) => of(userFailure({ error: err.error }))),
      )),
  ));

  resend$ = createEffect(() => this.actions.pipe(
    ofType(resendToken),
    switchMap(({ id }) =>
      this.userService.resendToken(id).pipe(
        switchMap(() => this.requestSuccess('USER.ACTIVATION_RESEND.MESSAGE')),
        catchError((err: HttpErrorResponse) => of(userFailure({ error: err.error }))),
      )),
  ));

  getAllDisableUsers$ = createEffect(() => this.actions.pipe(
    ofType(getAllDisableUsers),
    switchMap(() =>
      this.userService.getAllDisableUsers().pipe(
        switchMap((users: IUserAll[]) => of(disableUsersSuccess(users ? { users } : { users: [] }))),
        catchError((err: HttpErrorResponse) => of(userFailure({ error: err.error }))),
      )),
  ));

  mergeUsers$ = createEffect(() => this.actions.pipe(
    ofType(mergeUsers),
    switchMap(({ oldUserId, newUserId }) =>
      this.userService.mergeUsers(oldUserId, newUserId).pipe(
        switchMap(() => this.requestSuccess('USER.MERGE.SUCCESS')),
        catchError((err: HttpErrorResponse) => of(userFailure({ error: err.error }))),
      )),
  ));

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(userSuccess),
  ), { dispatch: false });

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(userSelected),
    tap(({ selected, profile }) => {
      if (!profile) {
        this.router.navigate([this.translate.getCurrentLang(), 'users', selected?.id]);
      }
    }),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(userSaveSuccess)), { dispatch: false });

  disableUsersSuccess$ = createEffect(() => this.actions.pipe(
    ofType(disableUsersSuccess),
  ), { dispatch: false });

  private requestSuccess(
    key: string,
    displayName?: string,
    path?: string,
    role?: Role,
    toastType?: ToastType,
  ) {
    const message = this.translate.instant(key, { role, displayName });
    return success(userSaveSuccess, message, path, undefined, toastType);
  }
}
