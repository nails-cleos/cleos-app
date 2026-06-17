import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { CatalogueStore } from './catalogue.store';
import { CatalogueService } from '../services/catalogue.service';
import { TreatmentService } from '../services/treatment.service';

describe('CatalogueStore', () => {
  let store: InstanceType<typeof CatalogueStore>;
  let catalogueServiceSpy: jasmine.SpyObj<CatalogueService>;
  let treatmentServiceSpy: jasmine.SpyObj<TreatmentService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    catalogueServiceSpy = jasmine.createSpyObj<CatalogueService>('CatalogueService', [
      'getAllCatalogues',
      'getAllCatalogs',
      'getCatalogue',
      'createCatalogue',
      'updateCatalogue',
      'updateCatalogueOrder',
      'deleteCatalogue',
    ]);
    treatmentServiceSpy = jasmine.createSpyObj<TreatmentService>('TreatmentService', ['getAllTreatmentsGroup']);
    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateSpy.instant.and.callFake((key: string, params?: Record<string, string>) => `${ key }:${ params?.['name'] ?? '' }`);

    TestBed.configureTestingModule({
      providers: [
        CatalogueStore,
        { provide: CatalogueService, useValue: catalogueServiceSpy },
        { provide: TreatmentService, useValue: treatmentServiceSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    store = TestBed.inject(CatalogueStore);
  });

  it('should expose a bulk update response after sort succeeds', () => {
    const catalogues = [{ id: '1', name: 'A', order: 0 }, { id: '2', name: 'B', order: 1 }] as any;
    catalogueServiceSpy.updateCatalogueOrder.and.returnValue(of(void 0));

    store.sort(catalogues);

    expect(catalogueServiceSpy.updateCatalogueOrder).toHaveBeenCalledWith(catalogues);
    expect(store.response()).toEqual({
      message: 'CATALOGUE.UPDATED.ALL.MESSAGE',
    });
    expect(store.isLoading()).toBeFalse();
  });

  it('should expose warning toast metadata when delete succeeds', () => {
    catalogueServiceSpy.deleteCatalogue.and.returnValue(of({} as any));

    store.delete('catalogue-1', 'Summer');

    expect(catalogueServiceSpy.deleteCatalogue).toHaveBeenCalledWith('catalogue-1');
    expect(translateSpy.instant).toHaveBeenCalledWith('CATALOGUE.DELETED.MESSAGE', { name: 'Summer' });
    expect(store.response()).toEqual({
      message: 'CATALOGUE.DELETED.MESSAGE:Summer',
      reload: true,
      toastType: 'warning',
    });
  });

  it('should map catalogue service failures into error state', () => {
    catalogueServiceSpy.getCatalogue.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 404,
      error: {
        message: 'CATALOGUE.NOT_FOUND',
      },
    })));

    store.loadById('missing');

    expect(store.response()).toBeUndefined();
    expect(store.error()).toEqual(jasmine.objectContaining({
      status: 'NOT_FOUND',
      message: 'CATALOGUE.NOT_FOUND',
    }));
    expect(store.isLoading()).toBeFalse();
  });
});
