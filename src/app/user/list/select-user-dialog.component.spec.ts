import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IUserAll } from '../user';
import { SelectUserDialogComponent } from './select-user-dialog.component';
import { Role } from '@app/interfaces/token';
import { signal, WritableSignal } from '@angular/core';
import { UserStore } from '@app/store/user.store';
import { provideTranslateService } from "@ngx-translate/core";

describe('SelectUserDialogComponent', () => {
  let component: SelectUserDialogComponent;
  let fixture: ComponentFixture<SelectUserDialogComponent>;

  let usersSignal: WritableSignal<IUserAll[] | undefined>;

  let userStoreSpy: jasmine.SpyObj<InstanceType<typeof UserStore>>;
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
    image: 'AAA',
    timeZone: 'Europa/Amsterdam',
  };

  const mockUsers: IUserAll[] = [
    { id: 'a', displayName: 'Alice' } as IUserAll,
    { id: 'b', displayName: 'Bob' } as IUserAll,
  ];

  beforeEach(async () => {
    usersSignal = signal<IUserAll[] | undefined>(undefined);

    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    userStoreSpy = jasmine.createSpyObj<InstanceType<typeof UserStore>>('UserStore', ['clean', 'loadDisabledUsers']);
    Object.assign(userStoreSpy, {
      users: usersSignal.asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [SelectUserDialogComponent],
      providers: [
        provideTranslateService(),
        {
          provide: MAT_DIALOG_DATA,
          useFactory: () => ({ newUser: mockUser }),
        },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: UserStore, useValue: userStoreSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectUserDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should clean and load disabled users on init', () => {
    fixture.detectChanges();
    expect(userStoreSpy.clean).toHaveBeenCalled();
    expect(userStoreSpy.loadDisabledUsers).toHaveBeenCalled();
  });

  it('should update users when store emits', () => {
    usersSignal.set([...mockUsers, mockUser]);
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
