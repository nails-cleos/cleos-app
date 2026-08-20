import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomDetailsPageComponent } from './room-details-page.component';
import { IRoomAll } from './room';
import { RoomStore } from '../store/room.store';
import { provideTranslateService } from '@ngx-translate/core';
import { NavigationService } from '@app/services/navigation.service';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { provideAppDateAdapter } from '@app/util/adapter/app-date.provider';
import { GoogleMapComponent } from '@app/shared/google-map/google-map.component';
import { GoogleMapStubComponent } from '@app/util/stub/google-map-stub.component';
import { NgcCookieConsentService } from 'ngx-cookieconsent';

describe('RoomDetailsPageComponent', () => {
  let component: RoomDetailsPageComponent;
  let fixture: ComponentFixture<RoomDetailsPageComponent>;

  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };
  let roomStoreSpy: {
    selected: ReturnType<typeof signal<any>>;
    currencies: ReturnType<typeof signal<any>>;
    offices: ReturnType<typeof signal<any>>;
    professionals: ReturnType<typeof signal<any>>;
    subErrors: ReturnType<typeof signal<any>>;
    clean: Mock;
    loadInfo: Mock;
    loadById: Mock;
    update: Mock;
  };

  const id = '123';

  const mockRoom: Partial<IRoomAll> = {
    id,
    timeZone: 'Europe/Amsterdam',
    paymentTypes: [],
    primary: false,
    address: { id: 1, name: 'Main Location', location: { x: 0, y: 0 } },
    office: {
      id: 'office-123',
      name: 'Office name',
      manager: { id: 'manager-1' },
    },
    currency: { id: 'currency-123', code: 'EUR', icon: 'euro', name: 'Euro' },
    availabilities: [],
    professionals: [],
  };

  beforeEach(async () => {
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    roomStoreSpy = {
      selected: signal(undefined),
      currencies: signal(undefined),
      offices: signal(undefined),
      professionals: signal(undefined),
      subErrors: signal(undefined),
      clean: vi.fn().mockName('clean'),
      loadInfo: vi.fn().mockName('loadInfo'),
      loadById: vi.fn().mockName('loadById'),
      update: vi.fn().mockName('update'),
    };

    const cookieConsentService = {
      getConfig: vi.fn().mockName('NgcCookieConsentService.getConfig'),
      destroy: vi.fn().mockName('NgcCookieConsentService.destroy'),
      init: vi.fn().mockName('NgcCookieConsentService.init'),
    };

    await TestBed.configureTestingModule({
      imports: [RoomDetailsPageComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: RoomStore, useValue: roomStoreSpy },
        { provide: NgcCookieConsentService, useValue: cookieConsentService },
        provideAppDateAdapter(),
      ],
      teardown: {
        destroyAfterEach: true,
      },
    })
      .overrideComponent(RoomDetailsPageComponent, {
        remove: { imports: [GoogleMapComponent] },
        add: { imports: [GoogleMapStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RoomDetailsPageComponent);
    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clean and load room when id emits a value', () => {
    fixture.detectChanges();

    expect(roomStoreSpy.clean).toHaveBeenCalled();
    expect(roomStoreSpy.loadById).toHaveBeenCalledWith(id);
  });

  it('should pass selected room to the shared form', () => {
    roomStoreSpy.selected.set(mockRoom);
    fixture.detectChanges();

    const roomComponent = fixture.debugElement.children[0].componentInstance;

    expect(roomComponent.room()).toEqual(
      expect.objectContaining({
        id,
        timeZone: 'Europe/Amsterdam',
      }),
    );
  });

  it('should call update when room is received', () => {
    fixture.detectChanges();

    component.submit(mockRoom);

    expect(roomStoreSpy.update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        timeZone: 'Europe/Amsterdam',
      }),
    );
  });
});
