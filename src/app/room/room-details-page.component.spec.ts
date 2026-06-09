import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { RoomComponent } from './room.component';
import { RoomDetailsPageComponent } from './room-details-page.component';
import { IRoomAll } from './room';
import { ICommon } from '../interfaces/common';
import { RoomStore } from '../store/room.store';
import { signal } from '@angular/core';
import { getOptions } from '../store/actions/payment.actions';

@Component({
  selector: 'app-room',
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

  let storeSpy: jasmine.SpyObj<Store>;
  let roomStoreSpy: {
    selected: ReturnType<typeof signal<any>>;
    currencies: ReturnType<typeof signal<any>>;
    offices: ReturnType<typeof signal<any>>;
    clean: jasmine.Spy;
    loadInfo: jasmine.Spy;
    loadById: jasmine.Spy;
    update: jasmine.Spy;
  };

  const id = '123';

  const mockRoom: Partial<IRoomAll> = {
    id,
    timeZone: 'Europe/Amsterdam',
    paymentTypes: [],
    primary: false,
    address: { id: 1, name: 'Main Location', location: { x: 0, y: 0 } },
    office: { id: 'office-123', name: 'Office name', manager: { id: 'manager-1' } },
    currency: { id: 'currency-123', code: 'EUR', icon: 'euro', name: 'Euro' },
    availabilities: [],
    professionals: [],
  };

  beforeEach(async () => {
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    roomStoreSpy = {
      selected: signal(undefined),
      currencies: signal(undefined),
      offices: signal(undefined),
      clean: jasmine.createSpy('clean'),
      loadInfo: jasmine.createSpy('loadInfo'),
      loadById: jasmine.createSpy('loadById'),
      update: jasmine.createSpy('update'),
    };

    await TestBed.configureTestingModule({
      imports: [RoomDetailsPageComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: RoomStore, useValue: roomStoreSpy },
      ],
    }).overrideComponent(RoomDetailsPageComponent, {
      remove: { imports: [RoomComponent] },
      add: { imports: [RoomComponentStub] },
    })
      .overrideTemplate(RoomDetailsPageComponent, `
        @if (room(); as room) {
          <app-room [room]="room" [config]="config" />
        }
      `)
      .compileComponents();

    fixture = TestBed.createComponent(RoomDetailsPageComponent);
    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clean, load room info, load payment options, and load room when id emits a value', () => {
    fixture.detectChanges();

    expect(roomStoreSpy.clean).toHaveBeenCalled();
    expect(roomStoreSpy.loadInfo).toHaveBeenCalled();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getOptions());
    expect(roomStoreSpy.loadById).toHaveBeenCalledWith(id);
  });

  it('should pass selected room to the shared form', () => {
    roomStoreSpy.selected.set(mockRoom);
    fixture.detectChanges();

    const roomComponent = fixture.debugElement.children[0].componentInstance as RoomComponentStub;

    expect(roomComponent.room()).toEqual(jasmine.objectContaining({
      id,
      timeZone: 'Europe/Amsterdam',
    }));
  });

  it('should call update when room is received', () => {
    fixture.detectChanges();

    component.submit(mockRoom);

    expect(roomStoreSpy.update).toHaveBeenCalledWith(id, jasmine.objectContaining({
      timeZone: 'Europe/Amsterdam',
    }));
  });
});
