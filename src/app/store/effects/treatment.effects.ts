import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  ColorSuccess,
  CreateTreatment,
  DeleteTreatmentGroup,
  GetTreatmentGroup,
  GetAllTreatmentsHistory,
  GetTreatmentsPage,
  SortGroupTreatment,
  SortTreatment,
  TreatmentActionTypes,
  TreatmentFailure,
  TreatmentHistorySuccess,
  TreatmentSaveSuccess,
  TreatmentSelected,
  TreatmentSuccess,
  UpdateTreatmentGroup,
} from '../treatment.actions';
import { TranslateService } from '@ngx-translate/core';
import { TreatmentService } from '../../services/treatment.service';
import { Router } from '@angular/router';
import { ColorService } from '../../services/color.service';
import { Pagination } from '../../interfaces/pagination';
import { ITreatmentAll, ITreatmentGroup } from '../../interfaces/treatment';
import { IColor } from '../../interfaces/color';
import { IApiResponse, success } from '../../interfaces/common';
import { ToastType } from '../../shared/toast/toast.model';

@Injectable()
export class TreatmentEffects {

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.getTreatmentsPage),
    switchMap((action: GetTreatmentsPage) =>
      this.treatmentService.getTreatmentsPage(action.page, action.sort, action.direction, action.size).pipe(
        switchMap((response: Pagination<ITreatmentGroup>) => of(new TreatmentSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new TreatmentFailure(err.error))),
      )),
  ));

  findGroups$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.getAllTreatmentsGroup),
    switchMap(() =>
      this.treatmentService.getAllTreatmentsGroup().pipe(
        switchMap((response: ITreatmentGroup[]) => of(new TreatmentSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new TreatmentFailure(err.error))),
      )),
  ));

  findColors$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.getAllColors),
    switchMap(() =>
      this.colorService.getAllColors().pipe(
        switchMap((response: IColor[]) => of(new ColorSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new TreatmentFailure(err.error))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.getTreatmentGroup),
    switchMap((action: GetTreatmentGroup) =>
      this.treatmentService.getTreatmentGroup(action.id).pipe(
        switchMap((response?: ITreatmentGroup) => of(new TreatmentSelected(response, action.path))),
        catchError((err: HttpErrorResponse) => of(new TreatmentFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.createTreatment),
    switchMap((action: CreateTreatment) =>
      this.treatmentService.createTreatment(action.treatment).pipe(
        switchMap((response: IApiResponse) => this.requestSuccess('TREATMENT.CREATED', response.name, response.id)),
        catchError((err: HttpErrorResponse) => of(new TreatmentFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.updateTreatmentGroup),
    switchMap((action: UpdateTreatmentGroup) =>
      this.treatmentService.updateTreatmentGroup(action.id, action.treatment).pipe(
        switchMap((response: IApiResponse) =>
          this.requestSuccess('TREATMENT.UPDATED.MESSAGE', response.name, response.id)),
        catchError((err: HttpErrorResponse) => of(new TreatmentFailure(err.error))),
      )),
  ));

  updateSort$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.sortTreatment),
    switchMap((action: SortTreatment) =>
      this.treatmentService.sortTreatment(action.treatments).pipe(
        switchMap(() => this.requestSuccess('TREATMENT.SORTED.MESSAGE')),
        catchError((err: HttpErrorResponse) => of(new TreatmentFailure(err.error))),
      )),
  ));

  updateGroupSort$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.sortGroupTreatment),
    switchMap((action: SortGroupTreatment) =>
      this.treatmentService.sortGroupTreatment(action.groups).pipe(
        switchMap(() => this.requestSuccess('TREATMENT.SORTED.MESSAGE')),
        catchError((err: HttpErrorResponse) => of(new TreatmentFailure(err.error))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.deleteTreatmentGroup),
    switchMap((action: DeleteTreatmentGroup) =>
      this.treatmentService.deleteTreatmentGroup(action.id).pipe(
        switchMap(() => this.requestSuccess('TREATMENT.DELETED.MESSAGE', action.name, undefined, 'warning')),
        catchError((err: HttpErrorResponse) => of(new TreatmentFailure(err.error))),
      )),
  ));

  history$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.getAllTreatmentsHistory),
    switchMap((action: GetAllTreatmentsHistory) =>
      this.treatmentService.getAllTreatmentsHistory(action.id, action.treatmentId).pipe(
        switchMap((response: ITreatmentAll[]) => of(new TreatmentHistorySuccess(response))),
        catchError((err: HttpErrorResponse) => of(new TreatmentFailure(err.error))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.treatmentSelected),
    tap((data: TreatmentSelected) => this.router.navigate(
      [this.translate.currentLang, 'treatments', data.selected?.id, data.path])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.treatmentSuccess),
  ), { dispatch: false });

  colorsSuccess$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.colorSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.treatmentSaveSuccess),
  ), { dispatch: false });

  historySuccess$ = createEffect(() => this.actions.pipe(
    ofType(TreatmentActionTypes.treatmentHistorySuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private treatmentService: TreatmentService, private colorService: ColorService, private router: Router) {
  }

  private requestSuccess(key: string, name?: string, id?: string,
    toastType?: ToastType): Observable<TreatmentSaveSuccess> {
    const message = this.translate.instant(key, { name });
    const path = id ? `treatments/${ id }/view` : undefined;
    return success(TreatmentSaveSuccess, message, path, undefined, toastType);
  }
}
