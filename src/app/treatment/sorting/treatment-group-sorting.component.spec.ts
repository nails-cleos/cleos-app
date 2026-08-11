import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ITreatmentGroupAll } from '../treatment';
import { ItemSorting } from '@app/util/drag-drop-sorting/drag-drop-sorting.component';
import { TreatmentStore } from '@app/store/treatment.store';
import { TreatmentGroupSortingComponent } from './treatment-group-sorting.component';
import { NavigationService } from '@app/services/navigation.service';
import { provideTranslateService } from '@ngx-translate/core';

describe('TreatmentGroupSortingComponent', () => {
  let component: TreatmentGroupSortingComponent;
  let fixture: ComponentFixture<TreatmentGroupSortingComponent>;
  let treatmentStoreSpy: {
    data: ReturnType<typeof signal<any>>;
    response: ReturnType<typeof signal<any>>;
    clean: Mock;
    loadAllGroups: Mock;
    sortGroups: Mock;
  };

  const mockTreatmentGroupList: ITreatmentGroupAll[] = [
    {
      id: '1',
      name: 'TreatmentGroup 1',
      description: '1 treatmentGroup',
      order: 1,
    },
    {
      id: '2',
      name: 'TreatmentGroup 2',
      description: '2 treatmentGroup',
      order: 2,
    },
  ];

  beforeEach(async () => {
    treatmentStoreSpy = {
      data: signal({ kind: 'list', value: mockTreatmentGroupList }),
      response: signal(undefined),
      clean: vi.fn().mockName('clean'),
      loadAllGroups: vi.fn().mockName('loadAllGroups'),
      sortGroups: vi.fn().mockName('sortGroups'),
    };

    await TestBed.configureTestingModule({
      imports: [TreatmentGroupSortingComponent],
      providers: [
        provideTranslateService(),
        { provide: TreatmentStore, useValue: treatmentStoreSpy },
        {
          provide: NavigationService,
          useValue: { back: vi.fn().mockName('back') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentGroupSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute itemsSignal from store data', () => {
    expect(component.itemsSignal()).toEqual([
      new ItemSorting('1', 'TreatmentGroup 1', 1),
      new ItemSorting('2', 'TreatmentGroup 2', 2),
    ]);
  });

  it('should load groups on init', () => {
    expect(treatmentStoreSpy.clean).toHaveBeenCalled();
    expect(treatmentStoreSpy.loadAllGroups).toHaveBeenCalled();
  });

  it('should call sortGroups when sorted() is called', () => {
    const sorted = [
      { order: 1, key: 'key1' },
      { order: 2, key: 'key2' },
    ];

    component.sorted(sorted);

    expect(treatmentStoreSpy.sortGroups).toHaveBeenCalledWith(sorted);
  });
});
