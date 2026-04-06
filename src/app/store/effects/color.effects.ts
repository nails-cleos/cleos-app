import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap } from 'rxjs/operators';
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
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class ColorEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly colorService: ColorService = inject(ColorService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getColorsPage),
    switchMap(({ page, sort, direction, size }) => effectRequest(
      this.colorService.getColorsPage(page, sort, direction, size).pipe(map((data: Pagination<IColor>) =>
        colorSuccess({ data }))),
      action => action,
      colorFailure,
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getColor),
    switchMap(({ id }) => effectRequest(
      this.colorService.getColor(id).pipe(map((selected?: IColor) => colorSelected({ selected }))),
      action => action,
      colorFailure,
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createColor),
    switchMap(({ color }) => effectRequest(
      this.colorService.createColor(color).pipe(switchMap((response: IApiResponse) => {
        const message = this.translate.instant('COLOR.CREATED', { name: response.name });
        const path = `colors/${ response.id }`;
        return successResponse(colorSaveSuccess, message, path, 'colors');
      })),
      action => action,
      colorFailure,
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateColor),
    switchMap(({ id, color }) => effectRequest(
      this.colorService.updateColor(id, color).pipe(switchMap((response: IApiResponse) => {
        const message = this.translate.instant('COLOR.UPDATED.MESSAGE', { name: response.name });
        const path = `colors/${ response.id }`;
        return successResponse(colorSaveSuccess, message, path, 'colors');
      })),
      action => action,
      colorFailure,
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteColor),
    switchMap(({ id, name }) => effectRequest(
      this.colorService.deleteColor(id).pipe(switchMap(() => {
        const message = this.translate.instant('COLOR.DELETED.MESSAGE', { name: name });
        return success(colorSaveSuccess, message, undefined, true, 'warning');
      })),
      action => action,
      colorFailure,
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(colorSelected),
    tap(({ selected }) => this.router.navigate([this.translate.getCurrentLang(), 'colors', selected?.id])),
  ), { dispatch: false });
}
