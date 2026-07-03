import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UnavailableCreatePageComponent } from './unavailable-create-page.component';
import { UnavailableStore } from '../store/unavailable.store';
import { IUnavailableAll } from './unavailable';
import { AuthUserService } from '../services/auth-user.service';

describe('UnavailableCreatePageComponent', () => {
  let component: UnavailableCreatePageComponent;
  let fixture: ComponentFixture<UnavailableCreatePageComponent>;

  let unavailableStoreSpy: {
    clean: jasmine.Spy;
    create: jasmine.Spy;
  };
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUnavailable: Partial<IUnavailableAll> = {
    description: 'Test Description',
    duration: '00:30',
  };

  beforeEach(async () => {
    unavailableStoreSpy = {
      clean: jasmine.createSpy('clean'),
      create: jasmine.createSpy('create'),
    };
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'currentNavigation']);
    routerSpy.currentNavigation.and.returnValue(undefined as any);

    await TestBed.configureTestingModule({
      imports: [UnavailableCreatePageComponent],
      providers: [
        { provide: UnavailableStore, useValue: unavailableStoreSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthUserService, useValue: { authUser: signal({ isRoomAdmin: false }) } },
      ],
    }).overrideTemplate(UnavailableCreatePageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(UnavailableCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clean on init', () => {
    expect(unavailableStoreSpy.clean).toHaveBeenCalled();
  });

  it('should expose params from navigation state', () => {
    const date = new Date('2024-01-01T10:10:00Z');
    const room = { id: 'room-1' } as any;
    history.pushState({ date, room }, '', '/...');

    fixture = TestBed.createComponent(UnavailableCreatePageComponent);
    component = fixture.componentInstance;

    expect(component.params()).toEqual(jasmine.objectContaining({
      date,
      room,
      showDuration: true,
      startTime: '11:15',
    }));
  });

  it('should call create when unavailable is received', () => {
    component.submit(mockUnavailable as any);

    expect(unavailableStoreSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      description: 'Test Description',
      duration: '00:30',
    }), false);
  });
});
