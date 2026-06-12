import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserCreatePageComponent } from './user-create-page.component';
import { UserStore } from '../store/user.store';
import { IUserAll } from './user';
import { Role } from '../interfaces/token';

describe('UserCreatePageComponent', () => {
  let component: UserCreatePageComponent;
  let fixture: ComponentFixture<UserCreatePageComponent>;

  let userStoreSpy: {
    clean: jasmine.Spy;
    save: jasmine.Spy;
    setNavigationParams: jasmine.Spy;
  };

  const mockUser: Partial<IUserAll> = {
    displayName: 'Test User',
  };

  beforeEach(async () => {
    userStoreSpy = {
      clean: jasmine.createSpy('clean'),
      save: jasmine.createSpy('save'),
      setNavigationParams: jasmine.createSpy('setNavigationParams'),
    };

    await TestBed.configureTestingModule({
      imports: [UserCreatePageComponent],
      providers: [
        { provide: UserStore, useValue: userStoreSpy },
      ],
    }).overrideTemplate(UserCreatePageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(UserCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call create when user is received', () => {
    component.submit({ user: mockUser, role: Role.customer });

    expect(userStoreSpy.save).toHaveBeenCalledWith(
      jasmine.objectContaining({ displayName: 'Test User' }),
      undefined,
      Role.customer,
    );
  });
});
