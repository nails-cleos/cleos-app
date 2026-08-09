import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserCreatePageComponent } from './user-create-page.component';
import { UserStore } from '../store/user.store';
import { IUserAll } from './user';
import { Role } from '../interfaces/token';

describe('UserCreatePageComponent', () => {
  let component: UserCreatePageComponent;
  let fixture: ComponentFixture<UserCreatePageComponent>;

  let userStoreSpy: {
    clean: Mock;
    save: Mock;
    setNavigationParams: Mock;
  };

  const mockUser: Partial<IUserAll> = {
    displayName: 'Test User',
  };

  beforeEach(async () => {
    userStoreSpy = {
      clean: vi.fn().mockName('clean'),
      save: vi.fn().mockName('save'),
      setNavigationParams: vi.fn().mockName('setNavigationParams'),
    };

    await TestBed.configureTestingModule({
      imports: [UserCreatePageComponent],
      providers: [{ provide: UserStore, useValue: userStoreSpy }],
    })
      .overrideTemplate(UserCreatePageComponent, '')
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
      expect.objectContaining({ displayName: 'Test User' }),
      undefined,
      Role.customer,
    );
  });
});
