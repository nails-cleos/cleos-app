import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailsPageComponent } from './user-details-page.component';
import { UserStore } from '../store/user.store';
import { IUserAll } from './user';
import { UserComponent } from './user.component';
import { provideTranslateService } from '@ngx-translate/core';
describe('UserDetailsPageComponent', () => {
  let component: UserDetailsPageComponent;
  let fixture: ComponentFixture<UserDetailsPageComponent>;

  let userStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: Mock;
    loadById: Mock;
    save: Mock;
    userNavigationParams: Mock;
  };

  const id = '123';

  const mockUser: Partial<IUserAll> = {
    id,
    displayName: 'Test User',
  };

  beforeEach(async () => {
    userStoreSpy = {
      selected: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      clean: vi.fn().mockName('clean'),
      loadById: vi.fn().mockName('loadById'),
      save: vi.fn().mockName('save'),
      userNavigationParams: vi.fn().mockName('userNavigationParams'),
    };

    await TestBed.configureTestingModule({
      imports: [UserDetailsPageComponent],
      providers: [
        provideTranslateService(),
        { provide: UserStore, useValue: userStoreSpy },
      ],
    })
      .overrideTemplate(UserComponent, '')
      .overrideTemplate(
        UserDetailsPageComponent,
        `
        @if (user(); as user) {
          <app-user [user]="user" [config]="config" />
        }
      `,
      )
      .compileComponents();

    fixture = TestBed.createComponent(UserDetailsPageComponent);

    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user when id emits a value', () => {
    fixture.componentRef.setInput('id', '1234');
    fixture.detectChanges();

    expect(userStoreSpy.clean).toHaveBeenCalled();
    expect(userStoreSpy.loadById).toHaveBeenCalledWith('1234');
  });

  it('should pass selected user to the shared form', () => {
    userStoreSpy.selected.set(mockUser);
    fixture.detectChanges();

    const userComponent = fixture.debugElement.children[0]
      .componentInstance as UserComponent;

    expect(userComponent.user()).toEqual(
      expect.objectContaining({
        id,
        displayName: 'Test User',
      }),
    );
  });

  it('should call update when user is received', () => {
    fixture.detectChanges();

    component.submit({ user: mockUser });

    expect(userStoreSpy.save).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: 'Test User',
      }),
      id,
    );
  });
});
