import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { RoomComponent } from './room.component';
import { RoomDetailsPageComponent } from './room-details-page.component';
import { cleanRoom, getRoom, updateRoom } from '../store/actions/room.actions';
import { IRoomAll } from '../interfaces/room';
import { ICommon } from '../interfaces/common';

@Component({
  selector: 'app-room',
  template: '',
})
class RoomComponentStub {
  room = input<Partial<IRoomAll> | undefined>();
  config = input<ICommon | undefined>();
}

describe('RoomDetailsPageComponent', () => {
  let component: RoomDetailsPageComponent;
  let fixture: ComponentFixture<RoomDetailsPageComponent>;

  let storeSpy: jasmine.SpyObj<Store>;
  let selectedRoom$: BehaviorSubject<any>;

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
    selectedRoom$ = new BehaviorSubject(undefined);
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    storeSpy.pipe.and.returnValue(selectedRoom$.asObservable());

    await TestBed.configureTestingModule({
      imports: [RoomDetailsPageComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
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

  it('should clean and load room when id emits a value', () => {
    fixture.detectChanges();

    expect(storeSpy.dispatch.calls.argsFor(0)[0]).toEqual(cleanRoom());
    expect(storeSpy.dispatch.calls.argsFor(1)[0]).toEqual(getRoom({ id: id, redirect: true }));
  });

  it('should pass selected room to the shared form', () => {
    selectedRoom$.next(mockRoom);
    fixture.detectChanges();

    const roomComponent = fixture.debugElement.children[0].componentInstance as RoomComponentStub;

    expect(roomComponent.room()).toEqual(jasmine.objectContaining({
      id,
      timeZone: 'Europe/Amsterdam',
    }));
  });

  it('should dispatch update when room is received', () => {
    fixture.detectChanges();

    component.submit(mockRoom);

    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0] as any;

    expect(dispatched.type).toBe(updateRoom.type);
    expect(dispatched.id).toBe(id);
    expect(dispatched.room).toEqual(jasmine.objectContaining({
      timeZone: 'Europe/Amsterdam',
    }));
  });
});
