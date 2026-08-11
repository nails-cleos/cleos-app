import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomCreatePageComponent } from './room-create-page.component';
import { IRoomAll } from './room';
import { RoomStore } from '../store/room.store';
import { signal } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('RoomCreatePageComponent', () => {
  let component: RoomCreatePageComponent;
  let fixture: ComponentFixture<RoomCreatePageComponent>;

  let roomStoreSpy: {
    currencies: ReturnType<typeof signal<any>>;
    offices: ReturnType<typeof signal<any>>;
    clean: Mock;
    loadInfo: Mock;
    create: Mock;
  };

  const mockRoom: Partial<IRoomAll> = {
    timeZone: 'Europe/Amsterdam',
  };

  beforeEach(async () => {
    roomStoreSpy = {
      currencies: signal(undefined),
      offices: signal(undefined),
      clean: vi.fn().mockName('clean'),
      loadInfo: vi.fn().mockName('loadInfo'),
      create: vi.fn().mockName('create'),
    };

    await TestBed.configureTestingModule({
      imports: [RoomCreatePageComponent],
      providers: [
        provideTranslateService(),
        provideRouter([]),
        provideNativeDateAdapter(),
        { provide: RoomStore, useValue: roomStoreSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clean, load room info, and load payment options on init', () => {
    expect(roomStoreSpy.clean).toHaveBeenCalled();
    expect(roomStoreSpy.loadInfo).toHaveBeenCalled();
  });

  it('should call create when room is received', () => {
    component.submit(mockRoom);

    expect(roomStoreSpy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        timeZone: 'Europe/Amsterdam',
      }),
    );
  });
});
