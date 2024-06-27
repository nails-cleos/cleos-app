import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsUser from '../user.actions';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Role } from '../../interfaces/token';
import { LoginSuccess } from '../auth.actions';
import { getLocale } from '../../util/helper';

@Injectable()
export class UserEffects {
  getAll$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.getAll(payload.active, payload.direction, payload.page,
      payload.size, payload.filter).pipe(
      switchMap((response: any) => of(new fromActionsUser.UserSuccess(response ? response : {
        content: [],
        totalElements: 0
      }))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
    ))
  ));

  getAllCustomers$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.getAllCustomers)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.userService.getAllCustomers().pipe(
      switchMap((response: any) => of(new fromActionsUser.UserSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
    ))
  ));

  findOne$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.findUser)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.getById(payload).pipe(
      switchMap((response: any) => of(new fromActionsUser.UserSelected({ user: response }))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
    ))
  ));

  findMe$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.findMe)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.userService.getMe().pipe(
      switchMap((response: any) => of(new fromActionsUser.UserSelected({ user: response, profile: true }))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
    ))
  ));

  overviewData$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.userOverview)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.getOverview(payload).pipe(
      switchMap((response: any) => of(new fromActionsUser.UserSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
    ))
  ));

  save$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.saveUser)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      switch (payload.role) {
        case Role.customer:
          return this.userService.addCustomer(payload.user).pipe(
            switchMap((response: any) => {
              const message = this.translate.instant('USER.CUSTOMER', { displayName: response.displayName });
              return of(new fromActionsUser.UserSaveSuccess({ message }));
            }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
          );
        case Role.manager:
          return this.userService.addManager(payload.user).pipe(
            switchMap((response: any) => {
              const message = this.translate.instant('USER.MANAGER', { displayName: response.displayName });
              return of(new fromActionsUser.UserSaveSuccess({ message }));
            }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
          );
        case Role.professional:
          return this.userService.addProfessional(payload.user).pipe(
            switchMap((response: any) => {
              const message = this.translate.instant('USER.PROFESSIONAL', { displayName: response.displayName });
              return of(new fromActionsUser.UserSaveSuccess({ message }));
            }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
          );
        default:
          return this.userService.update(payload.user).pipe(
            switchMap((response: any) => {
              const message = this.translate.instant('USER.UPDATED.MESSAGE', { displayName: response.displayName });
              return of(new fromActionsUser.UserSaveSuccess({ message }));
            }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
          );
      }
    })
  ));

  setRole$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.setRole)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.setRole(payload.user.id, payload.role).pipe(
      switchMap(() => {
        const role = this.translate.instant(`COMMON.ROLES.${ payload.role }`);
        const message = this.translate.instant(`USER.ROLES.${ payload.action }`, { role, displayName: payload.user.displayName });
        return of(new fromActionsUser.UserSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
    ))
  ));

  update$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.updateUser)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.updateMe(payload.user).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('COMMON.PROFILE.UPDATED.MESSAGE', { displayName: response.user.displayName });
        const lang = payload.user.lang;
        return of(new LoginSuccess({
          response, queryParams: {
            state: btoa(JSON.stringify({ returnUrl: payload.redirectUrl, lang }))
          }
        }), new fromActionsUser.UserSaveSuccess({ message: payload.message ? payload.message : message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
    ))
  ));

  updatePhoto$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.updatePhoto)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.updateMePhoto(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('COMMON.PROFILE.UPDATED.PHOTO');
        const lang = getLocale(this.translate.currentLang).language;
        return of(new LoginSuccess({
          response, queryParams: {
            state: btoa(JSON.stringify({ returnUrl: `/${ lang }/auth/profile`, lang }))
          }
        }), new fromActionsUser.UserSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
    ))
  ));

  delete$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.userDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.delete(payload.id).pipe(
      switchMap(() => {
        const message = this.translate.instant('USER.DELETED.MESSAGE', { displayName: payload.displayName });
        return of(new fromActionsUser.UserSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
    ))
  ));

  restore$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.userRestore)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.restore(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('USER.RESTORE.MESSAGE', { displayName: response.displayName });
        return of(new fromActionsUser.UserSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
    ))
  ));

  resend$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.resendUserToken)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.resend(payload).pipe(
      switchMap(() => {
        const message = this.translate.instant('USER.ACTIVATION_RESEND.MESSAGE');
        return of(new fromActionsUser.UserSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
    ))
  ));

  getAllDisableUsers$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.getAllDisableUsers)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.userService.getAllDisableUsers().pipe(
      switchMap((response: any) => of(new fromActionsUser.DisableUsersSuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
    ))
  ));

  mergeUsers$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.mergeUsers)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.mergeUsers(payload).pipe(
      switchMap(() => {
        const message = this.translate.instant(`USER.MERGE.SUCCESS`);
        return of(new fromActionsUser.UserSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({ error: err.error })))
    ))
  ));

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.userSuccess)
  ), { dispatch: false });

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.userSelected),
    tap((data: any) => {
      if (!data.payload.profile) {
        this.router.navigate([this.translate.currentLang, 'users', data.payload.user.id]);
      }
    })
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.userSaveSuccess)), { dispatch: false });

  disableUsersSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.disableUsersSuccess)
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions$: Actions, private userService: UserService,
              private router: Router) {
  }
}
