import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap } from 'rxjs/operators';
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
import { IApiResponse, successResponse } from '../../interfaces/common';
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class CurrencyEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly currencyService: CurrencyService = inject(CurrencyService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getCurrenciesPage),
    switchMap(({ page, sort, direction, size }) => effectRequest(
      this.currencyService.getCurrenciesPage(page, sort, direction, size)
        .pipe(map((data: Pagination<ICurrency>) => currencySuccess({ data }))),
      action => action,
      currencyFailure,
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getCurrency),
    switchMap(({ id }) => effectRequest(
      this.currencyService.getCurrency(id).pipe(map((selected?: ICurrency) => currencySelected({ selected }))),
      action => action,
      currencyFailure,
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createCurrency),
    switchMap(({ currency }) => effectRequest(
      this.currencyService.createCurrency(currency).pipe(switchMap((response: ICurrency) => {
        const message = this.translate.instant('CURRENCY.CREATED', { code: response.name });
        const path = `currency/${ response.id }`;
        return successResponse(currencySaveSuccess, message, path, 'currency');
      })),
      action => action,
      currencyFailure,
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateCurrency),
    switchMap(({ id, currency }) => effectRequest(
      this.currencyService.updateCurrency(id, currency).pipe(switchMap((response: IApiResponse) => {
        const message = this.translate.instant('CURRENCY.UPDATED.MESSAGE', { code: response.name });
        const path = `currency/${ response.id }`;
        return successResponse(currencySaveSuccess, message, path, 'currency');
      })),
      action => action,
      currencyFailure,
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteCurrency),
    switchMap(({ id, code }) => effectRequest(
      this.currencyService.deleteCurrency(id).pipe(switchMap(() => {
        const message = this.translate.instant('CURRENCY.DELETED.MESSAGE', { code });
        return successResponse(currencySaveSuccess, message, undefined, 'currency', true, 'warning');
      })),
      action => action,
      currencyFailure,
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(currencySelected),
    tap(({ selected }) => this.router.navigate([this.translate.getCurrentLang(), 'currency', selected?.id])),
  ), { dispatch: false });
}
