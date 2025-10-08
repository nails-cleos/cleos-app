import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  CreateDiscount,
  CurrencySuccess,
  DeleteDiscount,
  DiscountActionTypes,
  DiscountFailure,
  DiscountSaveSuccess,
  DiscountSelected,
  DiscountSuccess,
  GetDiscount,
  GetUserDiscountByCustomerId,
  GetDiscountsPage,
  GetMyDiscountsPage,
  ReferralSuccess,
  SendDiscountToCustomers,
  UpdateDiscount,
} from '../discount.actions';
import { TranslateService } from '@ngx-translate/core';
import { DiscountService } from '../../services/discount.service';
import { Router } from '@angular/router';
import { CurrencyService } from '../../services/currency.service';
import { Pagination } from '../../interfaces/pagination';
import { IDiscount, IReferral, IUserDiscount } from '../../interfaces/discount';
import { ICurrency } from '../../interfaces/currency';
import { IApiResponse, success } from '../../interfaces/common';

@Injectable()
export class DiscountEffects {

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(DiscountActionTypes.getDiscountsPage),
    switchMap((action: GetDiscountsPage) =>
      this.discountService.getDiscountsPage(action.page, action.sort, action.direction, action.size).pipe(
        switchMap((discounts: Pagination<IDiscount>) => of(new DiscountSuccess(discounts))),
        catchError((err: HttpErrorResponse) => of(new DiscountFailure(err.error))),
      )),
  ));

  getMyDiscounts$ = createEffect(() => this.actions.pipe(
    ofType(DiscountActionTypes.getMyDiscountsPage),
    switchMap((action: GetMyDiscountsPage) =>
      this.discountService.getMyDiscountsPage(action.page, action.sort, action.direction, action.size).pipe(
        switchMap((discounts: Pagination<IUserDiscount>) => of(new DiscountSuccess(discounts))),
        catchError((err: HttpErrorResponse) => of(new DiscountFailure(err.error))),
      )),
  ));

  getMyReferrals$ = createEffect(() => this.actions.pipe(
    ofType(DiscountActionTypes.getMyReferrals),
    switchMap(() =>
      this.discountService.getMyReferrals().pipe(
        switchMap((referrals: IReferral[]) => of(new ReferralSuccess(referrals))),
        catchError((err: HttpErrorResponse) => of(new DiscountFailure(err.error))),
      )),
  ));

  getCurrencies$ = createEffect(() => this.actions.pipe(
    ofType(DiscountActionTypes.getAllCurrency),
    switchMap(() =>
      this.currencyService.getAllCurrency().pipe(
        switchMap((currencies: ICurrency[]) => of(new CurrencySuccess(currencies))),
        catchError((err: HttpErrorResponse) => of(new DiscountFailure(err.error))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(DiscountActionTypes.getDiscount),
    switchMap((action: GetDiscount) =>
      this.discountService.getDiscount(action.id).pipe(
        switchMap((discount?: IDiscount) => of(new DiscountSelected(discount))),
        catchError((err: HttpErrorResponse) => of(new DiscountFailure(err.error))),
      )),
  ));

  findByCustomer$ = createEffect(() => this.actions.pipe(
    ofType(DiscountActionTypes.getUserDiscountByCustomerId),
    switchMap((action: GetUserDiscountByCustomerId) =>
      this.discountService.getUserDiscountByCustomerId(action.customerId).pipe(
        switchMap((discounts: IUserDiscount[]) => of(new DiscountSuccess(discounts))),
        catchError((err: HttpErrorResponse) => of(new DiscountFailure(err.error))),
      )),
  ));

  addDiscount$ = createEffect(() => this.actions.pipe(
    ofType(DiscountActionTypes.sendDiscountToCustomers),
    switchMap((action: SendDiscountToCustomers) =>
      this.discountService.sendDiscounts(action.id, action.customersDiscount).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('DISCOUNT.SEND', { name: response.name });
          return success(DiscountSaveSuccess, message);
        }),
        catchError((err: HttpErrorResponse) => of(new DiscountFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(DiscountActionTypes.createDiscount),
    switchMap((action: CreateDiscount) =>
      this.discountService.createDiscount(action.discount).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('DISCOUNT.CREATED', { name: response.name });
          const path = `discounts/${ response.id }`;
          return success(DiscountSaveSuccess, message, path);
        }),
        catchError((err: HttpErrorResponse) => of(new DiscountFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(DiscountActionTypes.updateDiscount),
    switchMap((action: UpdateDiscount) =>
      this.discountService.updateDiscount(action.id, action.discount).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('DISCOUNT.UPDATED.MESSAGE', { name: response.name });
          const path = `discounts/${ response.id }`;
          return success(DiscountSaveSuccess, message, path);
        }),
        catchError((err: HttpErrorResponse) => of(new DiscountFailure(err.error))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(DiscountActionTypes.deleteDiscount),
    switchMap((action: DeleteDiscount) =>
      this.discountService.deleteDiscount(action.id).pipe(
        switchMap(() => {
          const message = this.translate.instant('DISCOUNT.DELETED.MESSAGE', { name: action.name });
          return success(DiscountSaveSuccess, message, undefined, undefined, 'warning');
        }),
        catchError((err: HttpErrorResponse) => of(new DiscountFailure(err.error))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(DiscountActionTypes.discountSelected),
    tap((data: DiscountSelected) => this.router.navigate([this.translate.currentLang, 'discounts', data.selected?.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(DiscountActionTypes.discountSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(DiscountActionTypes.discountSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private discountService: DiscountService, private currencyService: CurrencyService,
              private router: Router) {
  }
}
