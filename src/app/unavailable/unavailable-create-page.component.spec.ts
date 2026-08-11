import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UnavailableCreatePageComponent } from './unavailable-create-page.component';
import { UnavailableStore } from '../store/unavailable.store';
import { IUnavailableAll } from './unavailable';
import { AuthUserService } from '../services/auth-user.service';
import { DateAdapter } from '@angular/material/core';
import { provideTranslateService } from '@ngx-translate/core';

describe('UnavailableCreatePageComponent', () => {
  let component: UnavailableCreatePageComponent;
  let fixture: ComponentFixture<UnavailableCreatePageComponent>;

  let unavailableStoreSpy: {
    clean: Mock;
    create: Mock;
  };

  const mockUnavailable: Partial<IUnavailableAll> = {
    description: 'Test Description',
    duration: '00:30',
  };

  beforeEach(async () => {
    unavailableStoreSpy = {
      clean: vi.fn().mockName('clean'),
      create: vi.fn().mockName('create'),
    };

    await TestBed.configureTestingModule({
      imports: [UnavailableCreatePageComponent],
      providers: [
        provideTranslateService(),
        provideRouter([]),
        { provide: UnavailableStore, useValue: unavailableStoreSpy },
        {
          provide: AuthUserService,
          useValue: { authUser: signal({ isRoomAdmin: false }) },
        },
        { provide: DateAdapter, useValue: { setLocale: vi.fn() } },
      ],
    }).compileComponents();

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

    expect(component.params()).toEqual(
      expect.objectContaining({
        date,
        room,
        showDuration: true,
        startTime: '11:15',
      }),
    );
  });

  it('should call create when unavailable is received', () => {
    component.submit(mockUnavailable as any);

    expect(unavailableStoreSpy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Test Description',
        duration: '00:30',
      }),
      false,
    );
  });
});
