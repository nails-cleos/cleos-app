import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsProduct from '../product.actions';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';

@Injectable()
export class ProductEffects {

  @Effect()
  getAll$ = this.actions$.pipe(ofType(fromActionsProduct.ProductActionTypes.GET_ALL)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.productService.getAll(payload.active, payload.direction, payload.page).pipe(
        switchMap((response: any) => {
          return of(new fromActionsProduct.ProductSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsProduct.ProductFailure({error: err.error})))
      );
    })
  );

  @Effect()
  findOne$ = this.actions$.pipe(ofType(fromActionsProduct.ProductActionTypes.PRODUCT_FIND)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.productService.getById(payload).pipe(
        switchMap((product: any) => {
          return of(new fromActionsProduct.ProductSelected(product));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsProduct.ProductFailure({error: err.error})))
      );
    })
  );

  @Effect()
  save$ = this.actions$.pipe(ofType(fromActionsProduct.ProductActionTypes.PRODUCT_SAVE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.productService.add(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('PRODUCT.ADD.CREATED', {name: response.name});
          return of(new fromActionsProduct.ProductSaveSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsProduct.ProductFailure({error: err.error})))
      );
    })
  );

  @Effect()
  update = this.actions$.pipe(ofType(fromActionsProduct.ProductActionTypes.PRODUCT_UPDATE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.productService.update(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('PRODUCT.UPDATED.MESSAGE', {name: response.name});
          return of(new fromActionsProduct.ProductSaveSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsProduct.ProductFailure({error: err.error})))
      );
    })
  );

  @Effect()
  delete$ = this.actions$.pipe(ofType(fromActionsProduct.ProductActionTypes.PRODUCT_DELETE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.productService.delete(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('PRODUCT.DELETED.MESSAGE', {name: response.name});
          return of(new fromActionsProduct.ProductSaveSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsProduct.ProductFailure({error: err.error})))
      );
    })
  );

  @Effect({dispatch: false})
  selectedData$ = this.actions$.pipe(
    ofType(fromActionsProduct.ProductActionTypes.PRODUCT_SELECTED),
    tap((data: any) => {
      this.router.navigate(['product', data.payload.id]);
    })
  );

  @Effect({dispatch: false})
  dataSuccess$ = this.actions$.pipe(
    ofType(fromActionsProduct.ProductActionTypes.PRODUCT_SUCCESS)
  );

  @Effect({dispatch: false})
  saveSuccess$ = this.actions$.pipe(
    ofType(fromActionsProduct.ProductActionTypes.PRODUCT_SAVE_SUCCESS),
    tap(() => {
      this.router.navigate(['products']);
    })
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private productService: ProductService,
              private router: Router) {
  }
}
