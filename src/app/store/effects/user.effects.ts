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
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  ));

  getAllCustomers$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.getAllCustomers)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.userService.getAllCustomers().pipe(
      switchMap((response: any) => of(new fromActionsUser.UserSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  ));

  findOne$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.findUser)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.getById(payload).pipe(
      switchMap((response: any) => of(new fromActionsUser.UserSelected({user: response}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  ));

  findMe$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.findMe)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.userService.getMe().pipe(
      switchMap((response: any) => of(new fromActionsUser.UserSelected({user: response, profile: true}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  ));

  overviewData$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.userOverview)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.getOverview(payload).pipe(
      switchMap((response: any) => of(new fromActionsUser.UserSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  ));

  save$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.saveUser)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      switch (payload.role) {
        case Role.customer:
          return this.userService.addCustomer(payload.user).pipe(
            switchMap((response: any) => {
              const message = this.translate.instant('USER.CUSTOMER', {username: response.username});
              return of(new fromActionsUser.UserSaveSuccess({message}));
            }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
          );
        case Role.professional:
          return this.userService.addProfessional(payload.user).pipe(
            switchMap((response: any) => {
              const message = this.translate.instant('USER.PROFESSIONAL', {username: response.username});
              return of(new fromActionsUser.UserSaveSuccess({message}));
            }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
          );
        default:
          return this.userService.update(payload.user).pipe(
            switchMap((response: any) => {
              const message = this.translate.instant('USER.UPDATED.MESSAGE', {username: response.username});
              return of(new fromActionsUser.UserSaveSuccess({message}));
            }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
          );
      }
    })
  ));

  setRole$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.setRole)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.setRole(payload.user.id, payload.role).pipe(
      switchMap(() => {
        const role = this.translate.instant(`COMMON.ROLES.${payload.role}`);
        const message = this.translate.instant(`USER.ROLES.${payload.action}`, {role, username: payload.user.username});
        return of(new fromActionsUser.UserSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  ));

  update$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.updateUser)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.updateMe(payload.user).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('COMMON.PROFILE.UPDATED.MESSAGE', {username: response.user.username});
        return of(new LoginSuccess({
          response, queryParams: {
            returnUrl: payload.redirectUrl
          }
        }), new fromActionsUser.UserSaveSuccess({message: payload.message ? payload.message : message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  ));

  updatePhoto$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.updatePhoto)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.updateMePhoto(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('COMMON.PROFILE.UPDATED.PHOTO');
        return of(new LoginSuccess({
          response, queryParams: {
            returnUrl: '/auth/profile'
          }
        }), new fromActionsUser.UserSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  ));

  delete$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.userDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.delete(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('USER.DELETED.MESSAGE', {username: response.username});
        return of(new fromActionsUser.UserSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  ));

  restore$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.userRestore)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.restore(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('USER.RESTORE.MESSAGE', {username: response.username});
        return of(new fromActionsUser.UserSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  ));

  resend$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.resendUserToken)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.resend(payload).pipe(
      switchMap(() => {
        const message = this.translate.instant('USER.ACTIVATION_RESEND.MESSAGE');
        return of(new fromActionsUser.UserSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  ));

  changePassword$ = createEffect(() => this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.changePassword)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.changePassword(payload.username, payload.oldPassword, payload.password).pipe(
      switchMap(() => {
        const message = this.translate.instant('USER.CHANGE_PASSWORD.MESSAGE');
        return of(new fromActionsUser.ChangePasswordSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  ));

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.userSuccess)
  ), {dispatch: false});

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.userSelected),
    tap((data: any) => {
      if (!data.payload.profile) {
        this.router.navigate(['users', data.payload.user.id]);
      }
    })
  ), {dispatch: false});

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.userSaveSuccess)), {dispatch: false});

  changePasswordSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.changePasswordSuccess)
  ), {dispatch: false});

  constructor(private readonly translate: TranslateService, private actions$: Actions, private userService: UserService,
              private router: Router) {
  }
}
