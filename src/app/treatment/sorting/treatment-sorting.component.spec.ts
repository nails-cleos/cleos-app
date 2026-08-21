import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ServiceType } from '@app/room/room';
import { ITreatmentAll, ITreatmentGroupAll } from '../treatment';
import { ItemSorting } from '@app/util/drag-drop-sorting/drag-drop-sorting.component';
import { TreatmentStore } from '@app/store/treatment.store';
import { TreatmentSortingComponent } from './treatment-sorting.component';
import { NavigationService } from '@app/services/navigation.service';
import { provideTranslateService } from '@ngx-translate/core';

describe('TreatmentSortingComponent', () => {
  let component: TreatmentSortingComponent;
  let fixture: ComponentFixture<TreatmentSortingComponent>;
  let treatmentStoreSpy: {
    selected: ReturnType<typeof signal<ITreatmentGroupAll | undefined>>;
    response: ReturnType<typeof signal<any>>;
    clean: Mock;
    loadById: Mock;
    sortTreatments: Mock;
  };

  const mockTreatmentList: ITreatmentAll[] = [
    {
      id: '1',
      key: 'Key 1',
      name: 'Treatment 1',
      description: '1 treatment',
      duration: 'PT15M',
      type: ServiceType.treatment,
      price: 15,
      order: 1,
      group: {
        id: 'g1',
        name: 'Group 1',
      } as any,
    },
    {
      id: '2',
      key: 'Key 2',
      name: 'Treatment 2',
      description: '2 treatment',
      duration: 'PT1H30M',
      type: ServiceType.treatment,
      price: 35,
      order: 2,
      group: {
        id: 'g1',
        name: 'Group 1',
      } as any,
    },
  ];

  beforeEach(async () => {
    treatmentStoreSpy = {
      selected: signal<ITreatmentGroupAll | undefined>({
        id: 'g1',
        name: 'Group 1',
        treatments: mockTreatmentList,
      }),
      response: signal(undefined),
      clean: vi.fn().mockName('clean'),
      loadById: vi.fn().mockName('loadById'),
      sortTreatments: vi.fn().mockName('sortTreatments'),
    };

    await TestBed.configureTestingModule({
      imports: [TreatmentSortingComponent],
      providers: [
        provideTranslateService(),
        { provide: TreatmentStore, useValue: treatmentStoreSpy },
        {
          provide: NavigationService,
          useValue: { back: vi.fn().mockName('back') },
        },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentSortingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'g1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute itemsSignal from the selected treatment group', () => {
    expect(component.itemsSignal()).toEqual([
      new ItemSorting('1', 'Treatment 1', 1),
      new ItemSorting('2', 'Treatment 2', 2),
    ]);
  });

  it('should load the treatment group on init', () => {
    expect(treatmentStoreSpy.clean).toHaveBeenCalled();
    expect(treatmentStoreSpy.loadById).toHaveBeenCalledWith('g1');
  });

  it('should call sortTreatments when sorted() is called', () => {
    const sorted = [
      { order: 1, key: 'key1' },
      { order: 2, key: 'key2' },
    ];

    component.sorted(sorted);

    expect(treatmentStoreSpy.sortTreatments).toHaveBeenCalledWith(sorted);
  });
});
