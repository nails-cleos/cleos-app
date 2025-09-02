import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsAdditional from '../additional.actions';
import { TranslateService } from '@ngx-translate/core';
import { AdditionalService } from '../../services/additional.service';
import { Router } from '@angular/router';
import { TreatmentService } from '../../services/treatment.service';

@Injectable()
export class AdditionalEffects {

  getAll$ = createEffect(() => this.actions$.pipe(ofType(fromActionsAdditional.AdditionalActionTypes.getAdditionalPage))
    .pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.additionalService.getAdditionalPage(payload.active, payload.direction,
        payload.page, payload.size).pipe(
        switchMap((response: any) => of(new fromActionsAdditional.AdditionalSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsAdditional.AdditionalFailure({ error: err.error }))),
      )),
    ));

  findAdditionalList$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsAdditional.AdditionalActionTypes.getAdditionalList))
      .pipe(map((action: any) => action.payload),
        switchMap(() => this.additionalService.getAdditionalList().pipe(
          switchMap((response: any) => of(new fromActionsAdditional.AdditionalSuccess(response))),
          catchError((err: HttpErrorResponse) => of(new fromActionsAdditional.AdditionalFailure({ error: err.error }))),
        )),
      ));

  findOne$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsAdditional.AdditionalActionTypes.findAdditionalById)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.additionalService.findAdditionalById(payload).pipe(
        switchMap((additional: any) => of(new fromActionsAdditional.AdditionalSelected(additional))),
        catchError((err: HttpErrorResponse) => of(new fromActionsAdditional.AdditionalFailure({ error: err.error }))),
      )),
    ));

  save$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsAdditional.AdditionalActionTypes.createAdditional)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.additionalService.createAdditional(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('ADDITIONAL.CREATED', { name: response.name });
          return of(new fromActionsAdditional.AdditionalSaveSuccess({ message }));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsAdditional.AdditionalFailure({ error: err.error }))),
      )),
    ));

  update$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsAdditional.AdditionalActionTypes.updateAdditionalById)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.additionalService.updateAdditionalById(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('ADDITIONAL.UPDATED.MESSAGE', { name: response.name });
          return of(new fromActionsAdditional.AdditionalSaveSuccess({ message }));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsAdditional.AdditionalFailure({ error: err.error }))),
      )),
    ));

  updateSort$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsAdditional.AdditionalActionTypes.sortAdditional)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.additionalService.sortAdditional(payload).pipe(
        switchMap(() =>
          of(new fromActionsAdditional.AdditionalSaveSuccess(
            { message: this.translate.instant('ADDITIONAL.SORTED.MESSAGE') })),
        ),
        catchError((err: HttpErrorResponse) => of(new fromActionsAdditional.AdditionalFailure({ error: err.error }))),
      )),
    ));

  delete$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsAdditional.AdditionalActionTypes.deleteAdditionalById)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.additionalService.deleteAdditionalById(payload.id).pipe(
        switchMap(() => {
          const message = this.translate.instant('ADDITIONAL.DELETED.MESSAGE', { name: payload.name });
          return of(new fromActionsAdditional.AdditionalSaveSuccess({ message }));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsAdditional.AdditionalFailure({ error: err.error }))),
      )),
    ));

  findGroups$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsAdditional.AdditionalActionTypes.getAllTreatmentsGroup)).pipe(
      map((action: any) => action.payload),
      switchMap(() => this.treatmentService.getAllTreatmentsGroup().pipe(
        switchMap((response: any) => of(new fromActionsAdditional.FindGroupsSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsAdditional.AdditionalFailure({ error: err.error }))),
      )),
    ));

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsAdditional.AdditionalActionTypes.additionalSelected),
    tap((data: any) => this.router.navigate([this.translate.currentLang, 'additional', data.payload.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsAdditional.AdditionalActionTypes.additionalSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsAdditional.AdditionalActionTypes.additionalSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions$: Actions,
              private additionalService: AdditionalService,
              private treatmentService: TreatmentService, private router: Router) {
  }
}
