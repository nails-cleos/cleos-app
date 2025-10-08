import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  CatalogueActionTypes,
  CatalogueFailure,
  CatalogueSaveSuccess,
  CatalogueSelected,
  CatalogueSuccess,
  CreateCatalogue,
  DeleteCatalogue,
  GetCatalogue,
  FindGroupsSuccess,
  UpdateCatalogue,
  UpdateCatalogueOrder,
} from '../catalogue.actions';
import { TranslateService } from '@ngx-translate/core';
import { CatalogueService } from '../../services/catalogue.service';
import { Router } from '@angular/router';
import { TreatmentService } from '../../services/treatment.service';
import { ICatalogue } from '../../interfaces/catalogue';
import { ITreatmentGroup } from '../../interfaces/treatment';
import { IApiResponse, success } from '../../interfaces/common';

@Injectable()
export class CatalogueEffects {

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(CatalogueActionTypes.getAllCatalogues),
    switchMap(() =>
      this.catalogueService.getAllCatalogues().pipe(
        switchMap(
          (catalogues: ICatalogue[]) => of(new CatalogueSuccess(catalogues ? catalogues : []))),
        catchError((err: HttpErrorResponse) => of(new CatalogueFailure(err.error))),
      )),
  ));

  getAllCatalogs$ = createEffect(() => this.actions.pipe(
    ofType(CatalogueActionTypes.getAllCatalogs),
    switchMap(() =>
      this.catalogueService.getAllCatalogs().pipe(
        switchMap(
          (catalogues: ICatalogue[]) => of(new CatalogueSuccess(catalogues ? catalogues : []))),
        catchError((err: HttpErrorResponse) => of(new CatalogueFailure(err.error))),
      )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(CatalogueActionTypes.getCatalogue),
    switchMap((action: GetCatalogue) =>
      this.catalogueService.getCatalogue(action.id).pipe(
        switchMap(
          (catalogue?: ICatalogue) => of(new CatalogueSelected(catalogue))),
        catchError((err: HttpErrorResponse) => of(new CatalogueFailure(err.error))),
      )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(CatalogueActionTypes.createCatalogue),
    switchMap((action: CreateCatalogue) =>
      this.catalogueService.createCatalogue(action.catalogue, action.resizedImageDataUrl).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('CATALOGUE.CREATED', { name: response.name });
          const path = `catalogues/${ response.id }`;
          return success(CatalogueSaveSuccess, message, path);
        }),
        catchError((err: HttpErrorResponse) => of(new CatalogueFailure(err.error))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(CatalogueActionTypes.updateCatalogue),
    switchMap((action: UpdateCatalogue) =>
      this.catalogueService.updateCatalogue(action.catalogue, action.resizedImageDataUrl).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('CATALOGUE.UPDATED.MESSAGE', { name: response.name });
          const path = `catalogues/${ response.id }`;
          return success(CatalogueSaveSuccess, message, path);
        }),
        catchError((err: HttpErrorResponse) => of(new CatalogueFailure(err.error))),
      )),
  ));

  updateAll$ = createEffect(() => this.actions.pipe(
    ofType(CatalogueActionTypes.updateCatalogueOrder),
    switchMap((action: UpdateCatalogueOrder) =>
      this.catalogueService.updateCatalogueOrder(action.catalogues).pipe(
        switchMap(() => {
          const message = this.translate.instant('CATALOGUE.UPDATED.ALL.MESSAGE');
          return success(CatalogueSaveSuccess, message);
        }),
        catchError((err: HttpErrorResponse) => of(new CatalogueFailure(err.error))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(CatalogueActionTypes.deleteCatalogue),
    switchMap((action: DeleteCatalogue) =>
      this.catalogueService.deleteCatalogue(action.id).pipe(
        switchMap(() => {
          const message = this.translate.instant('CATALOGUE.DELETED.MESSAGE', { name: action.name });
          return success(CatalogueSaveSuccess, message, undefined, undefined, 'warning');
        }),
        catchError((err: HttpErrorResponse) => of(new CatalogueFailure(err.error))),
      )),
  ));

  findGroups$ = createEffect(() => this.actions.pipe(
    ofType(CatalogueActionTypes.getAllTreatmentsGroup),
    switchMap(() =>
      this.treatmentService.getAllTreatmentsGroup().pipe(
        switchMap((groups: ITreatmentGroup[]) => of(new FindGroupsSuccess(groups))),
        catchError((err: HttpErrorResponse) => of(new CatalogueFailure(err.error))),
      )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(CatalogueActionTypes.catalogueSelected),
    tap(
      (data: CatalogueSelected) => this.router.navigate([this.translate.currentLang, 'catalogues', data.selected?.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(CatalogueActionTypes.catalogueSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(CatalogueActionTypes.catalogueSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private catalogueService: CatalogueService, private treatmentService: TreatmentService,
              private router: Router) {
  }
}
