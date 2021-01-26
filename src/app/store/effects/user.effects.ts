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

@Injectable()
export class UserEffects {

  @Effect()
  getAll$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.GET_ALL)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.userService.getAll(payload.active, payload.direction, payload.page).pipe(
        switchMap((response: any) => {
          return of(new fromActionsUser.UserSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
      );
    })
  );

  @Effect()
  findOne$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.FIND_USER)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.userService.getById(payload).pipe(
        switchMap((response: any) => {
          return of(new fromActionsUser.UserSelected({user: response}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
      );
    })
  );

  @Effect()
  findMe$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.FIND_ME)).pipe(
    map((action: any) => action.payload),
    switchMap(() => {
      return this.userService.getMe().pipe(
        switchMap((response: any) => {
          return of(new fromActionsUser.UserSelected({user: response, profile: true}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
      );
    })
  );

  @Effect()
  save$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.SAVE_USER)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      switch (payload.role) {
        case Role.Customer:
          return this.userService.addCustomer(payload.user).pipe(
            switchMap((response: any) => {
              const message = this.translate.instant('USER.ADD.CUSTOMER', {username: response.username});
              return of(new fromActionsUser.UserSaveSuccess({message}));
            }),
            catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
          );
        case Role.Professional:
          return this.userService.addProfessional(payload.user).pipe(
            switchMap((response: any) => {
              const message = this.translate.instant('USER.ADD.PROFESSIONAL', {username: response.username});
              return of(new fromActionsUser.UserSaveSuccess({message}));
            }),
            catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
          );
        default:
          return this.userService.update(payload.user).pipe(
            switchMap((response: any) => {
              const message = this.translate.instant('USER.UPDATED.MESSAGE', {username: response.username});
              return of(new fromActionsUser.UserSaveSuccess({message}));
            }),
            catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
          );
      }
    })
  );

  @Effect()
  update$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.UPDATE_USER)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.userService.updateMe(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('PROFILE.MESSAGE', {username: response.username});
          return of(new fromActionsUser.UserSaveSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
      );
    })
  );

  @Effect()
  delete$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.USER_DELETE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.userService.delete(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('USER.DELETED.MESSAGE', {username: response.username});
          return of(new fromActionsUser.UserSaveSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
      );
    })
  );

  @Effect()
  resend$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.RESEND_USER_TOKEN)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.userService.resend(payload).pipe(
        switchMap(() => {
          const message = this.translate.instant('USER.ACTIVATION_RESEND.MESSAGE');
          return of(new fromActionsUser.UserSaveSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
      );
    })
  );

  @Effect()
  changePassword$ = this.actions$.pipe(ofType(fromActionsUser.UserActionTypes.CHANGE_PASSWORD)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.userService.changePassword(payload.oldPassword, payload.password).pipe(
        switchMap(() => {
          const message = this.translate.instant('USER.CHANGE_PASSWORD.MESSAGE');
          return of(new fromActionsUser.ChangePasswordSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsUser.UserFailure({error: err.error})))
      );
    })
  );

  @Effect({dispatch: false})
  dataSuccess$ = this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.USER_SUCCESS)
  );

  @Effect({dispatch: false})
  selectedData$ = this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.USER_SELECTED),
    tap((data: any) => {
      if (!data.payload.profile) {
        this.router.navigate(['user', data.payload.user.id]);
      }
    })
  );

  @Effect({dispatch: false})
  saveSuccess$ = this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.USER_SAVE_SUCCESS),
    tap(() => {
      this.router.navigate(['users']);
    })
  );

  @Effect({dispatch: false})
  changePasswordSuccess$ = this.actions$.pipe(
    ofType(fromActionsUser.UserActionTypes.CHANGE_PASSWORD_SUCCESS)
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private userService: UserService,
              private router: Router) {
  }
}
