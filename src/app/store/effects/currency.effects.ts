import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  createCurrency,
  currencyFailure,
  currencySaveSuccess,
  currencySelected,
  currencySuccess,
  deleteCurrency,
  getCurrenciesPage,
  getCurrency,
  updateCurrency,
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
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly currencyService: CurrencyService = inject(CurrencyService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getCurrenciesPage),
    switchMap(({ page, sort, direction, size }) =>
      this.currencyService.getCurrenciesPage(page, sort, direction, size).pipe(
        map((data: Pagination<ICurrency>) => currencySuccess({ data })),
        catchError((err: HttpErrorResponse) => of(currencyFailure({ error: err.error }))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getCurrency),
    switchMap(({ id }) =>
      this.currencyService.getCurrency(id).pipe(
        map((selected?: ICurrency) => currencySelected({ selected })),
        catchError((err: HttpErrorResponse) => of(currencyFailure({ error: err.error }))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createCurrency),
    switchMap(({ currency }) =>
      this.currencyService.createCurrency(currency).pipe(
        switchMap((response: ICurrency) => this.requestSuccess('CURRENCY.CREATED', response.name!, response.id)),
        catchError((err: HttpErrorResponse) => of(currencyFailure({ error: err.error }))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateCurrency),
    switchMap(({ id, currency }) =>
      this.currencyService.updateCurrency(id, currency).pipe(
        switchMap((response: IApiResponse) =>
          this.requestSuccess('CURRENCY.UPDATED.MESSAGE', response.name!, response.id)),
        catchError((err: HttpErrorResponse) => of(currencyFailure({ error: err.error }))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteCurrency),
    switchMap(({ id, code }) =>
      this.currencyService.deleteCurrency(id).pipe(
        switchMap(() => this.requestSuccess('CURRENCY.DELETED.MESSAGE', code!, undefined, 'warning')),
        catchError((err: HttpErrorResponse) => of(currencyFailure({ error: err.error }))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(currencySelected),
    tap(({ selected }) => this.router.navigate([this.translate.currentLang, 'currency', selected?.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(currencySuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(currencySaveSuccess),
  ), { dispatch: false });

  private requestSuccess(key: string, code: string, id?: string, toastType?: ToastType) {
    const message = this.translate.instant(key, { code });
    const path = id ? `currency/${ id }` : undefined;
    return success(currencySaveSuccess, message, path, undefined, toastType);
  }
}
