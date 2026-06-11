import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomCreatePageComponent } from './room-create-page.component';
import { IRoomAll } from './room';
import { RoomStore } from '../store/room.store';
import { signal } from '@angular/core';

describe('RoomCreatePageComponent', () => {
  let component: RoomCreatePageComponent;
  let fixture: ComponentFixture<RoomCreatePageComponent>;

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
    expect(roomStoreSpy.loadInfo).not.toHaveBeenCalled();
  });

  it('should call create when room is received', () => {
    component.submit(mockRoom);

    expect(roomStoreSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      timeZone: 'Europe/Amsterdam',
    }));
  });
});
