import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CatalogueStore } from './catalogue.store';
import { CatalogueService } from '../services/catalogue.service';
import { TreatmentService } from '../services/treatment.service';

describe('CatalogueStore', () => {
  let store: InstanceType<typeof CatalogueStore>;
  let catalogueServiceSpy: {
    getAllCatalogues: Mock;
    getAllCatalogs: Mock;
    getCatalogue: Mock;
    createCatalogue: Mock;
    updateCatalogue: Mock;
    updateCatalogueOrder: Mock;
    deleteCatalogue: Mock;
  };
  let treatmentServiceSpy: {
    getAllTreatmentsGroup: Mock;
  };

  beforeEach(() => {
    catalogueServiceSpy = {
      getAllCatalogues: vi.fn().mockName('CatalogueService.getAllCatalogues'),
      getAllCatalogs: vi.fn().mockName('CatalogueService.getAllCatalogs'),
      getCatalogue: vi.fn().mockName('CatalogueService.getCatalogue'),
      createCatalogue: vi.fn().mockName('CatalogueService.createCatalogue'),
      updateCatalogue: vi.fn().mockName('CatalogueService.updateCatalogue'),
      updateCatalogueOrder: vi
        .fn()
        .mockName('CatalogueService.updateCatalogueOrder'),
      deleteCatalogue: vi.fn().mockName('CatalogueService.deleteCatalogue'),
    };
    treatmentServiceSpy = {
      getAllTreatmentsGroup: vi
        .fn()
        .mockName('TreatmentService.getAllTreatmentsGroup'),
    };

    TestBed.configureTestingModule({
      providers: [
        CatalogueStore,
        { provide: CatalogueService, useValue: catalogueServiceSpy },
        { provide: TreatmentService, useValue: treatmentServiceSpy },
      ],
    });

    store = TestBed.inject(CatalogueStore);
  });

  it('should expose a bulk update response after sort succeeds', () => {
    const catalogues = [
      { id: '1', name: 'A', order: 0 },
      { id: '2', name: 'B', order: 1 },
    ] as any;
    catalogueServiceSpy.updateCatalogueOrder.mockReturnValue(of(void 0));

    store.sort(catalogues);

    expect(catalogueServiceSpy.updateCatalogueOrder).toHaveBeenCalledWith(
      catalogues,
    );
    expect(store.response()).toEqual({
      message: 'CATALOGUE.UPDATED.ALL.MESSAGE',
    });
    expect(store.isLoading()).toBe(false);
  });

  it('should expose warning toast metadata when delete succeeds', () => {
    catalogueServiceSpy.deleteCatalogue.mockReturnValue(of({} as any));

    store.delete('catalogue-1', 'Summer');

    expect(catalogueServiceSpy.deleteCatalogue).toHaveBeenCalledWith(
      'catalogue-1',
    );
    expect(store.response()).toEqual({
      messageKey: 'CATALOGUE.DELETED.MESSAGE',
      messageParams: { name: 'Summer' },
      reload: true,
      toastType: 'warning',
    });
  });

  it('should map catalogue service failures into error state', () => {
    catalogueServiceSpy.getCatalogue.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: {
              message: 'CATALOGUE.NOT_FOUND',
            },
          }),
      ),
    );

    store.loadById('missing');

    expect(store.response()).toBeUndefined();
    expect(store.error()).toEqual(
      expect.objectContaining({
        status: 'NOT_FOUND',
        message: 'CATALOGUE.NOT_FOUND',
      }),
    );
    expect(store.isLoading()).toBe(false);
  });
});
