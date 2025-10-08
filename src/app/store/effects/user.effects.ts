import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import * as fromActionsUser from '../user.actions';
import {
  DeleteUser,
  GetCustomerOverview,
  getUser,
  GetUsersPage,
  MergeUsers,
  ResendToken,
  Restore,
  SaveUser,
  SetRole,
  UpdateMyUser,
  UpdateMyPhoto,
  UserActionTypes,
  UserFailure,
  UserSaveSuccess,
  UserSelected,
  UserSuccess,
} from '../user.actions';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Role, Token } from '../../interfaces/token';
import { LoginSuccess } from '../auth.actions';
import { getLocale } from '../../util/helper';
import { Pagination } from '../../interfaces/pagination';
import { IOverview, IUser } from '../../interfaces/user';
import { IApiResponse, success } from '../../interfaces/common';
import { ToastType } from '../../shared/toast/toast.model';

@Injectable()
export class UserEffects {

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(UserActionTypes.getUsersPage),
    switchMap((action: GetUsersPage) =>
      this.userService.getUsersPage(action.page, action.sort, action.direction, action.size, action.filter).pipe(
        switchMap((response: Pagination<IUser>) => of(new UserSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new UserFailure(err.error))),
      )),
  ));

  getAllCustomers$ = createEffect(() => this.actions.pipe(
    ofType(UserActionTypes.getAllCustomers),
    switchMap(() =>
      this.userService.getCustomers().pipe(
        switchMap((response: IUser[]) => of(new UserSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new UserFailure(err.error))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(UserActionTypes.getUser),
    switchMap((action: getUser) =>
      this.userService.getUser(action.id).pipe(
        switchMap((response?: IUser) => of(new UserSelected(response))),
        catchError((err: HttpErrorResponse) => of(new UserFailure(err.error))),
      )),
  ));

  findMe$ = createEffect(() => this.actions.pipe(
    ofType(UserActionTypes.getMyUser),
    switchMap(() =>
      this.userService.getMyUser().pipe(
        switchMap((response?: IUser) => of(new UserSelected(response, true))),
        catchError((err: HttpErrorResponse) => of(new UserFailure(err.error))),
      )),
  ));

  overviewData$ = createEffect(() => this.actions.pipe(
    ofType(UserActionTypes.getCustomerOverview),
    switchMap((action: GetCustomerOverview) =>
      this.userService.getCustomerOverview(action.id).pipe(
        switchMap((response: IOverview) => of(new UserSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new UserFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(UserActionTypes.saveUser),
    switchMap((action: SaveUser) =>
      this.userService.saveUser(action.user, action.role).pipe(
        switchMap((response: { response: IApiResponse, key: string }) => this.requestSuccess(response.key,
          response.response.name, `users/${ response.response.id }`)),
        catchError((err: HttpErrorResponse) => of(new UserFailure(err.error))),
      )),
  ));

  setRole$ = createEffect(() => this.actions.pipe(
    ofType(UserActionTypes.setRole),
    switchMap((action: SetRole) =>
      this.userService.setRole(action.id, action.role).pipe(
        switchMap(() => this.requestSuccess(`USER.ROLES.${ action.action }`,
          action.displayName, `users/${ action.id }`, this.translate.instant(`COMMON.ROLES.${ action.role }`))),
        catchError((err: HttpErrorResponse) => of(new UserFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(UserActionTypes.updateMyUser),
    switchMap((action: UpdateMyUser) =>
      this.userService.updateMyUser(action.user).pipe(
        switchMap((response: Token) => {
          const message = this.translate.instant('COMMON.PROFILE.UPDATED.MESSAGE',
            { displayName: response.user.displayName });
          const lang = action.user.lang;
          return success(UserSaveSuccess, action.message ? action.message : message, undefined, undefined, undefined,
            new LoginSuccess(response, { state: btoa(JSON.stringify({ returnUrl: action.redirectUrl, lang })) }));
        }),
        catchError((err: HttpErrorResponse) => of(new UserFailure(err.error))),
      )),
  ));

  updatePhoto$ = createEffect(() => this.actions.pipe(
    ofType(UserActionTypes.updateMyPhoto),
    switchMap((action: UpdateMyPhoto) =>
      this.userService.updateMyPhoto(action.file).pipe(
        switchMap((response: Token) => {
          const message = this.translate.instant('COMMON.PROFILE.UPDATED.PHOTO');
          const lang = getLocale(this.translate.currentLang).language;
          return success(UserSaveSuccess, message, undefined, undefined, undefined,
            new LoginSuccess(response,
              { state: btoa(JSON.stringify({ returnUrl: `/${ lang }/auth/profile`, lang })) }));
        }),
        catchError((err: HttpErrorResponse) => of(new UserFailure(err.error))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(UserActionTypes.deleteUser),
    switchMap((action: DeleteUser) =>
      this.userService.deleteUser(action.id).pipe(
        switchMap(() =>
          this.requestSuccess('USER.DELETED.MESSAGE', action.displayName, undefined, undefined, 'warning')),
        catchError((err: HttpErrorResponse) => of(new UserFailure(err.error))),
      )),
  ));

  restore$ = createEffect(() => this.actions.pipe(
    ofType(UserActionTypes.restore),
    switchMap((action: Restore) =>
      this.userService.restore(action.id, action.user).pipe(
        switchMap((response: IUser) => this.requestSuccess('USER.RESTORE.MESSAGE', response.displayName)),
        catchError((err: HttpErrorResponse) => of(new UserFailure(err.error))),
      )),
  ));

  resend$ = createEffect(() => this.actions.pipe(
    ofType(UserActionTypes.resendToken),
    switchMap((action: ResendToken) =>
      this.userService.resendToken(action.id).pipe(
        switchMap(() => this.requestSuccess('USER.ACTIVATION_RESEND.MESSAGE')),
        catchError((err: HttpErrorResponse) => of(new UserFailure(err.error))),
      )),
  ));

  getAllDisableUsers$ = createEffect(() => this.actions.pipe(
    ofType(UserActionTypes.getAllDisableUsers),
    switchMap(() =>
      this.userService.getAllDisableUsers().pipe(
        switchMap((response: IUser[]) => of(new fromActionsUser.DisableUsersSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new UserFailure(err.error))),
      )),
  ));

  mergeUsers$ = createEffect(() => this.actions.pipe(
    ofType(UserActionTypes.mergeUsers),
    switchMap((action: MergeUsers) =>
      this.userService.mergeUsers(action.oldUserId, action.newUserId).pipe(
        switchMap(() => this.requestSuccess('USER.MERGE.SUCCESS')),
        catchError((err: HttpErrorResponse) => of(new UserFailure(err.error))),
      )),
  ));

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsUser.UserActionTypes.userSuccess),
  ), { dispatch: false });

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsUser.UserActionTypes.userSelected),
    tap((data: UserSelected) => {
      if (!data.profile) {
        this.router.navigate([this.translate.currentLang, 'users', data.selected?.id]);
      }
    }),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsUser.UserActionTypes.userSaveSuccess)), { dispatch: false });

  disableUsersSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsUser.UserActionTypes.disableUsersSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions, private userService: UserService,
              private router: Router) {
  }

  private requestSuccess(key: string, displayName?: string, path?: string, role?: Role,
    toastType?: ToastType): Observable<UserSaveSuccess> {
    const message = this.translate.instant(key, { role, displayName });
    return success(UserSaveSuccess, message, path, undefined, toastType);
  }
}
