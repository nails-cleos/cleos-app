import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  colorFailure,
  colorSaveSuccess,
  colorSelected,
  colorSuccess,
  createColor,
  deleteColor,
  getColor,
  getColorsPage,
  updateColor,
} from '../color.actions';
import { TranslateService } from '@ngx-translate/core';
import { ColorService } from '../../services/color.service';
import { Router } from '@angular/router';
import { IColor } from '../../interfaces/color';
import { IApiResponse, success, successResponse } from '../../interfaces/common';
import { Pagination } from '../../interfaces/pagination';

@Injectable()
export class ColorEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly colorService: ColorService = inject(ColorService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getColorsPage),
    switchMap(({ page, sort, direction, size }) =>
      this.colorService.getColorsPage(page, sort, direction, size).pipe(
        map((data: Pagination<IColor>) => colorSuccess({ data })),
        catchError((err: HttpErrorResponse) => of(colorFailure({ error: err.error }))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getColor),
    switchMap(({ id }) =>
      this.colorService.getColor(id).pipe(
        map((selected?: IColor) => colorSelected({ selected })),
        catchError((err: HttpErrorResponse) => of(colorFailure({ error: err.error }))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createColor),
    switchMap(({ color }) =>
      this.colorService.createColor(color).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('COLOR.CREATED', { name: response.name });
          const path = `colors/${ response.id }`;
          return successResponse(colorSaveSuccess, message, path, 'colors');
        }),
        catchError((err: HttpErrorResponse) => of(colorFailure({ error: err.error }))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateColor),
    switchMap(({ id, color }) =>
      this.colorService.updateColor(id, color).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('COLOR.UPDATED.MESSAGE', { name: response.name });
          const path = `colors/${ response.id }`;
          return successResponse(colorSaveSuccess, message, path, 'colors');
        }),
        catchError((err: HttpErrorResponse) => of(colorFailure({ error: err.error }))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteColor),
    switchMap(({ id, name }) =>
      this.colorService.deleteColor(id).pipe(
        switchMap(() => {
          const message = this.translate.instant('COLOR.DELETED.MESSAGE', { name: name });
          return success(colorSaveSuccess, message, undefined, undefined, 'warning');
        }),
        catchError((err: HttpErrorResponse) => of(colorFailure({ error: err.error }))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(colorSelected),
    tap(({ selected }) => this.router.navigate([this.translate.currentLang, 'colors', selected?.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(colorSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(colorSaveSuccess),
  ), { dispatch: false });
}
