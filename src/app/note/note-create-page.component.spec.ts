import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteCreatePageComponent } from './note-create-page.component';
import { NoteStore } from '../store/note.store';
import { INoteAll } from '../interfaces/note';
import { IUserAll } from '../interfaces/user';
import { FrequencyEnum } from '../util/helper';

describe('NoteCreatePageComponent', () => {
  let component: NoteCreatePageComponent;
  let fixture: ComponentFixture<NoteCreatePageComponent>;

  let noteStoreSpy: {
    clean: jasmine.Spy;
    create: jasmine.Spy;
  };

  const mockProfessional: IUserAll = {
    id: 'p1',
    displayName: 'Dr. Smith',
    email: '',
    locale: 'en',
    timeZone: '',
    authorities: [],
  };

  const mockNote: Partial<INoteAll> = {
    description: 'Test Description',
    professional: mockProfessional,
    date: '2024-01-01',
    repeat: FrequencyEnum.none,
  };

  beforeEach(async () => {
    noteStoreSpy = {
      clean: jasmine.createSpy('clean'),
      create: jasmine.createSpy('create'),
    };

    await TestBed.configureTestingModule({
      imports: [NoteCreatePageComponent],
      providers: [
        { provide: NoteStore, useValue: noteStoreSpy },
      ],
    }).overrideTemplate(NoteCreatePageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(NoteCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call create when note is received', () => {
    component.submit(mockNote);

    expect(noteStoreSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      professional: mockProfessional,
      description: 'Test Description',
    }));
  });
});
