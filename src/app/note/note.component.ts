import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatestWith } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { backendFormatDate, createDateFromString } from '../util/dates';
import { fieldChange, requireMatch, valueChange } from '../util/validators';
import { createNote, deleteNote, getNote, updateNote } from '../store/note.actions';
import { INote, Note } from '../interfaces/note';
import { IUser, IUserAll } from '../interfaces/user';
import { executeDialogNoWidth, FrequencyEnum } from '../util/helper';
import { DialogComponent } from '../shared/dialog/generic/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { map, startWith } from 'rxjs/operators';
import { BackButtonDirective } from '../directives/back-button.directive';
import { NoteState } from '../store/reducers/note.reducers';
import {
  getAllProfessionalsPipe,
  getCurrentNoteIdPipe,
  getNavigationParamsPipe,
  getSelectedNotePipe,
  getSubErrorsPipe,
} from '../store/selectors/note.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../interfaces/common';
import { MatError, MatFormField, MatHint, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { KeyValuePipe } from '@angular/common';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';

type NoteForm = {
  description: FormControl<string>;
  professional: FormControl<IUserAll | undefined>;
  date: FormControl<Date | undefined>;
  repeat: FormControl<FrequencyEnum | undefined>;
}

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepicker, MatSelect, MatOption, MatIcon,
    MatIconButton, MatButton, ReactiveFormsModule, TranslatePipe, KeyValuePipe, MatAutocomplete, MatError,
    MatAutocompleteTrigger, MatPrefix, BackButtonDirective, BackButtonDirective, MatHint],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteComponent {
  private readonly store: Store<NoteState> = inject(Store<NoteState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);

  private noteId$ = this.store.pipe(getCurrentNoteIdPipe);
  private navigationParams$ = this.store.pipe(getNavigationParamsPipe);
  private selectedNote$ = this.store.pipe(getSelectedNotePipe);
  private allProfessionals$ = this.store.pipe(getAllProfessionalsPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);

  private noteIdSignal = toSignal(this.noteId$, { initialValue: null });
  private navigationParams = toSignal(this.navigationParams$);
  private subErrorsSignal = toSignal(this.subErrors$);

  allProfessionalsSignal = toSignal(this.allProfessionals$);
  noteSignal = toSignal(this.selectedNote$);
  isAddModeSignal = computed(() => !this.noteIdSignal());
  errors = signal<Record<string, unknown>>({});

  form: FormGroup<NoteForm> = this.formBuilder.group<NoteForm>({
    description: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    professional: this.formBuilder.control(undefined, {
      validators: [Validators.required, requireMatch],
    }),
    date: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
    repeat: this.formBuilder.control(undefined, {
      validators: [Validators.required],
    }),
  });

  filteredProfessionalSignal: Signal<IUserAll[] | undefined> = toSignal(
    this.getForm.professional.valueChanges.pipe(
      startWith(undefined),
      map((value?: IUserAll | string) => !value || typeof value === 'string' ? value : value.displayName),
      combineLatestWith(this.allProfessionals$),
      map(([name, professionals]) => {
        if (!professionals) {
          return [];
        }

        return name ? this.filter(name, professionals) : professionals.slice();
      })),
  );

  repeats = [FrequencyEnum.none, FrequencyEnum.onceAWeek, FrequencyEnum.onceAMonth, FrequencyEnum.onceAYear];

  constructor() {
    effect(() => {
      const params = this.navigationParams();
      if (params) {
        this.getForm.professional.setValue(params.professional);
        this.getForm.date.setValue(params.date);
      }
    });

    effect(() => {
      const selected = this.noteSignal();
      if (selected?.id) {
        const note = {
          id: selected.id,
          description: selected.description,
          professional: selected.professional,
          repeat: selected.repeat,
          date: createDateFromString(selected.date),
        };
        this.form.patchValue(note);
      }
    });

    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof NoteForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });

    effect(() => {
      const id = this.noteIdSignal();
      if (id) {
        this.store.dispatch(getNote({ id }));
      }
    });
  }

  get getForm(): NoteForm {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const noteSignal = this.noteSignal();
    const note: INote = new Note();
    note.description = fieldChange(this.getForm.description, noteSignal?.description);
    note.professionalId = valueChange(this.getForm.professional.value, noteSignal?.professional)?.id;
    note.repeat = fieldChange(this.getForm.repeat, noteSignal?.repeat);
    note.date = backendFormatDate(this.getForm.date.value);

    const id = this.noteIdSignal();
    if (!id) {
      this.store.dispatch(createNote({ note }));
    } else {
      this.store.dispatch(updateNote({ id, note }));
    }
    return;
  }

  delete() {
    const note = this.noteSignal();
    if (!note?.id) {
      return;
    }
    const title = this.translate.instant('NOTE.DELETED.TITLE');
    const description = note.description;
    const content = this.translate.instant('NOTE.DELETED.CONTENT', { description });

    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: note, variant: 'warning' }, result => {
      if (result) {
        this.store.dispatch(deleteNote({ id: result.id, description: result.description }));
      }
    });
  }

  displayFn = (user: IUser): string => user?.displayName ? user.displayName : '';

  keyDownHandler = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.professional.setValue(undefined);
    }
  };

  private filter = (name: string, professionals: IUserAll[]): IUserAll[] | undefined => professionals?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0);
}
