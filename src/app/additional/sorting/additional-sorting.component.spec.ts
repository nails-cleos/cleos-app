import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IAdditionalAll } from '../additional';
import { ServiceType } from '@app/room/room';
import { NavigationService } from '@app/services/navigation.service';
import { AdditionalStore } from '@app/store/additional.store';
import { ItemSorting } from '@app/util/drag-drop-sorting/drag-drop-sorting.component';
import { AdditionalSortingComponent } from './additional-sorting.component';
import { provideTranslateService } from "@ngx-translate/core";

describe('AdditionalSortingComponent', () => {
  let component: AdditionalSortingComponent;
  let fixture: ComponentFixture<AdditionalSortingComponent>;

  let additionalStoreSpy: {
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    isLoading: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadList: jasmine.Spy;
    clearResponse: jasmine.Spy;
    sort: jasmine.Spy;
  };

  const mockAdditionalList: IAdditionalAll[] = [
    {
      id: '1',
      key: 'Key 1',
      name: 'Additional 1',
      description: '1 additional',
      duration: 'PT15M',
      type: ServiceType.additional,
      price: 15,
      order: 1,
    },
    {
      id: '2',
      key: 'Key 2',
      name: 'Additional 2',
      description: '2 additional',
      duration: 'PT1H30M',
      type: ServiceType.additional,
      price: 35,
      order: 2,
    },
  ];

  beforeEach(async () => {
    additionalStoreSpy = {
      data: signal<any>(undefined),
      response: signal<any>(undefined),
      isLoading: signal(false),
      clean: jasmine.createSpy('clean'),
      loadList: jasmine.createSpy('loadList'),
      clearResponse: jasmine.createSpy('clearResponse'),
      sort: jasmine.createSpy('sort'),
    };

    await TestBed.configureTestingModule({
      imports: [AdditionalSortingComponent],
      providers: [
        provideTranslateService(),
        { provide: AdditionalStore, useValue: additionalStoreSpy },
        { provide: NavigationService, useValue: jasmine.createSpyObj('NavigationService', ['back']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute itemsSignal from additionalListSignal', () => {
    additionalStoreSpy.data.set({ kind: 'list', value: mockAdditionalList });
    fixture.detectChanges();

    const result = component.itemsSignal();

    expect(result).toEqual([
      new ItemSorting('1', 'Additional 1', 1),
      new ItemSorting('2', 'Additional 2', 2),
    ]);
  });

  it('should call sort when sorted() is called', () => {
    const sorted = [
      { order: 1, key: 'key1' },
      { order: 2, key: 'key2' },
    ];

    component.sorted(sorted);

    expect(additionalStoreSpy.sort).toHaveBeenCalledWith(sorted);
  });

  it('should clear response and reload list when responseSignal emits', () => {
    additionalStoreSpy.clearResponse.calls.reset();
    additionalStoreSpy.loadList.calls.reset();

    additionalStoreSpy.response.set({ success: true } as any);
    fixture.detectChanges();

    expect(additionalStoreSpy.clearResponse).toHaveBeenCalled();
    expect(additionalStoreSpy.loadList).toHaveBeenCalled();
  });
});
