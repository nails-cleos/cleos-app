import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { RoomCreatePageComponent } from './room-create-page.component';
import { IRoomAll } from './room';
import { RoomStore } from '../store/room.store';
import { signal } from '@angular/core';
import { getOptions } from '../store/actions/payment.actions';

describe('RoomCreatePageComponent', () => {
  let component: RoomCreatePageComponent;
  let fixture: ComponentFixture<RoomCreatePageComponent>;

  let storeSpy: jasmine.SpyObj<Store>;
  let roomStoreSpy: {
    currencies: ReturnType<typeof signal<any>>;
    offices: ReturnType<typeof signal<any>>;
    clean: jasmine.Spy;
    loadInfo: jasmine.Spy;
    create: jasmine.Spy;
  };

  const mockRoom: Partial<IRoomAll> = {
    timeZone: 'Europe/Amsterdam',
  };

  beforeEach(async () => {
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    storeSpy.pipe.and.returnValue(of(undefined));
    roomStoreSpy = {
      currencies: signal(undefined),
      offices: signal(undefined),
      clean: jasmine.createSpy('clean'),
      loadInfo: jasmine.createSpy('loadInfo'),
      create: jasmine.createSpy('create'),
    };

    await TestBed.configureTestingModule({
      imports: [RoomCreatePageComponent],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: RoomStore, useValue: roomStoreSpy },
      ],
    }).overrideTemplate(RoomCreatePageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(RoomCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clean, load room info, and load payment options on init', () => {
    expect(roomStoreSpy.clean).toHaveBeenCalled();
    expect(roomStoreSpy.loadInfo).toHaveBeenCalled();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getOptions());
  });

  it('should call create when room is received', () => {
    component.submit(mockRoom);

    expect(roomStoreSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      timeZone: 'Europe/Amsterdam',
    }));
  });
});
