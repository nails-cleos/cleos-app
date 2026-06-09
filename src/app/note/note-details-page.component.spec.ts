import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteDetailsPageComponent } from './note-details-page.component';
import { NoteStore } from '../store/note.store';
import { INoteAll } from './note';
import { NoteComponent } from './note.component';
import { IUserAll } from '../user/user';
import { FrequencyEnum } from '../util/helper';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

describe('NoteDetailsPageComponent', () => {
  let component: NoteDetailsPageComponent;
  let fixture: ComponentFixture<NoteDetailsPageComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  let noteStoreSpy: {
    navigationParams: ReturnType<typeof signal>;
    selected: ReturnType<typeof signal>;
    professionals: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    delete: jasmine.Spy;
    clean: jasmine.Spy;
    loadById: jasmine.Spy;
    update: jasmine.Spy;
  };

  const id = '123';

  const mockProfessional: IUserAll = {
    id: 'p1',
    displayName: 'Dr. Smith',
    email: '',
    locale: 'en',
    timeZone: '',
    authorities: [],
  };

  const mockNote: Partial<INoteAll> = {
    id,
    description: 'Test Description',
    professional: mockProfessional,
    date: '2024-01-01',
    repeat: FrequencyEnum.none,
  };

  beforeEach(async () => {
    noteStoreSpy = {
      navigationParams: signal<any>(undefined),
      selected: signal<any>(undefined),
      professionals: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      delete: jasmine.createSpy('delete'),
      clean: jasmine.createSpy('clean'),
      loadById: jasmine.createSpy('loadById'),
      update: jasmine.createSpy('update'),
    };
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [NoteDetailsPageComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NoteStore, useValue: noteStoreSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).overrideTemplate(NoteComponent, '')
      .overrideTemplate(NoteDetailsPageComponent, `
        @if (note(); as note) {
          <app-note [note]="note" [config]="config" />
        }
      `)
      .compileComponents();

    fixture = TestBed.createComponent(NoteDetailsPageComponent);

    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load note when id emits a value', () => {
    fixture.componentRef.setInput('id', '1234');
    fixture.detectChanges();

    expect(noteStoreSpy.clean).toHaveBeenCalled();
    expect(noteStoreSpy.loadById).toHaveBeenCalledWith('1234');
  });

  it('should pass selected note to the shared form', () => {
    noteStoreSpy.selected.set(mockNote);
    fixture.detectChanges();

    const noteComponent = fixture.debugElement.children[0].componentInstance as NoteComponent;

    expect(noteComponent.note()).toEqual(jasmine.objectContaining({
      id,
      description: 'Test Description',
      professional: mockProfessional,
    }));
  });

  it('should call update when note is received', () => {
    fixture.detectChanges();

    component.submit(mockNote);

    expect(noteStoreSpy.update).toHaveBeenCalledWith(id, jasmine.objectContaining({
      description: 'Test Description',
      professional: mockProfessional,
    }));
  });

  it('should call deleteNote on delete', () => {
    spyOn(component, 'note').and.returnValue(mockNote as any);

    dialogSpy.open.and.returnValue({ afterClosed: () => of(mockNote) } as any);

    component.delete();

    expect(noteStoreSpy.delete).toHaveBeenCalledWith(id, mockNote.description);
  });
});
