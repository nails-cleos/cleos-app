import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsCurrency from '../currency.actions';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyService } from '../../services/currency.service';
import { Router } from '@angular/router';

@Injectable()
export class CurrencyEffects {

  getAll$ = createEffect(() => this.actions$.pipe(ofType(fromActionsCurrency.CurrencyActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.currencyService.getAll(payload.active, payload.direction, payload.page,
      payload.size).pipe(
      switchMap((response: any) => of(new fromActionsCurrency.CurrencySuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsCurrency.CurrencyFailure({ error: err.error }))),
    )),
  ));

  findOne$ = createEffect(() => this.actions$.pipe(ofType(fromActionsCurrency.CurrencyActionTypes.currencyFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.currencyService.getById(payload).pipe(
      switchMap((currency: any) => of(new fromActionsCurrency.CurrencySelected(currency))),
      catchError((err: HttpErrorResponse) => of(new fromActionsCurrency.CurrencyFailure({ error: err.error }))),
    )),
  ));

  save$ = createEffect(() => this.actions$.pipe(ofType(fromActionsCurrency.CurrencyActionTypes.currencySave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.currencyService.add(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('CURRENCY.CREATED', { code: response.code });
        return of(new fromActionsCurrency.CurrencySaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsCurrency.CurrencyFailure({ error: err.error }))),
    )),
  ));

  update = createEffect(() => this.actions$.pipe(ofType(fromActionsCurrency.CurrencyActionTypes.currencyUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.currencyService.update(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('CURRENCY.UPDATED.MESSAGE', { code: response.code });
        return of(new fromActionsCurrency.CurrencySaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsCurrency.CurrencyFailure({ error: err.error }))),
    )),
  ));

  delete$ = createEffect(() => this.actions$.pipe(ofType(fromActionsCurrency.CurrencyActionTypes.currencyDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.currencyService.delete(payload.id).pipe(
      switchMap(() => {
        const message = this.translate.instant('CURRENCY.DELETED.MESSAGE', { code: payload.code });
        return of(new fromActionsCurrency.CurrencySaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsCurrency.CurrencyFailure({ error: err.error }))),
    )),
  ));

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsCurrency.CurrencyActionTypes.currencySelected),
    tap((data: any) => this.router.navigate([this.translate.currentLang, 'currency', data.payload.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsCurrency.CurrencyActionTypes.currencySuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsCurrency.CurrencyActionTypes.currencySaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions$: Actions,
              private currencyService: CurrencyService, private router: Router) {
  }
}
