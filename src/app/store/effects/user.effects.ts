import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
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

  @Effect()
  getAll$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.getAll(payload.active, payload.direction, payload.page,
      payload.size).pipe(
      switchMap((response: any) => of(new fromActionsUser.UserSuccess(response ? response : {
        content: [],
        totalElements: 0
      }))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  );

  @Effect()
  getAllCustomers$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.getAllCustomers)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.userService.getAllCustomers().pipe(
      switchMap((response: any) => of(new fromActionsUser.UserSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  );

  @Effect()
  findOne$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.findUser)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.getById(payload).pipe(
      switchMap((response: any) => of(new fromActionsUser.UserSelected({user: response}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  );

  @Effect()
  findMe$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.findMe)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.userService.getMe().pipe(
      switchMap((response: any) => of(new fromActionsUser.UserSelected({user: response, profile: true}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  );

  @Effect()
  save$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.saveUser)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      switch (payload.role) {
        case Role.customer:
          return this.userService.addCustomer(payload.user).pipe(
            switchMap((response: any) => {
              const message = this.translate.instant('USER.ADD.CUSTOMER', {username: response.username});
              return of(new fromActionsUser.UserSaveSuccess({message}));
            }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
          );
        case Role.professional:
          return this.userService.addProfessional(payload.user).pipe(
            switchMap((response: any) => {
              const message = this.translate.instant('USER.ADD.PROFESSIONAL', {username: response.username});
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
  );

  @Effect()
  setRole$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.setRole)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.setRole(payload.user.id, payload.role).pipe(
      switchMap(() => {
        const role = this.translate.instant(`COMMON.ROLES.${payload.role}`);
        const message = this.translate.instant(`USER.ROLE.${payload.action}`, {role, username: payload.user.username});
        return of(new fromActionsUser.UserSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  );

  @Effect()
  update$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.updateUser)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.updateMe(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('PROFILE.UPDATED.MESSAGE', {username: response.user.username});
        return of(new LoginSuccess({
          response, queryParams: {
            returnUrl: 'profile'
          }
        }), new fromActionsUser.UserSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  );

  @Effect()
  updatePhoto$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.updatePhoto)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.updateMePhoto(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('PROFILE.UPDATED.PHOTO');
        return of(new LoginSuccess({
          response, queryParams: {
            returnUrl: 'profile'
          }
        }), new fromActionsUser.UserSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  );

  @Effect()
  delete$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.userDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.delete(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('USER.DELETED.MESSAGE', {username: response.username});
        return of(new fromActionsUser.UserSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  );

  @Effect()
  resend$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.resendUserToken)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.resend(payload).pipe(
      switchMap(() => {
        const message = this.translate.instant('USER.ACTIVATION_RESEND.MESSAGE');
        return of(new fromActionsUser.UserSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  );

  @Effect()
  changePassword$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.changePassword)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.changePassword(payload.username, payload.oldPassword, payload.password).pipe(
      switchMap(() => {
        const message = this.translate.instant('USER.CHANGE_PASSWORD.MESSAGE');
        return of(new fromActionsUser.ChangePasswordSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
    ))
  );

  @Effect({dispatch: false})
  dataSuccess$ = this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.userSuccess)
  );

  @Effect({dispatch: false})
  selectedData$ = this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.userSelected),
    tap((data: any) => {
      if (!data.payload.profile) {
        this.router.navigate(['user', data.payload.user.id]);
      }
    })
  );

  @Effect({dispatch: false})
  saveSuccess$ = this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.userSaveSuccess));

  @Effect({dispatch: false})
  changePasswordSuccess$ = this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.changePasswordSuccess)
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private userService: UserService,
              private router: Router) {
  }
}
