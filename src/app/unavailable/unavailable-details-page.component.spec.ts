import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { UnavailableDetailsPageComponent } from './unavailable-details-page.component';
import { UnavailableStore } from '../store/unavailable.store';
import { IUnavailableAll } from './unavailable';
import { UnavailableComponent } from './unavailable.component';
import { AuthUserService } from '../services/auth-user.service';
import { UserStore } from '../store/user.store';
import { provideTranslateService } from '@ngx-translate/core';
describe('UnavailableDetailsPageComponent', () => {
  let component: UnavailableDetailsPageComponent;
  let fixture: ComponentFixture<UnavailableDetailsPageComponent>;

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
    description: 'Test Description',
    start: '2024-01-01',
    end: '2024-01-01',
    timestamp: 123,
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
      imports: [UnavailableDetailsPageComponent],
      providers: [
        provideTranslateService(),
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
      ],
    })
      .overrideTemplate(UnavailableComponent, '')
      .overrideTemplate(
        UnavailableDetailsPageComponent,
        `
        @if (unavailable(); as unavailable) {
          <app-unavailable [unavailable]="unavailable" [config]="config" />
        }
      `,
      )
      .compileComponents();

    fixture = TestBed.createComponent(UnavailableDetailsPageComponent);
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

    const unavailableComponent = fixture.debugElement.children[0]
      .componentInstance as UnavailableComponent;

    expect(unavailableComponent.unavailable()).toEqual(
      expect.objectContaining({
        id,
        description: 'Test Description',
      }),
    );
  });

  it('should call update when unavailable is received', () => {
    fixture.detectChanges();

    component.submit(mockUnavailable as any);

    expect(unavailableStoreSpy.update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        description: 'Test Description',
      }),
      'unavailable',
    );
  });
});
