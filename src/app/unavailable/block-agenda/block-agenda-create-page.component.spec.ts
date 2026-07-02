import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlockAgendaCreatePageComponent } from './block-agenda-create-page.component';
import { UnavailableStore } from '../../store/unavailable.store';
import { IUnavailableAll } from '../unavailable';
import { AuthUserService } from '../../services/auth-user.service';

describe('BlockAgendaCreatePageComponent', () => {
  let component: BlockAgendaCreatePageComponent;
  let fixture: ComponentFixture<BlockAgendaCreatePageComponent>;

  let unavailableStoreSpy: {
    clean: jasmine.Spy;
    createBlockAgenda: jasmine.Spy;
  };

  const mockUnavailable: Partial<IUnavailableAll> = {
    duration: '00:30',
  };

  beforeEach(async () => {
    unavailableStoreSpy = {
      clean: jasmine.createSpy('clean'),
      createBlockAgenda: jasmine.createSpy('createBlockAgenda'),
    };

    await TestBed.configureTestingModule({
      imports: [BlockAgendaCreatePageComponent],
      providers: [
        { provide: UnavailableStore, useValue: unavailableStoreSpy },
        { provide: AuthUserService, useValue: { authUser: signal({ isRoomAdmin: false }) } },
      ],
    }).overrideTemplate(BlockAgendaCreatePageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(BlockAgendaCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clean on init', () => {
    expect(unavailableStoreSpy.clean).toHaveBeenCalled();
  });

  it('should expose params from navigation state', () => {
    const date = new Date('2024-01-01T10:10:00Z');
    const room = { id: 'room-1' } as any;
    history.pushState({ date, room }, '', '/...');

    fixture = TestBed.createComponent(BlockAgendaCreatePageComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.params()).toEqual(jasmine.objectContaining({
      date,
      room,
      showDuration: true,
      startTime: '11:15',
    }));
  });

  it('should call createBlockAgenda when unavailable is received', () => {
    component.submit(mockUnavailable as any);

    expect(unavailableStoreSpy.createBlockAgenda).toHaveBeenCalledWith(jasmine.objectContaining({
      duration: '00:30',
    }), false);
  });
});
