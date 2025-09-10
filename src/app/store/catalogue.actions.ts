import { Action } from '@ngrx/store';
import { IError, ResponseSuccess } from '../interfaces/common';
import { ICatalogue, ICatalogueAll } from '../interfaces/catalogue';
import { ITreatmentGroup } from '../interfaces/treatment';

export enum CatalogueActionTypes {
  getAllCatalogues = '[Catalogue] Get all catalogues',
  getAllCatalogs = '[Catalogue] Get all catalogs',
  catalogueSuccess = '[Catalogue] Success',
  createCatalogue = '[Catalogue] Create catalogue',
  updateCatalogue = '[Catalogue] Update catalogue by id',
  updateCatalogueOrder = '[Catalogue] Update catalogue order',
  catalogueSaveSuccess = '[Catalogue] Save Success',
  catalogueFailure = '[Catalogue] Failure',
  catalogueSelected = '[Catalogue] Selected',
  getCatalogue = '[Catalogue] Catalogue find by id',
  deleteCatalogue = '[Catalogue] Delete catalogue by id',
  getAllTreatmentsGroup = '[Catalogue] Get all treatments group',
  findGroupsSuccess = '[Catalogue] Find treatment groups success',
  clean = '[Catalogue] Clean'
}

export class GetAllCatalogues implements Action {
  readonly type = CatalogueActionTypes.getAllCatalogues;
}

export class GetAllCatalogs implements Action {
  readonly type = CatalogueActionTypes.getAllCatalogs;
}

export class CatalogueSuccess implements Action {
  readonly type = CatalogueActionTypes.catalogueSuccess;

  constructor(public data: ICatalogue[]) {
  }
}

export class CreateCatalogue implements Action {
  readonly type = CatalogueActionTypes.createCatalogue;

  constructor(public catalogue: ICatalogue, public resizedImageDataUrl: string) {
  }
}

export class UpdateCatalogue implements Action {
  readonly type = CatalogueActionTypes.updateCatalogue;

  constructor(public catalogue: ICatalogue, public resizedImageDataUrl: string) {
  }
}

export class UpdateCatalogueOrder implements Action {
  readonly type = CatalogueActionTypes.updateCatalogueOrder;

  constructor(public catalogues: ICatalogueAll[]) {
  }
}

export class CatalogueSaveSuccess extends ResponseSuccess implements Action {
  readonly type = CatalogueActionTypes.catalogueSaveSuccess;
}

export class CatalogueFailure implements Action {
  readonly type = CatalogueActionTypes.catalogueFailure;

  constructor(public error: IError) {
  }
}

export class CatalogueSelected implements Action {
  readonly type = CatalogueActionTypes.catalogueSelected;

  constructor(public selected?: ICatalogue) {
  }
}

export class GetCatalogue implements Action {
  readonly type = CatalogueActionTypes.getCatalogue;

  constructor(public id: string) {
  }
}

export class DeleteCatalogue implements Action {
  readonly type = CatalogueActionTypes.deleteCatalogue;

  constructor(public id: string, public name: string) {
  }
}

export class GetAllTreatmentsGroup implements Action {
  readonly type = CatalogueActionTypes.getAllTreatmentsGroup;
}

export class FindGroupsSuccess implements Action {
  readonly type = CatalogueActionTypes.findGroupsSuccess;

  constructor(public groups: ITreatmentGroup[]) {
  }
}

export class Clean implements Action {
  readonly type = CatalogueActionTypes.clean;
}

export type All =
  | GetAllCatalogues
  | GetAllCatalogs
  | CreateCatalogue
  | UpdateCatalogue
  | UpdateCatalogueOrder
  | CatalogueSuccess
  | CatalogueSaveSuccess
  | CatalogueFailure
  | GetCatalogue
  | CatalogueSelected
  | DeleteCatalogue
  | GetAllTreatmentsGroup
  | FindGroupsSuccess
  | Clean;
