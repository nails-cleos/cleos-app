import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  ColorActionTypes,
  ColorFailure,
  ColorSaveSuccess,
  ColorSelected,
  ColorSuccess,
  CreateColor,
  DeleteColor,
  GetColor,
  GetColorsPage,
  UpdateColor,
} from '../color.actions';
import { TranslateService } from '@ngx-translate/core';
import { ColorService } from '../../services/color.service';
import { Router } from '@angular/router';
import { IColor } from '../../interfaces/color';
import { IApiResponse, success } from '../../interfaces/common';
import { Pagination } from '../../interfaces/pagination';

@Injectable()
export class ColorEffects {

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(ColorActionTypes.getColorsPage),
    switchMap((action: GetColorsPage) =>
      this.colorService.getColorsPage(action.page, action.sort, action.direction, action.size).pipe(
        switchMap((response: Pagination<IColor>) => of(new ColorSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new ColorFailure(err.error))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(ColorActionTypes.getColor),
    switchMap((action: GetColor) =>
      this.colorService.getColor(action.id).pipe(
        switchMap((color?: IColor) => of(new ColorSelected(color))),
        catchError((err: HttpErrorResponse) => of(new ColorFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(ColorActionTypes.createColor),
    switchMap((action: CreateColor) =>
      this.colorService.createColor(action.color).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('COLOR.CREATED', { name: response.name });
          const path = `colors/${ response.id }`;
          return success(ColorSaveSuccess, message, path);
        }),
        catchError((err: HttpErrorResponse) => of(new ColorFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(ColorActionTypes.updateColor),
    switchMap((action: UpdateColor) =>
      this.colorService.updateColor(action.id, action.color).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('COLOR.UPDATED.MESSAGE', { name: response.name });
          const path = `colors/${ response.id }`;
          return success(ColorSaveSuccess, message, path);
        }),
        catchError((err: HttpErrorResponse) => of(new ColorFailure(err.error))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(ColorActionTypes.deleteColor),
    switchMap((action: DeleteColor) =>
      this.colorService.deleteColor(action.id).pipe(
        switchMap(() => {
          const message = this.translate.instant('COLOR.DELETED.MESSAGE', { name: action.name });
          return success(ColorSaveSuccess, message, undefined, undefined, 'warning');
        }),
        catchError((err: HttpErrorResponse) => of(new ColorFailure(err.error))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(ColorActionTypes.colorSelected),
    tap((data: ColorSelected) => this.router.navigate([this.translate.currentLang, 'colors', data.selected?.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ColorActionTypes.colorSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(ColorActionTypes.colorSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private colorService: ColorService, private router: Router) {
  }
}
