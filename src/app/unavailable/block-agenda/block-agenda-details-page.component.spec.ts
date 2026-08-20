import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BlockAgendaDetailsPageComponent } from './block-agenda-details-page.component';
import { UnavailableStore } from '@app/store/unavailable.store';
import { IUnavailableAll } from '../unavailable';
import { BlockAgendaComponent } from './block-agenda.component';
import { AuthUserService } from '@app/services/auth-user.service';
import { UserStore } from '@app/store/user.store';
import { provideTranslateService } from '@ngx-translate/core';
import { DateAdapter } from '@angular/material/core';
import { provideRouter } from '@angular/router';
describe('BlockAgendaDetailsPageComponent', () => {
  let component: BlockAgendaDetailsPageComponent;
  let fixture: ComponentFixture<BlockAgendaDetailsPageComponent>;

  let unavailableStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: Mock;
    loadById: Mock;
    update: Mock;
    delete: Mock;
  };

  let userStoreSpy: {
    professionals: ReturnType<typeof signal>;
    rooms: ReturnType<typeof signal>;
    loadProfessionals: Mock;
    loadRoomsByProfessionalId: Mock;
  };

  const id = '123';
  const mockUnavailable: Partial<IUnavailableAll> = {
    id,
    start: '2024-01-01',
    timestamp: 123,
    duration: '00:30',
  };

  beforeEach(async () => {
    unavailableStoreSpy = {
      selected: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      clean: vi.fn().mockName('clean'),
      loadById: vi.fn().mockName('loadById'),
      update: vi.fn().mockName('update'),
      delete: vi.fn().mockName('delete'),
    };
    userStoreSpy = {
      professionals: signal<any>(undefined),
      rooms: signal<any>(undefined),
      loadProfessionals: vi.fn().mockName('loadProfessionals'),
      loadRoomsByProfessionalId: vi.fn().mockName('loadRoomsByProfessionalId'),
    };

    await TestBed.configureTestingModule({
      imports: [BlockAgendaDetailsPageComponent],
      providers: [
        provideTranslateService(),
        provideRouter([]),
        { provide: UnavailableStore, useValue: unavailableStoreSpy },
        { provide: UserStore, useValue: userStoreSpy },
        {
          provide: AuthUserService,
          useValue: { authUser: signal({ isRoomAdmin: false }) },
        },
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn().mockName('MatDialog.open'),
          },
        },
        { provide: DateAdapter, useValue: { setLocale: vi.fn() } },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(BlockAgendaDetailsPageComponent);
    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load unavailable when id emits a value', () => {
    fixture.componentRef.setInput('id', '1234');
    fixture.detectChanges();

    expect(unavailableStoreSpy.clean).toHaveBeenCalled();
    expect(unavailableStoreSpy.loadById).toHaveBeenCalledWith('1234');
  });

  it('should pass selected unavailable to the shared form', () => {
    unavailableStoreSpy.selected.set(mockUnavailable);
    fixture.detectChanges();

    const blockAgendaComponent = fixture.debugElement.children[0]
      .componentInstance as BlockAgendaComponent;

    expect(blockAgendaComponent.unavailable()).toEqual(
      expect.objectContaining({
        id,
        duration: '00:30',
      }),
    );
  });

  it('should call update when unavailable is received', () => {
    fixture.detectChanges();

    component.submit(mockUnavailable as any);

    expect(unavailableStoreSpy.update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        duration: '00:30',
      }),
      'unavailable/block-agenda',
    );
  });
});
