import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { Pagination } from '../interfaces/pagination';
import { DiscountType, IDiscount, IDiscountAll, IReferral, IUserDiscount } from '../interfaces/discount';
import { ICurrency } from '../interfaces/currency';
import { IApiResponse, IError, IResponseSuccess, PageRequest } from '../interfaces/common';
import { DiscountService } from '../services/discount.service';
import { CurrencyService } from '../services/currency.service';
import { mapCrudHttpError } from './crud-signal-store';

export type DiscountData =
  | { kind: 'paginationDiscount'; value: Pagination<IDiscountAll> }
  | { kind: 'pagination'; value: Pagination<IUserDiscount> }
  | { kind: 'list'; value: IUserDiscount[] };

type DiscountStoreState = {
  response: IResponseSuccess | undefined;
  data: DiscountData | undefined;
  referrals: IReferral[] | undefined;
  currencies: ICurrency[] | undefined;
  error: IError | undefined;
  subErrors: IError[] | undefined;
  selected: IDiscount | undefined;
  isLoading: boolean;
};

const initialState: DiscountStoreState = {
  data: undefined,
  referrals: undefined,
  currencies: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const DiscountStore = signalStore(
  withState(initialState),
  withMethods((store, discountService = inject(DiscountService), currencyService = inject(CurrencyService),
    translate = inject(TranslateService)) => {
    const patchError = (err: any): void => {
      const error = mapCrudHttpError(err);
      patchState(store, {
        error,
        subErrors: error.subErrors,
        response: undefined,
        isLoading: false,
      });
    };

    return {
      clean(): void {
        patchState(store, initialState);
      },

      clearResponse(): void {
        patchState(store, { response: undefined });
      },

      clearError(): void {
        patchState(store, { error: undefined, subErrors: undefined });
      },

      loadPage(request: PageRequest): void {
        patchState(store, {
          data: {
            kind: 'paginationDiscount',
            value: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IDiscountAll>,
          },
          subErrors: undefined,
          selected: undefined,
          response: undefined,
        });

        discountService.getDiscountsPage(request.page, request.sort, request.direction, request.size).subscribe({
          next: (value) => patchState(store, {
            data: { kind: 'paginationDiscount', value },
            subErrors: undefined,
            response: undefined,
          }),
          error: patchError,
        });
      },

      loadMyPage(request: PageRequest): void {
        patchState(store, {
          data: {
            kind: 'pagination',
            value: { content: [{}, {}, {}], totalElements: 3 } as Pagination<IUserDiscount>,
          },
          subErrors: undefined,
          selected: undefined,
          response: undefined,
        });

        discountService.getMyDiscountsPage(request.page, request.sort, request.direction, request.size).subscribe({
          next: (value) => patchState(store, {
            data: { kind: 'pagination', value },
            subErrors: undefined,
            response: undefined,
          }),
          error: patchError,
        });
      },

      loadReferrals(): void {
        patchState(store, {
          referrals: [],
          subErrors: undefined,
          selected: undefined,
          response: undefined,
        });

        discountService.getMyReferrals().subscribe({
          next: (referrals) => patchState(store, {
            referrals,
            subErrors: undefined,
            response: undefined,
          }),
          error: patchError,
        });
      },

      loadCurrencies(): void {
        patchState(store, {
          currencies: [],
          subErrors: undefined,
          response: undefined,
        });

        currencyService.getAllCurrency().subscribe({
          next: (currencies) => patchState(store, {
            currencies,
            subErrors: undefined,
            response: undefined,
          }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        patchState(store, {
          subErrors: undefined,
          selected: undefined,
          response: undefined,
        });

        discountService.getDiscount(id).subscribe({
          next: (selected) => patchState(store, { selected }),
          error: patchError,
        });
      },

      loadUserDiscounts(customerId: string): void {
        patchState(store, {
          data: { kind: 'list', value: [] },
          subErrors: undefined,
          selected: undefined,
          response: undefined,
        });

        discountService.getUserDiscountByCustomerId(customerId).subscribe({
          next: (value) => patchState(store, {
            data: { kind: 'list', value },
            subErrors: undefined,
            response: undefined,
          }),
          error: patchError,
        });
      },

      create(discount: IDiscount): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          isLoading: true,
          selected: undefined,
        });

        discountService.createDiscount(discount).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('DISCOUNT.CREATED', { name: response.name }),
              path: `discounts/${ response.id }`,
              redirect: 'discounts',
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, discount: IDiscount): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          isLoading: true,
          selected: undefined,
        });

        discountService.updateDiscount(id, discount).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('DISCOUNT.UPDATED.MESSAGE', { name: response.name }),
              path: `discounts/${ response.id }`,
              redirect: 'discounts',
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(id: string, name: string): void {
        patchState(store, {
          subErrors: undefined,
          response: undefined,
          isLoading: true,
          selected: undefined,
        });

        discountService.deleteDiscount(id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translate.instant('DISCOUNT.DELETED.MESSAGE', { name }),
              reload: true,
              toastType: 'warning',
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },

      sendToCustomers(id: string, customersDiscount: string[]): void {
        patchState(store, {
          subErrors: undefined,
          selected: undefined,
          response: undefined,
          isLoading: true,
        });

        discountService.sendDiscounts(id, customersDiscount).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translate.instant('DISCOUNT.SEND', { name: response.name }),
            },
            selected: undefined,
            subErrors: undefined,
            isLoading: false,
          }),
          error: patchError,
        });
      },
    };
  }),
);

export const discountIcon = (discount: Pick<IDiscountAll, 'type' | 'currency'>): string => {
  switch (discount.type) {
    case DiscountType.money:
      return discount.currency?.icon ?? 'euro';
    case DiscountType.percentage:
      return 'percent';
    default:
      return '';
  }
};
