import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  CreateCurrency,
  CurrencyActionTypes,
  CurrencyFailure,
  CurrencySaveSuccess,
  CurrencySelected,
  CurrencySuccess,
  DeleteCurrency,
  GetCurrency,
  GetCurrenciesPage,
  UpdateCurrency,
} from '../currency.actions';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyService } from '../../services/currency.service';
import { Router } from '@angular/router';
import { Pagination } from '../../interfaces/pagination';
import { ICurrency } from '../../interfaces/currency';
import { IApiResponse, success } from '../../interfaces/common';
import { ToastType } from '../../shared/toast/toast.model';

@Injectable()
export class CurrencyEffects {

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(CurrencyActionTypes.getCurrenciesPage),
    switchMap((action: GetCurrenciesPage) =>
      this.currencyService.getCurrenciesPage(action.page, action.sort, action.direction, action.size).pipe(
        switchMap((response: Pagination<ICurrency>) => of(new CurrencySuccess(response))),
        catchError((err: HttpErrorResponse) => of(new CurrencyFailure(err.error))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(CurrencyActionTypes.getCurrency),
    switchMap((action: GetCurrency) =>
      this.currencyService.getCurrency(action.id).pipe(
        switchMap((currency?: ICurrency) => of(new CurrencySelected(currency))),
        catchError((err: HttpErrorResponse) => of(new CurrencyFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(CurrencyActionTypes.createCurrency),
    switchMap((action: CreateCurrency) =>
      this.currencyService.createCurrency(action.currency).pipe(
        switchMap((response: ICurrency) => this.requestSuccess('CURRENCY.CREATED', response.name!, response.id)),
        catchError((err: HttpErrorResponse) => of(new CurrencyFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(CurrencyActionTypes.updateCurrency),
    switchMap((action: UpdateCurrency) =>
      this.currencyService.updateCurrency(action.id, action.currency).pipe(
        switchMap((response: IApiResponse) =>
          this.requestSuccess('CURRENCY.UPDATED.MESSAGE', response.name!, response.id)),
        catchError((err: HttpErrorResponse) => of(new CurrencyFailure(err.error))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(CurrencyActionTypes.deleteCurrency),
    switchMap((action: DeleteCurrency) =>
      this.currencyService.deleteCurrency(action.id).pipe(
        switchMap(() => this.requestSuccess('CURRENCY.DELETED.MESSAGE', action.code!, undefined, 'warning')),
        catchError((err: HttpErrorResponse) => of(new CurrencyFailure(err.error))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(CurrencyActionTypes.currencySelected),
    tap((data: CurrencySelected) => this.router.navigate([this.translate.currentLang, 'currency', data.selected?.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(CurrencyActionTypes.currencySuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(CurrencyActionTypes.currencySaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private currencyService: CurrencyService, private router: Router) {
  }

  private requestSuccess(key: string, code: string, id?: string,
    toastType?: ToastType): Observable<CurrencySaveSuccess> {
    const message = this.translate.instant(key, { code });
    const path = id ? `currency/${ id }` : undefined;
    return success(CurrencySaveSuccess, message, path, undefined, toastType);
  }
}
