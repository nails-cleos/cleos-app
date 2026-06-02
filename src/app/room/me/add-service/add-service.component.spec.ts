import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddServiceComponent } from './add-service.component';
import { Store } from '@ngrx/store';
import { BehaviorSubject, of } from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { getServices, updateServices } from '../../../store/actions/room.actions';
import { IService, ServicePrice, ServiceType } from '../../../interfaces/room';
import { TranslateModule } from '@ngx-translate/core';
import { ITreatmentAll } from '../../../interfaces/treatment';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

describe('AddServiceComponent', () => {
  let component: AddServiceComponent;
  let fixture: ComponentFixture<AddServiceComponent>;
  let storeSpy: jasmine.SpyObj<Store>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  let services$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;

  beforeEach(async () => {
    services$ = new BehaviorSubject(undefined);
    response$ = new BehaviorSubject(undefined);
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return services$.asObservable();
        case 2:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [AddServiceComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Store, useValue: storeSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddServiceComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should dispatch getServices when roomId is emitted', () => {
    fixture.componentRef.setInput('id', '10');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getServices({ id: '10' }));
  });

  it('should dispatch updateServices with collected prices', () => {
    fixture.componentRef.setInput('id', '5');
    fixture.detectChanges();

    component.selectedAdditional.set([
      {
        id: '1',
        price: 20,
        type: ServiceType.additional,
        duration: 'PT10M',
        key: 'key-1',
        name: 'Additional 1',
      },
    ]);

    component.groups.set(new Map([
      [
        'group1',
        {
          id: 'group1',
          name: 'Group 1',
          treatments: [],
          selectedTreatments: [
            {
              id: '2',
              price: 30,
              type: ServiceType.treatment,
              duration: 'PT1H30M',
              key: 'key-2',
              name: 'Treatment 2',
            },
          ],
        },
      ],
    ]));

    component.save();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      updateServices({
        id: '5',
        prices: [
          new ServicePrice('1', 20, ServiceType.additional),
          new ServicePrice('2', 30, ServiceType.treatment),
        ],
      }),
    );
  });

  it('should not dispatch save if roomId is null', () => {
    fixture.componentRef.setInput('id', undefined);
    fixture.detectChanges();

    component.save();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });


  it('should reorder items when dropped in same container', () => {
    component.selectedAdditional.set([
      {
        id: '1',
        name: 'Item 1',
        type: ServiceType.additional,
        price: 0,
        currency: 'USD',
        duration: 'PT10M',
        key: 'key-1',
      },
      {
        id: '2',
        name: 'Item 2',
        type: ServiceType.additional,
        price: 0,
        currency: 'USD',
        duration: 'PT20M',
        key: 'key-2',
      },
    ]);

    const list = component.selectedAdditional();

    const event = {
      previousContainer: { data: list },
      container: { data: list },
      previousIndex: 0,
      currentIndex: 1,
    } as CdkDragDrop<IService[]>;

    component.dropAdditional(event, false);

    const selectedAdditional = component.selectedAdditional();
    expect(selectedAdditional[0].id).toBe('2');
    const additional = component.additional();
    expect(additional[0].id).toBe('1');
  });

  it('should transfer item when dropped in different container without dialog', () => {
    component.additional.set([{
      id: '1',
      name: 'Item 1',
      type: ServiceType.additional,
      price: 0,
      currency: 'USD',
      duration: 'PT10M',
      key: 'key-1',
    }]);
    component.selectedAdditional.set([]);

    const source = component.additional();
    const target = component.selectedAdditional();

    const event = {
      previousContainer: { data: source },
      container: { data: target },
      previousIndex: 0,
      currentIndex: 0,
    } as CdkDragDrop<IService[]>;

    // Perform drop
    component.dropAdditional(event, false);

    // Check signal updates
    expect(component.additional().length).toBe(0);
    expect(component.selectedAdditional().length).toBe(1);
    expect(component.selectedAdditional()[0].id).toBe('1');
  });

  it('should update additional price after dialog closes', () => {
    const service: IService = {
      duration: 'PT15M',
      key: 'key-1',
      id: '1',
      name: 'Extra',
      price: 10,
      type: ServiceType.additional,
    };

    component.selectedAdditional.set([service]);

    dialogSpy.open.and.callFake(() => {
      return {
        afterClosed: () => of({ price: 99, type: ServiceType.additional }),
      } as any;
    });

    component.changePrice(service);

    expect(component.selectedAdditional()[0].price).toBe(99);
  });

  it('should update treatment price in group after dialog closes', () => {
    const treatment: IService = {
      duration: 'PT30M',
      key: 'key-2',
      id: '2',
      name: 'Massage',
      price: 50,
      type: ServiceType.treatment,
    };

    component.groups.set(new Map([
      [
        'g1',
        {
          id: 'g1',
          name: 'Wellness',
          treatments: [],
          selectedTreatments: [treatment],
        },
      ],
    ]));

    dialogSpy.open.and.callFake(() => {
      return {
        afterClosed: () => of({ price: 80, type: ServiceType.treatment }),
      } as any;
    });

    component.changePrice(treatment);

    const updated =
      [...component.groups().values()][0].selectedTreatments[0];

    expect(updated.price).toBe(80);
  });

  it('should transfer a treatment item between treatments and selectedTreatments without dialog', () => {
    const groupId = 'group1';
    const item: IService = {
      duration: 'PT1H',
      key: 'key-1',
      id: '1',
      name: 'Treatment 1',
      type: ServiceType.treatment,
      price: 100,
      currency: 'USD',
    };

    // Initialize groups signal
    component.groups.set(new Map([
      [groupId, {
        id: groupId,
        name: 'Group 1',
        treatments: [item],
        selectedTreatments: [],
      }],
    ]));

    const group = component.groups().get(groupId)!;

    const event = {
      previousContainer: { data: group.treatments },
      container: { data: group.selectedTreatments },
      previousIndex: 0,
      currentIndex: 0,
    } as CdkDragDrop<IService[]>;

    component.dropTreatment(event, false);

    const updatedGroup = component.groups().get(groupId)!;
    expect(updatedGroup.treatments.length).toBe(0);
    expect(updatedGroup.selectedTreatments.length).toBe(1);
    expect(updatedGroup.selectedTreatments[0].id).toBe('1');
  });

  it('should reorder treatments within the same container', () => {
    const groupId = 'group1';
    const items: ITreatmentAll[] = [
      {
        id: '1',
        name: 'Treatment 1',
        type: ServiceType.treatment,
        price: 100,
        currency: 'USD',
        duration: 'PT30M',
        key: 't1',
        group: { id: '1', name: groupId },
      },
      {
        id: '2',
        name: 'Treatment 2',
        type: ServiceType.treatment,
        price: 200,
        currency: 'USD',
        duration: 'PT45M',
        key: 't2',
        group: { id: '1', name: groupId },
      },
    ];

    component.groups.set(new Map([
      [groupId, { id: groupId, name: 'group1', treatments: [...items], selectedTreatments: [] }],
    ]));

    const group = component.groups().get(groupId)!;
    const event = {
      previousContainer: { data: group.treatments },
      container: { data: group.treatments },
      previousIndex: 0,
      currentIndex: 1,
    } as CdkDragDrop<IService[]>;

    component.dropTreatment(event, false);

    const updatedGroup = component.groups().get(groupId)!;
    expect(updatedGroup.treatments[0].id).toBe('2');
    expect(updatedGroup.selectedTreatments[0].id).toBe('1');
  });

});
