import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsTreatment from '../treatment.actions';
import { TranslateService } from '@ngx-translate/core';
import { TreatmentService } from '../../services/treatment.service';
import { Router } from '@angular/router';
import { ColorService } from '../../services/color.service';

@Injectable()
export class TreatmentEffects {

  getAll$ = createEffect(() => this.actions$.pipe(ofType(fromActionsTreatment.TreatmentActionTypes.getTreatmentsPage))
    .pipe(
      map((action: any) => action.payload),
      switchMap(
        (payload: any) => this.treatmentService.getTreatmentsPage(payload.active, payload.direction, payload.page,
          payload.size).pipe(
          switchMap((response: any) => of(new fromActionsTreatment.TreatmentSuccess(response))),
          catchError((err: HttpErrorResponse) => of(new fromActionsTreatment.TreatmentFailure({ error: err.error }))),
        )),
    ));

  findGroups$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsTreatment.TreatmentActionTypes.getAllTreatmentsGroup)).pipe(
      map((action: any) => action.payload),
      switchMap(() => this.treatmentService.getAllTreatmentsGroup().pipe(
        switchMap((response: any) => of(new fromActionsTreatment.TreatmentSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsTreatment.TreatmentFailure({ error: err.error }))),
      )),
    ));

  findColors$ = createEffect(() => this.actions$.pipe(ofType(fromActionsTreatment.TreatmentActionTypes.getAllColors))
    .pipe(map((action: any) => action.payload),
      switchMap(() => this.colorService.getAllColors().pipe(
        switchMap((response: any) => of(new fromActionsTreatment.ColorSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new fromActionsTreatment.TreatmentFailure({ error: err.error }))),
      )),
    ));


  findOne$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsTreatment.TreatmentActionTypes.findTreatmentGroupById)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.treatmentService.findTreatmentGroupById(payload.id).pipe(
        switchMap(
          (treatment: any) => of(new fromActionsTreatment.TreatmentSelected({ treatment, path: payload.path }))),
        catchError((err: HttpErrorResponse) => of(new fromActionsTreatment.TreatmentFailure({ error: err.error }))),
      )),
    ));

  save$ = createEffect(() => this.actions$.pipe(ofType(fromActionsTreatment.TreatmentActionTypes.createTreatment)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.treatmentService.createTreatment(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('TREATMENT.CREATED', { name: response.name });
        return of(new fromActionsTreatment.TreatmentSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsTreatment.TreatmentFailure({ error: err.error }))),
    )),
  ));

  update$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsTreatment.TreatmentActionTypes.updateTreatmentGroupById)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.treatmentService.updateTreatmentGroupById(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('TREATMENT.UPDATED.MESSAGE', { name: response.name });
          return of(new fromActionsTreatment.TreatmentSaveSuccess({ message }));
        }), catchError((err: HttpErrorResponse) => of(new fromActionsTreatment.TreatmentFailure({ error: err.error }))),
      )),
    ));

  updateSort$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsTreatment.TreatmentActionTypes.sortTreatment)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.treatmentService.sortTreatment(payload).pipe(
        switchMap(() =>
          of(new fromActionsTreatment.TreatmentSaveSuccess(
            { message: this.translate.instant('TREATMENT.SORTED.MESSAGE') })),
        ), catchError((err: HttpErrorResponse) => of(new fromActionsTreatment.TreatmentFailure({ error: err.error }))),
      )),
    ));

  updateGroupSort$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsTreatment.TreatmentActionTypes.sortGroupTreatment)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.treatmentService.sortGroupTreatment(payload).pipe(
        switchMap(() =>
          of(new fromActionsTreatment.TreatmentSaveSuccess(
            { message: this.translate.instant('TREATMENT.SORTED.MESSAGE') })),
        ), catchError((err: HttpErrorResponse) => of(new fromActionsTreatment.TreatmentFailure({ error: err.error }))),
      )),
    ));

  delete$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsTreatment.TreatmentActionTypes.deleteTreatmentGroupById)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.treatmentService.deleteTreatmentGroupById(payload.id).pipe(
        switchMap(() => {
          const message = this.translate.instant('TREATMENT.DELETED.MESSAGE', { name: payload.name });
          return of(new fromActionsTreatment.TreatmentSaveSuccess({ message }));
        }), catchError((err: HttpErrorResponse) => of(new fromActionsTreatment.TreatmentFailure({ error: err.error }))),
      )),
    ));

  history$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsTreatment.TreatmentActionTypes.getAllTreatmentsHistory)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.treatmentService.getAllTreatmentsHistory(payload.id, payload.treatmentId).pipe(
        switchMap((treatment: any) => of(new fromActionsTreatment.TreatmentHistorySuccess(treatment))),
        catchError((err: HttpErrorResponse) => of(new fromActionsTreatment.TreatmentFailure({ error: err.error }))),
      )),
    ));

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsTreatment.TreatmentActionTypes.treatmentSelected),
    tap((data: any) => this.router.navigate(
      [this.translate.currentLang, 'treatments', data.payload.treatment.id, data.payload.path])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsTreatment.TreatmentActionTypes.treatmentSuccess),
  ), { dispatch: false });

  colorsSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsTreatment.TreatmentActionTypes.colorSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsTreatment.TreatmentActionTypes.treatmentSaveSuccess),
  ), { dispatch: false });

  historySuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsTreatment.TreatmentActionTypes.treatmentHistorySuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions$: Actions,
              private treatmentService: TreatmentService,
              private colorService: ColorService, private router: Router) {
  }
}
