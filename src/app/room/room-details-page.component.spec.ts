import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomComponent } from './room.component';
import { RoomDetailsPageComponent } from './room-details-page.component';
import { IRoomAll } from './room';
import { ICommon } from '../interfaces/common';
import { RoomStore } from '../store/room.store';
import { signal } from '@angular/core';

@Component({
  selector: 'app-room',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
class RoomComponentStub {
  room = input<Partial<IRoomAll> | undefined>();
  config = input<ICommon | undefined>();
  currencies = input<any>();
  offices = input<any>();
}

describe('RoomDetailsPageComponent', () => {
  let component: RoomDetailsPageComponent;
  let fixture: ComponentFixture<RoomDetailsPageComponent>;

  let roomStoreSpy: {
    selected: ReturnType<typeof signal<any>>;
    currencies: ReturnType<typeof signal<any>>;
    offices: ReturnType<typeof signal<any>>;
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
    roomStoreSpy = {
      selected: signal(undefined),
      currencies: signal(undefined),
      offices: signal(undefined),
      clean: vi.fn().mockName('clean'),
      loadInfo: vi.fn().mockName('loadInfo'),
      loadById: vi.fn().mockName('loadById'),
      update: vi.fn().mockName('update'),
    };

    await TestBed.configureTestingModule({
      imports: [RoomDetailsPageComponent],
      providers: [{ provide: RoomStore, useValue: roomStoreSpy }],
    })
      .overrideComponent(RoomDetailsPageComponent, {
        remove: { imports: [RoomComponent] },
        add: { imports: [RoomComponentStub] },
      })
      .overrideTemplate(
        RoomDetailsPageComponent,
        `
        @if (room(); as room) {
          <app-room [room]="room" [config]="config" />
        }
      `,
      )
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

    const roomComponent = fixture.debugElement.children[0]
      .componentInstance as RoomComponentStub;

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
