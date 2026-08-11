import { inject } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { IApiResponse } from '../interfaces/common';
import { ICurrency, ICurrencyAll } from '../currency/currency';
import { CurrencyService } from '../services/currency.service';
import { withCrudStoreMethods, withCrudStoreState } from './crud-signal-store';
import { Pagination } from '../interfaces/pagination';

type CurrencyData =
  | { kind: 'pagination'; value?: Pagination<ICurrencyAll> }
  | { kind: 'list'; value?: ICurrencyAll[] };

export const CurrencyStore = signalStore(
  { providedIn: 'root' },
  withCrudStoreState<ICurrencyAll, CurrencyData, ICurrencyAll>(),
  withCrudStoreMethods<
    ICurrency,
    IApiResponse,
    IApiResponse,
    { id: string; code: string }
  >(() => {
    const currencyService = inject(CurrencyService);

    return {
      loadPage: ({ page, sort, direction, size }) =>
        currencyService.getCurrenciesPage(page, sort, direction, size),
      loadById: (id) => currencyService.getCurrency(id),
      loadAll: () => currencyService.getAllCurrency(),
      create: (currency) => currencyService.createCurrency(currency),
      update: (id, currency) => currencyService.updateCurrency(id, currency),
      delete: ({ id }) => currencyService.deleteCurrency(id),
      createResponse: (response) => ({
        messageKey: 'CURRENCY.CREATED',
        messageParams: {
          code: response.name,
        },
        path: `currency/${response.id}`,
        redirect: 'currency',
      }),
      updateResponse: (response) => ({
        messageKey: 'CURRENCY.UPDATED.MESSAGE',
        messageParams: {
          code: response.name,
        },
        path: `currency/${response.id}`,
        redirect: 'currency',
      }),
      deleteResponse: ({ code }) => ({
        messageKey: 'CURRENCY.DELETED.MESSAGE',
        messageParams: {
          code: code,
        },
        reload: true,
        toastType: 'warning',
        redirect: 'currency',
      }),
    };
  }),
);
