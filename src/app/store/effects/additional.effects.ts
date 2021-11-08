import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsAdditional from '../additional.actions';
import { TranslateService } from '@ngx-translate/core';
import { AdditionalService } from '../../services/additional.service';
import { Router } from '@angular/router';

@Injectable()
export class AdditionalEffects {

  getAll$ = createEffect(() => this.actions$.pipe(ofType(fromActionsAdditional.AdditionalActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.additionalService.getAll(payload.active, payload.direction, payload.page,
      payload.size).pipe(
      switchMap((response: any) => of(new fromActionsAdditional.AdditionalSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsAdditional.AdditionalFailure({error: err.error})))
    ))
  ));

  findOne$ = createEffect(() => this.actions$.pipe(ofType(fromActionsAdditional.AdditionalActionTypes.additionalFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.additionalService.getById(payload).pipe(
      switchMap((additional: any) => of(new fromActionsAdditional.AdditionalSelected(additional))),
      catchError((err: HttpErrorResponse) => of(new fromActionsAdditional.AdditionalFailure({error: err.error})))
    ))
  ));

  save$ = createEffect(() => this.actions$.pipe(ofType(fromActionsAdditional.AdditionalActionTypes.additionalSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.additionalService.add(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('ADDITIONAL.CREATED', {name: response.name});
        return of(new fromActionsAdditional.AdditionalSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsAdditional.AdditionalFailure({error: err.error})))
    ))
  ));

  update = createEffect(() => this.actions$.pipe(ofType(fromActionsAdditional.AdditionalActionTypes.additionalUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.additionalService.update(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('ADDITIONAL.UPDATED.MESSAGE', {name: response.name});
        return of(new fromActionsAdditional.AdditionalSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsAdditional.AdditionalFailure({error: err.error})))
    ))
  ));

  delete$ = createEffect(() => this.actions$.pipe(ofType(fromActionsAdditional.AdditionalActionTypes.additionalDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.additionalService.delete(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('ADDITIONAL.DELETED.MESSAGE', {name: response.name});
        return of(new fromActionsAdditional.AdditionalSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsAdditional.AdditionalFailure({error: err.error})))
    ))
  ));

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsAdditional.AdditionalActionTypes.additionalSelected),
    tap((data: any) => this.router.navigate(['additional', data.payload.id]))
  ), {dispatch: false});

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsAdditional.AdditionalActionTypes.additionalSuccess)
  ), {dispatch: false});

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsAdditional.AdditionalActionTypes.additionalSaveSuccess)
  ), {dispatch: false});

  constructor(private readonly translate: TranslateService, private actions$: Actions,
              private additionalService: AdditionalService, private router: Router) {
  }
}
