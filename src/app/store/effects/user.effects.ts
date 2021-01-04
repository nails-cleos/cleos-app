import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { UserActionTypes, UserFailure, UserSaveSuccess, UserSelected, UserSuccess } from '../user.actions';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Injectable()
export class UserEffects {

  @Effect()
  getAll$ = this.actions$.pipe(ofType(UserActionTypes.GET_ALL)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.userService.getAll(payload.active, payload.direction, payload.page).pipe(
        switchMap((response: any) => {
          return of(new UserSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new UserFailure({error: err.error})))
      );
    })
  );

  @Effect()
  findOne$ = this.actions$.pipe(ofType(UserActionTypes.FIND_USER)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.userService.getById(payload).pipe(
        switchMap((response: any) => {
          return of(new UserSelected(response));
        }),
        catchError((err: HttpErrorResponse) => of(new UserFailure({error: err.error})))
      );
    })
  );

  @Effect()
  save$ = this.actions$.pipe(ofType(UserActionTypes.SAVE_USER)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.userService.update(payload).pipe(
        switchMap((response: any) => {
          return of(new UserSaveSuccess({message: `User ${response.username} updated`}));
        }),
        catchError((err: HttpErrorResponse) => of(new UserFailure({error: err.error})))
      );
    })
  );

  @Effect()
  delete$ = this.actions$.pipe(ofType(UserActionTypes.USER_DELETE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.userService.delete(payload).pipe(
        switchMap((response: any) => {
          return of(new UserSaveSuccess({message: `User ${response.username} deleted`}));
        }),
        catchError((err: HttpErrorResponse) => of(new UserFailure({error: err.error})))
      );
    })
  );

  @Effect({dispatch: false})
  dataSuccess$ = this.actions$.pipe(
    ofType(UserActionTypes.USER_SUCCESS)
  );

  @Effect({dispatch: false})
  selectedData$ = this.actions$.pipe(
    ofType(UserActionTypes.USER_SELECTED),
    tap((data: any) => {
      this.router.navigate(['dashboard', 'users', data.payload.id]);
    })
  );

  @Effect({dispatch: false})
  saveSuccess$ = this.actions$.pipe(
    ofType(UserActionTypes.USER_SAVE_SUCCESS),
    tap((data: any) => {
      this.router.navigate(['dashboard', 'users']);
    })
  );

  constructor(private actions$: Actions, private userService: UserService, private router: Router) {
  }
}
