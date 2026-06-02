import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { cleanUser, getAllDisableUsers } from '../../store/actions/user.actions';
import { IUserAll } from '../../interfaces/user';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { SelectUserDialogComponent } from './select-user-dialog.component';
import { Role } from '../../interfaces/token';

describe('SelectUserDialogComponent', () => {
  let component: SelectUserDialogComponent;
  let fixture: ComponentFixture<SelectUserDialogComponent>;

  let allUsers$: BehaviorSubject<IUserAll[] | undefined>;

  let storeSpy: jasmine.SpyObj<Store>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<SelectUserDialogComponent>>;

  const mockUser: IUserAll = {
    id: 'user-123',
    displayName: 'John Doe',
    email: 'john@example.com',
    locale: 'en-US',
    authorities: [{ authority: Role.professional }],
    phone: '+1234567890',
    enabled: true,
    verified: true,
    imageUrl: 'http://example.com/image.jpg',
    timeZone: 'Europa/Amsterdam',
  };

  const mockUsers: IUserAll[] = [
    { id: 'a', displayName: 'Alice' } as IUserAll,
    { id: 'b', displayName: 'Bob' } as IUserAll,
  ];

  beforeEach(async () => {
    allUsers$ = new BehaviorSubject<IUserAll[] | undefined>(undefined);

    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    storeSpy.pipe.and.returnValue(allUsers$.asObservable());

    await TestBed.configureTestingModule({
      imports: [SelectUserDialogComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useFactory: () => ({ newUser: mockUser }),
        },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectUserDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => allUsers$.complete());

  it('should create component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should dispatch clean and getAllDisableUsers on init', () => {
    fixture.detectChanges();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(cleanUser());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllDisableUsers());
  });

  it('should update users when store emits', () => {
    allUsers$.next([...mockUsers, mockUser]);
    fixture.detectChanges();

    expect(component.users()).toEqual(mockUsers);
  });

  it('should filter users', () => {
    const result = component['filterUser']('Ali', mockUsers);
    expect(result!.length).toBe(1);
    expect(result![0].displayName).toBe('Alice');
  });

  it('should close dialog on cancel', () => {
    component.onNoClick();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});
