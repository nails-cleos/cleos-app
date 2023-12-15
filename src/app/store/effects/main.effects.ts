import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as fromActionsMain from '../main.actions';
import { TranslateService } from '@ngx-translate/core';
import { CatalogueService } from '../../services/catalogue.service';
import { TreatmentService } from '../../services/treatment.service';
import { MainService } from '../../services/main.service';
import * as fromActionsUser from '../user.actions';
import { LoginSuccess } from '../auth.actions';
import { UserService } from '../../services/user.service';

@Injectable()
export class MainEffects {

  getAllCatalogue$ = createEffect(() => this.actions$.pipe(ofType(fromActionsMain.MainActionTypes.getAllCatalogue)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.catalogueService.getAllHome().pipe(
      switchMap((response: any) => of(new fromActionsMain.CatalogueSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsMain.RequestFailure({error: err.error})))
    ))
  ));

  getAllTreatments$ = createEffect(() => this.actions$.pipe(ofType(fromActionsMain.MainActionTypes.getAllTreatments)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.treatmentService.getTreatmentList().pipe(
      switchMap((response: any) => of(new fromActionsMain.TreatmentsSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsMain.RequestFailure({error: err.error})))
    ))
  ));

  sendMessage$ = createEffect(() => this.actions$.pipe(ofType(fromActionsMain.MainActionTypes.sendMessage)).pipe(
    map((action: any) => action.payload),
    switchMap((payload) => this.mainService.sendMessage(payload).pipe(
      switchMap(() => {
        const message = this.translate.instant('MAIN.CONTACT.SEND.MESSAGE');
        return of(new fromActionsMain.RequestSuccess({message}));
      }),
      catchError((err: HttpErrorResponse) => of(new fromActionsMain.RequestFailure({error: err.error})))
    ))
  ));

  update$ = createEffect(() => this.actions$.pipe(ofType(fromActionsMain.MainActionTypes.updateUser)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.updateMe(payload.user).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('COMMON.PROFILE.UPDATED.MESSAGE', { displayName: response.user.displayName });
        return of(new LoginSuccess({
          response, queryParams: {
            state: btoa(JSON.stringify({ returnUrl: payload.redirectUrl }))
          }
        }), new fromActionsMain.RequestSuccess({ message: payload.message ? payload.message : message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsMain.RequestFailure({ error: err.error })))
    ))
  ));

  catalogueSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsMain.MainActionTypes.catalogueSuccess)
  ), {dispatch: false});

  treatmentDataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsMain.MainActionTypes.treatmentSuccess)
  ), {dispatch: false});

  requestSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsMain.MainActionTypes.requestSuccess)
  ), {dispatch: false});

  constructor(private readonly translate: TranslateService, private actions$: Actions, private mainService: MainService,
              private catalogueService: CatalogueService, private treatmentService: TreatmentService, private userService: UserService) {
  }
}
