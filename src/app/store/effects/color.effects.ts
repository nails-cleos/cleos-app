import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsColor from '../color.actions';
import { TranslateService } from '@ngx-translate/core';
import { ColorService } from '../../services/color.service';
import { Router } from '@angular/router';

@Injectable()
export class ColorEffects {

  getAll$ = createEffect(() => this.actions.pipe(ofType(fromActionsColor.ColorActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.colorService.getAll(payload.active, payload.direction, payload.page,
      payload.size).pipe(
      switchMap((response: any) => of(new fromActionsColor.ColorSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsColor.ColorFailure({ error: err.error })))
    ))
  ));

  findOne$ = createEffect(() => this.actions.pipe(ofType(fromActionsColor.ColorActionTypes.colorFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.colorService.getById(payload).pipe(
      switchMap((color: any) => of(new fromActionsColor.ColorSelected(color))),
      catchError((err: HttpErrorResponse) => of(new fromActionsColor.ColorFailure({ error: err.error })))
    ))
  ));

  save$ = createEffect(() => this.actions.pipe(ofType(fromActionsColor.ColorActionTypes.colorSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.colorService.add(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('COLOR.CREATED', { name: response.name });
        return of(new fromActionsColor.ColorSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsColor.ColorFailure({ error: err.error })))
    ))
  ));

  update = createEffect(() => this.actions.pipe(ofType(fromActionsColor.ColorActionTypes.colorUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.colorService.update(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('COLOR.UPDATED.MESSAGE', { name: response.name });
        return of(new fromActionsColor.ColorSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsColor.ColorFailure({ error: err.error })))
    ))
  ));

  delete$ = createEffect(() => this.actions.pipe(ofType(fromActionsColor.ColorActionTypes.colorDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.colorService.delete(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('COLOR.DELETED.MESSAGE', { name: response.name });
        return of(new fromActionsColor.ColorSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsColor.ColorFailure({ error: err.error })))
    ))
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsColor.ColorActionTypes.colorSelected),
    tap((data: any) => this.router.navigate(['colors', data.payload.id]))
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsColor.ColorActionTypes.colorSuccess)
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsColor.ColorActionTypes.colorSaveSuccess)
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private colorService: ColorService, private router: Router) {
  }
}
