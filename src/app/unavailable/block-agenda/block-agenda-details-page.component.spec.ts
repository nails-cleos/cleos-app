import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { BlockAgendaDetailsPageComponent } from './block-agenda-details-page.component';
import { UnavailableStore } from '../../store/unavailable.store';
import { IUnavailableAll } from '../unavailable';
import { BlockAgendaComponent } from './block-agenda.component';
import { AuthUserService } from '../../services/auth-user.service';
import { UserStore } from '../../store/user.store';

describe('BlockAgendaDetailsPageComponent', () => {
  let component: BlockAgendaDetailsPageComponent;
  let fixture: ComponentFixture<BlockAgendaDetailsPageComponent>;

  let unavailableStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadById: jasmine.Spy;
    update: jasmine.Spy;
    delete: jasmine.Spy;
  };

  let userStoreSpy: {
    professionals: ReturnType<typeof signal>;
    rooms: ReturnType<typeof signal>;
    loadProfessionals: jasmine.Spy;
    loadRoomsByProfessionalId: jasmine.Spy;
  };

  const id = '123';
  const mockUnavailable: Partial<IUnavailableAll> = {
    id,
    start: '2024-01-01',
    timestamp: 123,
    duration: '00:30',
  };

  beforeEach(async () => {
    unavailableStoreSpy = {
      selected: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadById: jasmine.createSpy('loadById'),
      update: jasmine.createSpy('update'),
      delete: jasmine.createSpy('delete'),
    };
    userStoreSpy = {
      professionals: signal<any>(undefined),
      rooms: signal<any>(undefined),
      loadProfessionals: jasmine.createSpy('loadProfessionals'),
      loadRoomsByProfessionalId: jasmine.createSpy('loadRoomsByProfessionalId'),
    };

    await TestBed.configureTestingModule({
      imports: [BlockAgendaDetailsPageComponent, TranslateModule.forRoot()],
      providers: [
        { provide: UnavailableStore, useValue: unavailableStoreSpy },
        { provide: UserStore, useValue: userStoreSpy },
        { provide: AuthUserService, useValue: { authUser: signal({ isRoomAdmin: false }) } },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
      ],
    }).overrideTemplate(BlockAgendaComponent, '')
      .overrideTemplate(BlockAgendaDetailsPageComponent, `
        @if (unavailable(); as unavailable) {
          <app-block-agenda [unavailable]="unavailable" [config]="config" />
        }
      `)
      .compileComponents();

    fixture = TestBed.createComponent(BlockAgendaDetailsPageComponent);
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

    const blockAgendaComponent = fixture.debugElement.children[0].componentInstance as BlockAgendaComponent;

    expect(blockAgendaComponent.unavailable()).toEqual(jasmine.objectContaining({
      id,
      duration: '00:30',
    }));
  });

  it('should call update when unavailable is received', () => {
    fixture.detectChanges();

    component.submit(mockUnavailable as any);

    expect(unavailableStoreSpy.update).toHaveBeenCalledWith({
      id,
      unavailable: jasmine.objectContaining({
        duration: '00:30',
      }),
      path: 'unavailable/block-agenda',
    });
  });
});
