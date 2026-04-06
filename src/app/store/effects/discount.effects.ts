import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import {
  createDiscount,
  currencySuccess,
  deleteDiscount,
  discountFailure,
  discountSaveSuccess,
  discountSelected,
  discountSuccess,
  getAllCurrency,
  getDiscount,
  getDiscountsPage,
  getMyDiscountsPage,
  getMyReferrals,
  getUserDiscountByCustomerId,
  referralSuccess,
  sendDiscountToCustomers,
  updateDiscount,
} from '../discount.actions';
import { TranslateService } from '@ngx-translate/core';
import { DiscountService } from '../../services/discount.service';
import { Router } from '@angular/router';
import { CurrencyService } from '../../services/currency.service';
import { Pagination } from '../../interfaces/pagination';
import { IDiscount, IDiscountAll, IReferral, IUserDiscount } from '../../interfaces/discount';
import { ICurrency } from '../../interfaces/currency';
import { IApiResponse, success, successResponse } from '../../interfaces/common';
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class DiscountEffects {
  translate: TranslateService = inject(TranslateService);
  actions: Actions = inject(Actions);
  discountService: DiscountService = inject(DiscountService);
  currencyService: CurrencyService = inject(CurrencyService);
  router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getDiscountsPage),
    switchMap(({ page, sort, direction, size }) => effectRequest(
      this.discountService.getDiscountsPage(page, sort, direction, size)
        .pipe(switchMap((value: Pagination<IDiscountAll>) => of(discountSuccess({
          data: { kind: 'paginationDiscount', value },
        })))),
      action => action,
      discountFailure,
    )),
  ));

  getMyDiscounts$ = createEffect(() => this.actions.pipe(
    ofType(getMyDiscountsPage),
    switchMap(({ page, sort, direction, size }) => effectRequest(
      this.discountService.getMyDiscountsPage(page, sort, direction, size).pipe(
        switchMap((value: Pagination<IUserDiscount>) => of(discountSuccess({ data: { kind: 'pagination', value } })))),
      action => action,
      discountFailure,
    )),
  ));

  getMyReferrals$ = createEffect(() => this.actions.pipe(
    ofType(getMyReferrals),
    switchMap(() => effectRequest(
      this.discountService.getMyReferrals()
        .pipe(switchMap((referrals: IReferral[]) => of(referralSuccess({ referrals })))),
      action => action,
      discountFailure,
    )),
  ));

  getCurrencies$ = createEffect(() => this.actions.pipe(
    ofType(getAllCurrency),
    switchMap(() => effectRequest(
      this.currencyService.getAllCurrency()
        .pipe(switchMap((currencies: ICurrency[]) => of(currencySuccess({ currencies })))),
      action => action,
      discountFailure,
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getDiscount),
    switchMap(({ id }) => effectRequest(
      this.discountService.getDiscount(id)
        .pipe(switchMap((selected?: IDiscount) => of(discountSelected({ selected })))),
      action => action,
      discountFailure,
    )),
  ));

  findByCustomer$ = createEffect(() => this.actions.pipe(
    ofType(getUserDiscountByCustomerId),
    switchMap(({ customerId }) => effectRequest(
      this.discountService.getUserDiscountByCustomerId(customerId)
        .pipe(switchMap((value: IUserDiscount[]) => of(discountSuccess({ data: { kind: 'list', value } })))),
      action => action,
      discountFailure,
    )),
  ));

  addDiscount$ = createEffect(() => this.actions.pipe(
    ofType(sendDiscountToCustomers),
    switchMap(({ id, customersDiscount }) => effectRequest(
      this.discountService.sendDiscounts(id, customersDiscount).pipe(switchMap((response: IApiResponse) => {
        const message = this.translate.instant('DISCOUNT.SEND', { name: response.name });
        return success(discountSaveSuccess, message);
      })),
      action => action,
      discountFailure,
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createDiscount),
    switchMap(({ discount }) => effectRequest(
      this.discountService.createDiscount(discount).pipe(switchMap((response: IApiResponse) => {
        const message = this.translate.instant('DISCOUNT.CREATED', { name: response.name });
        const path = `discounts/${ response.id }`;
        return successResponse(discountSaveSuccess, message, path, 'discounts');
      })),
      action => action,
      discountFailure,
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateDiscount),
    switchMap(({ id, discount }) => effectRequest(
      this.discountService.updateDiscount(id, discount).pipe(switchMap((response: IApiResponse) => {
        const message = this.translate.instant('DISCOUNT.UPDATED.MESSAGE', { name: response.name });
        const path = `discounts/${ response.id }`;
        return successResponse(discountSaveSuccess, message, path, 'discounts');
      })),
      action => action,
      discountFailure,
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteDiscount),
    switchMap(({ id, name }) => effectRequest(
      this.discountService.deleteDiscount(id).pipe(switchMap(() => {
        const message = this.translate.instant('DISCOUNT.DELETED.MESSAGE', { name });
        return success(discountSaveSuccess, message, undefined, true, 'warning');
      })),
      action => action,
      discountFailure,
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(discountSelected),
    tap(({ selected }) => this.router.navigate([this.translate.getCurrentLang(), 'discounts', selected?.id])),
  ), { dispatch: false });
}
