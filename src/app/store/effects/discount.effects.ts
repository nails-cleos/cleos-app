import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsDiscount from '../discount.actions';
import { TranslateService } from '@ngx-translate/core';
import { DiscountService } from '../../services/discount.service';
import { Router } from '@angular/router';
import { CurrencyService } from '../../services/currency.service';

@Injectable()
export class DiscountEffects {

  getAll$ = createEffect(() => this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.getDiscountsPage))
    .pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.discountService.getDiscountsPage(payload.active, payload.direction, payload.page,
        payload.size).pipe(
        switchMap((response: any) => of(new fromActionsDiscount.DiscountSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({ error: err.error }))),
      )),
    ));

  getMyDiscounts$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.getMyDiscountsPage)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.discountService.getMyDiscountsPage(payload.active, payload.direction,
        payload.page, payload.size).pipe(
        switchMap((response: any) => of(new fromActionsDiscount.DiscountSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({ error: err.error }))),
      )),
    ));

  getMyReferrals$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.getMyReferrals)).pipe(
      map((action: any) => action.payload),
      switchMap(() => this.discountService.getMyReferrals().pipe(
        switchMap((response: any) => of(new fromActionsDiscount.ReferralSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({ error: err.error }))),
      )),
    ));

  getCurrencies = createEffect(
    () => this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.getAllCurrency)).pipe(
      map((action: any) => action.payload),
      switchMap(() => this.currencyService.getAllCurrency().pipe(
        switchMap((response: any) => of(new fromActionsDiscount.CurrencySuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({ error: err.error }))),
      )),
    ));

  findOne$ = createEffect(() => this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.discountFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.discountService.findDiscountById(payload).pipe(
      switchMap((discount: any) => of(new fromActionsDiscount.DiscountSelected(discount))),
      catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({ error: err.error }))),
    )),
  ));

  findByCustomer$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.discountFindByCustomer)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.discountService.findUserDiscountByCustomerId(payload).pipe(
        switchMap((discount: any) => of(new fromActionsDiscount.DiscountSuccess(discount))),
        catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({ error: err.error }))),
      )),
    ));

  addDiscount$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.sendDiscountToCustomers)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.discountService.sendDiscountToCustomers(payload.discountId, payload.customerIds)
        .pipe(
          switchMap((response: any) => {
            const message = this.translate.instant('DISCOUNT.SEND', { name: response.name });
            return of(new fromActionsDiscount.DiscountSaveSuccess({ message }));
          }), catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({ error: err.error }))),
        )),
    ));

  save$ = createEffect(() => this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.discountSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.discountService.createDiscount(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('DISCOUNT.CREATED', { name: response.name });
        return of(new fromActionsDiscount.DiscountSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({ error: err.error }))),
    )),
  ));

  update = createEffect(() => this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.discountUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.discountService.updateDiscountById(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('DISCOUNT.UPDATED.MESSAGE', { name: response.name });
        return of(new fromActionsDiscount.DiscountSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({ error: err.error }))),
    )),
  ));

  delete$ = createEffect(() => this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.discountDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.discountService.deleteDiscountById(payload.id).pipe(
      switchMap(() => {
        const message = this.translate.instant('DISCOUNT.DELETED.MESSAGE', { name: payload.name });
        return of(new fromActionsDiscount.DiscountSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({ error: err.error }))),
    )),
  ));

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsDiscount.DiscountActionTypes.discountSelected),
    tap((data: any) => this.router.navigate([this.translate.currentLang, 'discounts', data.payload.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsDiscount.DiscountActionTypes.discountSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsDiscount.DiscountActionTypes.discountSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions$: Actions,
              private discountService: DiscountService,
              private currencyService: CurrencyService, private router: Router) {
  }
}
