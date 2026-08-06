import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { Pagination } from '../interfaces/pagination';
import { DiscountType, IDiscount, IDiscountAll, IReferral, IUserDiscount } from '../discount/discount';
import { IApiResponse, PageRequest } from '../interfaces/common';
import { DiscountService } from '../services/discount.service';
import {
  cleanCrudCreate,
  cleanCrudDelete,
  cleanCrudUpdate,
  createStoreInitialState,
  patchCrudError,
  StoreState,
} from './crud-signal-store';
import { HttpErrorResponse } from '@angular/common/http';
import type { Subscription } from 'rxjs';

export type DiscountData =
  | { kind: 'paginationDiscount'; value: Pagination<IDiscountAll> }
  | { kind: 'pagination'; value: Pagination<IUserDiscount> }
  | { kind: 'list'; value: IUserDiscount[] };

type DiscountStoreState = StoreState<DiscountData, IDiscountAll> & {
  referrals: IReferral[] | undefined;
};

const initialState: DiscountStoreState = {
  ...createStoreInitialState<DiscountData, IDiscountAll>(),
  referrals: undefined,
};

export const DiscountStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((
    store,
    discountService = inject(DiscountService),
    translateService = inject(TranslateService),
  ) => {
    let loadPageSubscription: Subscription | undefined;
    let loadMyPageSubscription: Subscription | undefined;
    let loadReferralsSubscription: Subscription | undefined;
    let loadByIdSubscription: Subscription | undefined;
    let loadUserDiscountsSubscription: Subscription | undefined;
    let createSubscription: Subscription | undefined;
    let updateSubscription: Subscription | undefined;
    let deleteSubscription: Subscription | undefined;
    let sendToCustomersSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      loadPageSubscription?.unsubscribe();
      loadMyPageSubscription?.unsubscribe();
      loadReferralsSubscription?.unsubscribe();
      loadByIdSubscription?.unsubscribe();
      loadUserDiscountsSubscription?.unsubscribe();
      createSubscription?.unsubscribe();
      updateSubscription?.unsubscribe();
      deleteSubscription?.unsubscribe();
      sendToCustomersSubscription?.unsubscribe();
    };

    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    return {
      clean(): void {
        cancelAll();
        patchState(store, initialState);
      },

      clearResponse(): void {
        patchState(store, { response: undefined });
      },

      clearError(): void {
        patchState(store, { error: undefined, subErrors: undefined });
      },

      loadPage({ page, sort, direction, size }: PageRequest): void {
        loadPageSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadPageSubscription =
          discountService.getDiscountsPage(page, sort, direction, size).subscribe({
            next: (value) => patchState(store, { data: { kind: 'paginationDiscount', value }, isLoading: false }),
            error: patchError,
          });
      },

      loadMyPage({ page, sort, direction, size }: PageRequest): void {
        loadMyPageSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadMyPageSubscription =
          discountService.getMyDiscountsPage(page, sort, direction, size).subscribe({
            next: (value) => patchState(store, { data: { kind: 'pagination', value }, isLoading: false }),
            error: patchError,
          });
      },

      loadReferrals(): void {
        loadReferralsSubscription?.unsubscribe();
        patchState(store, { referrals: undefined, isLoading: true });

        loadReferralsSubscription = discountService.getMyReferrals().subscribe({
          next: (referrals) => patchState(store, { referrals, isLoading: false }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        loadByIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        loadByIdSubscription = discountService.getDiscount(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      loadUserDiscounts(customerId: string): void {
        loadUserDiscountsSubscription?.unsubscribe();
        patchState(store, { data: { kind: 'list', value: [] }, isLoading: true });

        loadUserDiscountsSubscription = discountService.getUserDiscountByCustomerId(customerId).subscribe({
          next: (value) => patchState(store, { data: { kind: 'list', value }, isLoading: false }),
          error: patchError,
        });
      },

      create(discount: IDiscount): void {
        createSubscription?.unsubscribe();
        cleanCrudCreate(store);

        createSubscription = discountService.createDiscount(discount).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translateService.instant('DISCOUNT.CREATED', { name: response.name }),
              path: `discounts/${ response.id }`,
              redirect: 'discounts',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      update(id: string, discount: IDiscount): void {
        updateSubscription?.unsubscribe();
        cleanCrudUpdate(store);

        updateSubscription = discountService.updateDiscount(id, discount).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translateService.instant('DISCOUNT.UPDATED.MESSAGE', { name: response.name }),
              path: `discounts/${ response.id }`,
              redirect: 'discounts',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      delete(id: string, name: string): void {
        deleteSubscription?.unsubscribe();
        cleanCrudDelete(store);

        deleteSubscription = discountService.deleteDiscount(id).subscribe({
          next: () => patchState(store, {
            response: {
              message: translateService.instant('DISCOUNT.DELETED.MESSAGE', { name }),
              reload: true,
              toastType: 'warning',
            },
            isLoading: false,
          }),
          error: patchError,
        });
      },

      sendToCustomers(id: string, customersDiscount: string[]): void {
        sendToCustomersSubscription?.unsubscribe();
        cleanCrudCreate(store);

        sendToCustomersSubscription = discountService.sendDiscounts(id, customersDiscount).subscribe({
          next: (response: IApiResponse) => patchState(store, {
            response: {
              message: translateService.instant('DISCOUNT.SEND', { name: response.name }),
            },
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
