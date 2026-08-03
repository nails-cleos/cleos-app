import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ColorService } from '../services/color.service';
import { TreatmentService } from '../services/treatment.service';
import { TreatmentStore } from './treatment.store';

describe('TreatmentStore', () => {
  let store: InstanceType<typeof TreatmentStore>;
  let treatmentServiceSpy: jasmine.SpyObj<TreatmentService>;
  let colorServiceSpy: jasmine.SpyObj<ColorService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    treatmentServiceSpy = jasmine.createSpyObj<TreatmentService>('TreatmentService', [
      'getTreatmentsPage',
      'getAllTreatmentsGroup',
      'getTreatmentGroup',
      'createTreatment',
      'updateTreatmentGroup',
      'sortTreatment',
      'sortGroupTreatment',
      'deleteTreatmentGroup',
      'getAllTreatmentsHistory',
    ]);
    colorServiceSpy = jasmine.createSpyObj<ColorService>('ColorService', ['getAllColors']);
    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateSpy.instant.and.callFake(
      (key: string, params?: Record<string, string>) => `${ key }:${ params?.['name'] ?? '' }`);

    TestBed.configureTestingModule({
      providers: [
        TreatmentStore,
        { provide: TreatmentService, useValue: treatmentServiceSpy },
        { provide: ColorService, useValue: colorServiceSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    store = TestBed.inject(TreatmentStore);
  });

  it('should load treatment page into pagination data state', () => {
    const page = { content: [{ id: 'group-1', name: 'Hands' }], totalElements: 1 } as any;
    treatmentServiceSpy.getTreatmentsPage.and.returnValue(of(page));

    store.loadPage({ page: 1, sort: 'order', direction: 'asc', size: 25 });

    expect(treatmentServiceSpy.getTreatmentsPage).toHaveBeenCalledWith(1, 'order', 'asc', 25);
    expect(store.data()).toEqual({ kind: 'pagination', value: page });
    expect(store.error()).toBeUndefined();
  });

  it('should load groups, colors, selected treatment, and history', () => {
    const groups = [{ id: 'group-1', name: 'Hands' }] as any;
    const colors = [{ id: 'color-1', name: 'Blue' }] as any;
    const selected = { id: 'group-1', name: 'Hands' } as any;
    const history = [{ id: 'history-1' }] as any;
    treatmentServiceSpy.getAllTreatmentsGroup.and.returnValue(of(groups));
    colorServiceSpy.getAllColors.and.returnValue(of(colors));
    treatmentServiceSpy.getTreatmentGroup.and.returnValue(of(selected));
    treatmentServiceSpy.getAllTreatmentsHistory.and.returnValue(of(history));

    store.loadAllGroups();
    store.loadById('group-1');
    store.loadHistory('group-1', 'treatment-1');

    expect(store.data()).toEqual({ kind: 'list', value: groups });
    expect(store.selected()).toEqual(selected);
    expect(store.history()).toEqual(history);
  });

  it('should expose response metadata for create, update, sort, and delete success', () => {
    treatmentServiceSpy.createTreatment.and.returnValue(of({ id: 'group-1', name: 'Hands' } as any));
    treatmentServiceSpy.updateTreatmentGroup.and.returnValue(of({ id: 'group-1', name: 'Feet' } as any));
    treatmentServiceSpy.sortTreatment.and.returnValue(of([] as any));
    treatmentServiceSpy.sortGroupTreatment.and.returnValue(of({} as any));
    treatmentServiceSpy.deleteTreatmentGroup.and.returnValue(of({} as any));

    store.create({ name: 'Hands' } as any);
    expect(store.response()).toEqual({
      message: 'TREATMENT.CREATED:Hands',
      path: 'treatments/group-1/view',
      redirect: 'treatments',
    });

    store.update('group-1', { name: 'Feet' } as any);
    expect(store.response()).toEqual({
      message: 'TREATMENT.UPDATED.MESSAGE:Feet',
      path: 'treatments/group-1/view',
      redirect: 'treatments',
    });

    store.sortTreatments([{ key: 'treatment-1', order: 1 }]);
    expect(store.response()).toEqual({ message: 'TREATMENT.SORTED.MESSAGE:' });

    store.sortGroups([{ key: 'group-1', order: 1 }]);
    expect(store.response()).toEqual({ message: 'TREATMENT.SORTED.MESSAGE:' });

    store.delete('group-1', 'Hands');
    expect(store.response()).toEqual({
      message: 'TREATMENT.DELETED.MESSAGE:Hands',
      reload: true,
      toastType: 'warning',
    });
    expect(store.isLoading()).toBeFalse();
  });

  it('should clear response and error state', () => {
    treatmentServiceSpy.createTreatment.and.returnValue(of({ id: 'group-1', name: 'Hands' } as any));

    store.create({ name: 'Hands' } as any);
    store.clearResponse();
    store.clearError();

    expect(store.response()).toBeUndefined();
    expect(store.error()).toBeUndefined();
    expect(store.subErrors()).toBeUndefined();
  });

  it('should map service failures into error state', () => {
    treatmentServiceSpy.getTreatmentGroup.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 404,
      error: {
        message: 'TREATMENT.NOT_FOUND',
      },
    })));

    store.loadById('missing');

    expect(store.response()).toBeUndefined();
    expect(store.error()).toEqual(jasmine.objectContaining({
      status: 'NOT_FOUND',
      message: 'TREATMENT.NOT_FOUND',
    }));
    expect(store.isLoading()).toBeFalse();
  });
});
