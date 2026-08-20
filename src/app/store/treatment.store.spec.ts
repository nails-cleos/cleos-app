import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ColorService } from '../services/color.service';
import { TreatmentService } from '../services/treatment.service';
import { TreatmentStore } from './treatment.store';

describe('TreatmentStore', () => {
  let store: InstanceType<typeof TreatmentStore>;
  let treatmentServiceSpy: {
    getTreatmentsPage: Mock;
    getAllTreatmentsGroup: Mock;
    getTreatmentGroup: Mock;
    createTreatment: Mock;
    updateTreatmentGroup: Mock;
    sortTreatment: Mock;
    sortGroupTreatment: Mock;
    deleteTreatmentGroup: Mock;
    getAllTreatmentsHistory: Mock;
  };
  let colorServiceSpy: {
    getAllColors: Mock;
  };

  beforeEach(() => {
    treatmentServiceSpy = {
      getTreatmentsPage: vi.fn().mockName('TreatmentService.getTreatmentsPage'),
      getAllTreatmentsGroup: vi
        .fn()
        .mockName('TreatmentService.getAllTreatmentsGroup'),
      getTreatmentGroup: vi.fn().mockName('TreatmentService.getTreatmentGroup'),
      createTreatment: vi.fn().mockName('TreatmentService.createTreatment'),
      updateTreatmentGroup: vi
        .fn()
        .mockName('TreatmentService.updateTreatmentGroup'),
      sortTreatment: vi.fn().mockName('TreatmentService.sortTreatment'),
      sortGroupTreatment: vi
        .fn()
        .mockName('TreatmentService.sortGroupTreatment'),
      deleteTreatmentGroup: vi
        .fn()
        .mockName('TreatmentService.deleteTreatmentGroup'),
      getAllTreatmentsHistory: vi
        .fn()
        .mockName('TreatmentService.getAllTreatmentsHistory'),
    };
    colorServiceSpy = {
      getAllColors: vi.fn().mockName('ColorService.getAllColors'),
    };

    TestBed.configureTestingModule({
      providers: [
        TreatmentStore,
        { provide: TreatmentService, useValue: treatmentServiceSpy },
        { provide: ColorService, useValue: colorServiceSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    });

    store = TestBed.inject(TreatmentStore);
  });

  it('should load treatment page into pagination data state', () => {
    const page = {
      content: [{ id: 'group-1', name: 'Hands' }],
      totalElements: 1,
    } as any;
    treatmentServiceSpy.getTreatmentsPage.mockReturnValue(of(page));

    store.loadPage({ page: 1, sort: 'order', direction: 'asc', size: 25 });

    expect(treatmentServiceSpy.getTreatmentsPage).toHaveBeenCalledWith(
      1,
      'order',
      'asc',
      25,
    );
    expect(store.data()).toEqual({ kind: 'pagination', value: page });
    expect(store.error()).toBeUndefined();
  });

  it('should load groups, colors, selected treatment, and history', () => {
    const groups = [{ id: 'group-1', name: 'Hands' }] as any;
    const colors = [{ id: 'color-1', name: 'Blue' }] as any;
    const selected = { id: 'group-1', name: 'Hands' } as any;
    const history = [{ id: 'history-1' }] as any;
    treatmentServiceSpy.getAllTreatmentsGroup.mockReturnValue(of(groups));
    colorServiceSpy.getAllColors.mockReturnValue(of(colors));
    treatmentServiceSpy.getTreatmentGroup.mockReturnValue(of(selected));
    treatmentServiceSpy.getAllTreatmentsHistory.mockReturnValue(of(history));

    store.loadAllGroups();
    store.loadById('group-1');
    store.loadHistory('group-1', 'treatment-1');

    expect(store.data()).toEqual({ kind: 'list', value: groups });
    expect(store.selected()).toEqual(selected);
    expect(store.history()).toEqual(history);
  });

  it('should expose response metadata for create, update, sort, and delete success', () => {
    treatmentServiceSpy.createTreatment.mockReturnValue(
      of({ id: 'group-1', name: 'Hands' } as any),
    );
    treatmentServiceSpy.updateTreatmentGroup.mockReturnValue(
      of({ id: 'group-1', name: 'Feet' } as any),
    );
    treatmentServiceSpy.sortTreatment.mockReturnValue(of([] as any));
    treatmentServiceSpy.sortGroupTreatment.mockReturnValue(of({} as any));
    treatmentServiceSpy.deleteTreatmentGroup.mockReturnValue(of({} as any));

    store.create({ name: 'Hands' } as any);
    expect(store.response()).toEqual({
      messageKey: 'TREATMENT.CREATED',
      messageParams: { name: 'Hands' },
      path: 'treatments/group-1/view',
      redirect: 'treatments',
    });

    store.update('group-1', { name: 'Feet' } as any);
    expect(store.response()).toEqual({
      messageKey: 'TREATMENT.UPDATED.MESSAGE',
      messageParams: { name: 'Feet' },
      path: 'treatments/group-1/view',
      redirect: 'treatments',
    });

    store.sortTreatments([{ key: 'treatment-1', order: 1 }]);
    expect(store.response()).toEqual({
      messageKey: 'TREATMENT.SORTED.MESSAGE',
    });

    store.sortGroups([{ key: 'group-1', order: 1 }]);
    expect(store.response()).toEqual({
      messageKey: 'TREATMENT.SORTED.MESSAGE',
    });

    store.delete('group-1', 'Hands');
    expect(store.response()).toEqual({
      messageKey: 'TREATMENT.DELETED.MESSAGE',
      messageParams: { name: 'Hands' },
      reload: true,
      toastType: 'warning',
    });
    expect(store.isLoading()).toBe(false);
  });

  it('should clear response and error state', () => {
    treatmentServiceSpy.createTreatment.mockReturnValue(
      of({ id: 'group-1', name: 'Hands' } as any),
    );

    store.create({ name: 'Hands' } as any);
    store.clearResponse();
    store.clearError();

    expect(store.response()).toBeUndefined();
    expect(store.error()).toBeUndefined();
    expect(store.subErrors()).toBeUndefined();
  });

  it('should map service failures into error state', () => {
    treatmentServiceSpy.getTreatmentGroup.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: {
              message: 'TREATMENT.NOT_FOUND',
            },
          }),
      ),
    );

    store.loadById('missing');

    expect(store.response()).toBeUndefined();
    expect(store.error()).toEqual(
      expect.objectContaining({
        status: 'NOT_FOUND',
        message: 'TREATMENT.NOT_FOUND',
      }),
    );
    expect(store.isLoading()).toBe(false);
  });
});
