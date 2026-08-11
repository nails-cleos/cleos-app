import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlockAgendaCreatePageComponent } from './block-agenda-create-page.component';
import { UnavailableStore } from '@app/store/unavailable.store';
import { IUnavailableAll } from '../unavailable';
import { AuthUserService } from '@app/services/auth-user.service';
import { DateAdapter } from '@angular/material/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
describe('BlockAgendaCreatePageComponent', () => {
  let component: BlockAgendaCreatePageComponent;
  let fixture: ComponentFixture<BlockAgendaCreatePageComponent>;

  let unavailableStoreSpy: {
    clean: Mock;
    createBlockAgenda: Mock;
    subErrors: Mock;
  };

  const mockUnavailable: Partial<IUnavailableAll> = {
    duration: '00:30',
  };

  beforeEach(async () => {
    unavailableStoreSpy = {
      clean: vi.fn().mockName('clean'),
      createBlockAgenda: vi.fn().mockName('createBlockAgenda'),
      subErrors: vi.fn().mockName('subErrors'),
    };

    await TestBed.configureTestingModule({
      imports: [BlockAgendaCreatePageComponent],
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

    fixture = TestBed.createComponent(BlockAgendaCreatePageComponent);
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

    fixture = TestBed.createComponent(BlockAgendaCreatePageComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.params()).toEqual(
      expect.objectContaining({
        date,
        room,
        showDuration: true,
        startTime: '11:15',
      }),
    );
  });

  it('should call createBlockAgenda when unavailable is received', () => {
    component.submit(mockUnavailable as any);

    expect(unavailableStoreSpy.createBlockAgenda).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: '00:30',
      }),
      false,
    );
  });
});
