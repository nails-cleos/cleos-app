import { createAction, props } from '@ngrx/store';
import { ICatalogue, ICatalogueAll } from '../interfaces/catalogue';
import { ITreatmentGroup } from '../interfaces/treatment';
import { IError, IResponseSuccess } from '../interfaces/common';

enum CatalogueActionTypes {
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

export const getAllCatalogues = createAction(CatalogueActionTypes.getAllCatalogues);

export const getAllCatalogs = createAction(CatalogueActionTypes.getAllCatalogs);

export const catalogueSuccess = createAction(
  CatalogueActionTypes.catalogueSuccess,
  props<{ data: ICatalogue[] }>(),
);

export const catalogueSaveSuccess = createAction(
  CatalogueActionTypes.catalogueSaveSuccess,
  props<IResponseSuccess>(),
);

export const catalogueFailure = createAction(
  CatalogueActionTypes.catalogueFailure,
  props<{ error: IError }>(),
);

export const createCatalogue = createAction(
  CatalogueActionTypes.createCatalogue,
  props<{ catalogue: ICatalogue; resizedImageDataUrl: string }>(),
);

export const updateCatalogue = createAction(
  CatalogueActionTypes.updateCatalogue,
  props<{ catalogue: ICatalogue; resizedImageDataUrl: string }>(),
);

export const updateCatalogueOrder = createAction(
  CatalogueActionTypes.updateCatalogueOrder,
  props<{ catalogues: ICatalogueAll[] }>(),
);

export const catalogueSelected = createAction(
  CatalogueActionTypes.catalogueSelected,
  props<{ selected?: ICatalogue }>(),
);

export const getCatalogue = createAction(
  CatalogueActionTypes.getCatalogue,
  props<{ id: string }>(),
);

export const deleteCatalogue = createAction(
  CatalogueActionTypes.deleteCatalogue,
  props<{ id: string; name: string }>(),
);

export const getAllTreatmentsGroup = createAction(CatalogueActionTypes.getAllTreatmentsGroup);

export const findGroupsSuccess = createAction(
  CatalogueActionTypes.findGroupsSuccess,
  props<{ groups: ITreatmentGroup[] }>(),
);

export const clean = createAction(CatalogueActionTypes.clean);
