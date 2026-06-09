import { ChangeDetectionStrategy, Component, effect, inject, input, output, Signal, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatestWith } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { createDateFromString } from '../util/dates';
import { requireMatch } from '../util/validators';
import { INote, INoteAll, Note, NoteForm } from './note';
import { IUser, IUserAll } from '../user/user';
import { FrequencyEnum } from '../util/helper';
import { map, startWith } from 'rxjs/operators';
import { BackButtonDirective } from '../directives/back-button.directive';
import { ICommon, IError } from '../interfaces/common';
import { MatError, MatFormField, MatHint, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { KeyValuePipe } from '@angular/common';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { NoteStore } from '../store/note.store';

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
  config = input.required<ICommon>();
  note = input<INoteAll | undefined>();

  submitData = output<INote>();
  deleteData = output();

  private readonly noteStore = inject(NoteStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private navigationParams: Signal<{ professional?: IUserAll; date?: Date } | undefined> =
    this.noteStore.navigationParams;
  private subErrorsSignal: Signal<IError[] | undefined> = this.noteStore.subErrors;

  allProfessionalsSignal: Signal<IUserAll[] | undefined> = this.noteStore.professionals;
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
      combineLatestWith(toObservable(this.allProfessionalsSignal)),
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
      const selected = this.note();
      if (selected) {
        this.form.patchValue({
          ...selected,
          date: createDateFromString(selected.date),
        });
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
  }

  get getConfig(): ICommon {
    return this.config();
  }

  get getForm(): NoteForm {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitData.emit(Note.fromForm(this.getForm, this.note()));
  }

  delete() {
    this.deleteData.emit();
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
