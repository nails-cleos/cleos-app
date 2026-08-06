import { inject } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { IApiResponse } from '../interfaces/common';
import { IColor, IColorAll } from '../color/color';
import { ColorService } from '../services/color.service';
import { withCrudStoreMethods, withCrudStoreState } from './crud-signal-store';
import { Pagination } from '../interfaces/pagination';

type ColorData =
  | { kind: 'pagination'; value?: Pagination<IColorAll> }
  | { kind: 'list'; value?: IColorAll[] };

export const ColorStore = signalStore(
  { providedIn: 'root' },
  withCrudStoreState<IColorAll, ColorData, IColorAll>(),
  withCrudStoreMethods<IColor, IApiResponse, IApiResponse, { id: string; name: string }>(() => {
    const colorService = inject(ColorService);
    const translateService = inject(TranslateService);

    return {
      loadPage: ({ page, sort, direction, size }) => colorService.getColorsPage(page, sort, direction, size),
      loadById: (id) => colorService.getColor(id),
      loadByExternalId: (treatmentId: string) => colorService.getColorsByTreatmentId(treatmentId),
      loadAll: () => colorService.getAllColors(),
      create: (color) => colorService.createColor(color),
      update: (id, color) => colorService.updateColor(id, color),
      delete: ({ id }) => colorService.deleteColor(id),
      createResponse: (response) => ({
        message: translateService.instant('COLOR.CREATED', { name: response.name }),
        path: `colors/${ response.id }`,
        redirect: 'colors',
      }),
      updateResponse: (response) => ({
        message: translateService.instant('COLOR.UPDATED.MESSAGE', { name: response.name }),
        path: `colors/${ response.id }`,
        redirect: 'colors',
      }),
      deleteResponse: ({ name }) => ({
        message: translateService.instant('COLOR.DELETED.MESSAGE', { name }),
        reload: true,
        toastType: 'warning',
      }),
    };
  }),
);
