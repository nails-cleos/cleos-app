import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteCreatePageComponent } from './note-create-page.component';
import { NoteStore } from '../store/note.store';
import { INoteAll } from './note';
import { IUserAll } from '../user/user';
import { FrequencyEnum } from '../util/helper';
describe('NoteCreatePageComponent', () => {
  let component: NoteCreatePageComponent;
  let fixture: ComponentFixture<NoteCreatePageComponent>;

  let noteStoreSpy: {
    clean: Mock;
    create: Mock;
    setNavigationParams: Mock;
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
      clean: vi.fn().mockName('clean'),
      create: vi.fn().mockName('create'),
      setNavigationParams: vi.fn().mockName('setNavigationParams'),
    };

    await TestBed.configureTestingModule({
      imports: [NoteCreatePageComponent],
      providers: [{ provide: NoteStore, useValue: noteStoreSpy }],
    })
      .overrideTemplate(NoteCreatePageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(NoteCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call create when note is received', () => {
    component.submit(mockNote);

    expect(noteStoreSpy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        professional: mockProfessional,
        description: 'Test Description',
      }),
    );
  });
});
