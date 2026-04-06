import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap } from 'rxjs/operators';
import {
  catalogueFailure,
  catalogueSaveSuccess,
  catalogueSelected,
  catalogueSuccess,
  createCatalogue,
  deleteCatalogue,
  findGroupsSuccess,
  getAllCatalogs,
  getAllCatalogues,
  getAllTreatmentsGroup,
  getCatalogue,
  updateCatalogue,
  updateCatalogueOrder,
} from '../catalogue.actions';
import { TranslateService } from '@ngx-translate/core';
import { CatalogueService } from '../../services/catalogue.service';
import { Router } from '@angular/router';
import { TreatmentService } from '../../services/treatment.service';
import { ICatalogueAll } from '../../interfaces/catalogue';
import { ITreatmentGroupAll } from '../../interfaces/treatment';
import { IApiResponse, success, successResponse } from '../../interfaces/common';
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class CatalogueEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly catalogueService: CatalogueService = inject(CatalogueService);
  private readonly treatmentService: TreatmentService = inject(TreatmentService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getAllCatalogues),
    switchMap(() => effectRequest(
      this.catalogueService.getAllCatalogues().pipe(map((data: ICatalogueAll[]) =>
        catalogueSuccess(data ? { data } : { data: [] }))),
      action => action,
      catalogueFailure,
    )),
  ));

  getAllCatalogs$ = createEffect(() => this.actions.pipe(
    ofType(getAllCatalogs),
    switchMap(() => effectRequest(
      this.catalogueService.getAllCatalogs().pipe(map((data: ICatalogueAll[]) =>
        catalogueSuccess(data ? { data } : { data: [] }))),
      action => action,
      catalogueFailure,
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getCatalogue),
    switchMap(({ id }) => effectRequest(
      this.catalogueService.getCatalogue(id).pipe(map((selected?: ICatalogueAll) => catalogueSelected({ selected }))),
      action => action,
      catalogueFailure,
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createCatalogue),
    switchMap(({ catalogue, resizedImageDataUrl }) => effectRequest(
      this.catalogueService.createCatalogue(catalogue, resizedImageDataUrl).pipe(switchMap((response: IApiResponse) => {
        const message = this.translate.instant('CATALOGUE.CREATED', { name: response.name });
        const path = `catalogues/${ response.id }`;
        return successResponse(catalogueSaveSuccess, message, path, 'catalogues');
      })),
      action => action,
      catalogueFailure,
    )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateCatalogue),
    switchMap(({ id, catalogue, resizedImageDataUrl }) => effectRequest(
      this.catalogueService.updateCatalogue(id, catalogue, resizedImageDataUrl)
        .pipe(switchMap((response: IApiResponse) => {
          const message = this.translate.instant('CATALOGUE.UPDATED.MESSAGE', { name: response.name });
          const path = `catalogues/${ response.id }`;
          return successResponse(catalogueSaveSuccess, message, path, 'catalogues');
        })),
      action => action,
      catalogueFailure,
    )),
  ));

  updateAll$ = createEffect(() => this.actions.pipe(
    ofType(updateCatalogueOrder),
    switchMap(({ catalogues }) => effectRequest(
      this.catalogueService.updateCatalogueOrder(catalogues).pipe(switchMap(() => {
        const message = this.translate.instant('CATALOGUE.UPDATED.ALL.MESSAGE');
        return success(catalogueSaveSuccess, message);
      })),
      action => action,
      catalogueFailure,
    )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteCatalogue),
    switchMap(({ id, name }) => effectRequest(
      this.catalogueService.deleteCatalogue(id).pipe(switchMap(() => {
        const message = this.translate.instant('CATALOGUE.DELETED.MESSAGE', { name });
        return success(catalogueSaveSuccess, message, undefined, true, 'warning');
      })),
      action => action,
      catalogueFailure,
    )),
  ));

  findGroups$ = createEffect(() => this.actions.pipe(
    ofType(getAllTreatmentsGroup),
    switchMap(() => effectRequest(
      this.treatmentService.getAllTreatmentsGroup().pipe(map((groups: ITreatmentGroupAll[]) =>
        findGroupsSuccess({ groups }))),
      action => action,
      catalogueFailure,
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(catalogueSelected),
    tap(({ selected }) => this.router.navigate([this.translate.getCurrentLang(), 'catalogues', selected?.id])),
  ), { dispatch: false });
}
