import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsCatalogue from '../catalogue.actions';
import { TranslateService } from '@ngx-translate/core';
import { CatalogueService } from '../../services/catalogue.service';
import { Router } from '@angular/router';

@Injectable()
export class CatalogueEffects {

  @Effect()
  getAll$ = this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.GET_ALL)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.catalogueService.getAll().pipe(
        switchMap((response: any) => {
          return of(new fromActionsCatalogue.CatalogueSuccess(response));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({error: err.error})))
      );
    })
  );

  @Effect()
  findOne$ = this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.CATALOGUE_FIND)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.catalogueService.getById(payload).pipe(
        switchMap((catalogue: any) => {
          return of(new fromActionsCatalogue.CatalogueSelected(catalogue));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({error: err.error})))
      );
    })
  );

  @Effect()
  save$ = this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.CATALOGUE_SAVE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.catalogueService.add(payload.catalogue, payload.file).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('CATALOGUE.ADD.CREATED', {name: response.name});
          return of(new fromActionsCatalogue.CatalogueSaveSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({error: err.error})))
      );
    })
  );

  @Effect()
  update$ = this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.CATALOGUE_UPDATE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.catalogueService.update(payload.catalogue, payload.file).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('CATALOGUE.UPDATED.MESSAGE', {name: response.name});
          return of(new fromActionsCatalogue.CatalogueSaveSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({error: err.error})))
      );
    })
  );

  @Effect()
  updateAll$ = this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.CATALOGUE_UPDATE_ALL)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.catalogueService.updateAll(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('CATALOGUE.UPDATED.ALL.MESSAGE');
          return of(new fromActionsCatalogue.CatalogueSaveSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({error: err.error})))
      );
    })
  );

  @Effect()
  delete$ = this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.CATALOGUE_DELETE)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => {
      return this.catalogueService.delete(payload).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('CATALOGUE.DELETED.MESSAGE', {name: response.name});
          return of(new fromActionsCatalogue.CatalogueSaveSuccess({message}));
        }),
        catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({error: err.error})))
      );
    })
  );

  @Effect({dispatch: false})
  selectedData$ = this.actions$.pipe(
    ofType(fromActionsCatalogue.CatalogueActionTypes.CATALOGUE_SELECTED),
    tap((data: any) => {
      this.router.navigate(['catalogue', data.payload.id]);
    })
  );

  @Effect({dispatch: false})
  dataSuccess$ = this.actions$.pipe(
    ofType(fromActionsCatalogue.CatalogueActionTypes.CATALOGUE_SUCCESS)
  );

  @Effect({dispatch: false})
  saveSuccess$ = this.actions$.pipe(
    ofType(fromActionsCatalogue.CatalogueActionTypes.CATALOGUE_SAVE_SUCCESS),
    tap(() => {
      this.router.navigate(['catalogues']);
    })
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private catalogueService: CatalogueService,
              private router: Router) {
  }
}
