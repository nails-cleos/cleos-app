import { inject } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IApiResponse } from '../interfaces/common';
import { ICurrency, ICurrencyAll } from '../interfaces/currency';
import { CurrencyService } from '../services/currency.service';
import { withCrudStoreMethods, withCrudStoreState } from './crud-signal-store';

export const CurrencyStore = signalStore(
  withCrudStoreState<ICurrencyAll>(),
  withCrudStoreMethods<ICurrency, IApiResponse, IApiResponse, { id: string; code: string }>(() => {
    const currencyService = inject(CurrencyService);
    const translate = inject(TranslateService);

    return {
      placeholder: undefined,
      loadPage: ({ page, sort, direction, size }) => currencyService.getCurrenciesPage(page, sort, direction, size),
      loadById: (id) => currencyService.getCurrency(id),
      create: (currency) => currencyService.createCurrency(currency),
      update: (id, currency) => currencyService.updateCurrency(id, currency),
      delete: ({ id }) => currencyService.deleteCurrency(id),
      createResponse: (response) => ({
        message: translate.instant('CURRENCY.CREATED', { code: response.name }),
        path: `currency/${ response.id }`,
        redirect: 'currency',
      }),
      updateResponse: (response) => ({
        message: translate.instant('CURRENCY.UPDATED.MESSAGE', { code: response.name }),
        path: `currency/${ response.id }`,
        redirect: 'currency',
      }),
      deleteResponse: ({ code }) => ({
        message: translate.instant('CURRENCY.DELETED.MESSAGE', { code }),
        reload: true,
        toastType: 'warning',
        redirect: 'currency',
      }),
    };
  }),
);
