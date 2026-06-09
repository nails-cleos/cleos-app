import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { RoomCreatePageComponent } from './room-create-page.component';
import { createRoom } from '../store/actions/room.actions';
import { IRoomAll } from '../interfaces/room';

describe('RoomCreatePageComponent', () => {
  let component: RoomCreatePageComponent;
  let fixture: ComponentFixture<RoomCreatePageComponent>;

  let storeSpy: jasmine.SpyObj<Store>;

  const mockRoom: Partial<IRoomAll> = {
    timeZone: 'Europe/Amsterdam',
  };

  beforeEach(async () => {
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    storeSpy.pipe.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [RoomCreatePageComponent],
      providers: [
        { provide: Store, useValue: storeSpy },
      ],
    }).overrideTemplate(RoomCreatePageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(RoomCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch create when room is received', () => {
    component.submit(mockRoom);

    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0] as any;

    expect(dispatched.type).toBe(createRoom.type);
    expect(dispatched.room).toEqual(jasmine.objectContaining({
      timeZone: 'Europe/Amsterdam',
    }));
  });
});
