import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeListComponent } from './office-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { AppState } from '../../store/app.states';
import { IOffice } from '../../interfaces/office';
import { deleteOffice } from '../../store/office.actions';

describe('OfficeListComponent', () => {
  let component: OfficeListComponent;
  let fixture: ComponentFixture<OfficeListComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let dialogSpy: jasmine.SpyObj<any>;

  const mockOffices: IOffice[] = [
    { id: '1', name: 'Office 1', manager: { id: 'm1', displayName: 'Manager 1' }, subject: 'Subject 1' },
    { id: '2', name: 'Office 2', manager: { id: 'm2', displayName: 'Manager 2' }, subject: 'Subject 2' },
  ];

  beforeEach(async () => {
    state$ = new Subject<any>();

    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [OfficeListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OfficeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    dialogSpy = spyOn(component.dialog, 'open');
  });

  afterEach(() => state$.complete());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call delete method without errors', () => {
    component.ngOnInit();

    const testOffice = mockOffices[0];

    dialogSpy.and.returnValue({
      afterClosed: () => of(testOffice),
    });

    component.delete(testOffice);

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'OFFICE.DELETED.TITLE',
          content: 'OFFICE.DELETED.CONTENT',
          value: testOffice,
        },
      }));

    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteOffice({ id: testOffice.id!, name: testOffice.name! }));
  });
});
