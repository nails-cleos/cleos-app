import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsCatalogue from '../catalogue.actions';
import { TranslateService } from '@ngx-translate/core';
import { CatalogueService } from '../../services/catalogue.service';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Injectable()
export class CatalogueEffects {

  @Effect()
  getAll$ = this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.catalogueService.getAll().pipe(
      switchMap((response: any) => response ? of(new fromActionsCatalogue.CatalogueSuccess(response))
        : of(new fromActionsCatalogue.CatalogueFailure({error: {status: 'NO_CONTENT'}}))),
      catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({error: err.error})))
    ))
  );

  @Effect()
  findOne$ = this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.catalogueService.getById(payload).pipe(
      switchMap((catalogue: any) => of(new fromActionsCatalogue.CatalogueSelected(catalogue))),
      catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({error: err.error})))
    ))
  );

  @Effect()
  save$ = this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.catalogueService.add(payload.catalogue, payload.file).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('CATALOGUE.ADD.CREATED', {name: response.name});
        return of(new fromActionsCatalogue.CatalogueSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({error: err.error})))
    ))
  );

  @Effect()
  update$ = this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.catalogueService.update(payload.catalogue, payload.file).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('CATALOGUE.UPDATED.MESSAGE', {name: response.name});
        return of(new fromActionsCatalogue.CatalogueSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({error: err.error})))
    ))
  );

  @Effect()
  updateAll$ = this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueUpdateAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.catalogueService.updateAll(payload).pipe(
      switchMap(() => {
        const message = this.translate.instant('CATALOGUE.UPDATED.ALL.MESSAGE');
        return of(new fromActionsCatalogue.CatalogueSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({error: err.error})))
    ))
  );

  @Effect()
  delete$ = this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.catalogueService.delete(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('CATALOGUE.DELETED.MESSAGE', {name: response.name});
        return of(new fromActionsCatalogue.CatalogueSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({error: err.error})))
    ))
  );

  @Effect({dispatch: false})
  selectedData$ = this.actions$.pipe(
    ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueSelected),
    tap((data: any) => this.router.navigate(['catalogue', data.payload.id]))
  );

  @Effect({dispatch: false})
  dataSuccess$ = this.actions$.pipe(
    ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueSuccess)
  );

  @Effect({dispatch: false})
  saveSuccess$ = this.actions$.pipe(
    ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueSaveSuccess),
    tap(() => this.router.navigate(['catalogues']))
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions,
              private catalogueService: CatalogueService, private router: Router) {
  }
}
