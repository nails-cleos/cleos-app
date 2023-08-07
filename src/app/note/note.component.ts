import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, UntypedFormControl, UntypedFormGroup, Validators, ɵTypedOrUntyped } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { AppState, selectNoteState } from '../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import { backendFormatDate } from '../util/dates';
import { fieldChange, requireMatchAsync, valueChange } from '../util/validators';
import * as fromActionsNote from '../store/note.actions';
import { INote, INoteAll, Note } from '../interfaces/note';
import { IUser, IUserAll } from '../interfaces/user';
import { executeDialogNoWidth, FrequencyEnum, getUserName } from '../util/helper';
import { DialogComponent } from '../shared/dialog/generic/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() note?: INoteAll;
  form!: UntypedFormGroup;
  id?: string;
  isAddMode: boolean;

  professionals?: IUserAll[];
  filteredOptions?: Observable<IUser[] | undefined>;

  repeats = [FrequencyEnum.none, FrequencyEnum.onceAWeek, FrequencyEnum.onceAMonth];
  errors: any = [];

  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly extras: any;

  constructor(private readonly translate: TranslateService, private store: Store<AppState>, private formBuilder: FormBuilder,
              private route: ActivatedRoute, private router: Router, public dialog: MatDialog) {
    this.isAddMode = true;
    this.getState = this.store.select(selectNoteState);
    this.extras = this.router.getCurrentNavigation()?.extras.state;
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }

    const note: INote = new Note();
    note.description = fieldChange(this.getForm.description as UntypedFormControl, this.note?.description);
    note.professionalId = valueChange(this.getForm.professional.value, this.note?.professional)?.id;
    note.repeat = fieldChange(this.getForm.repeat as UntypedFormControl, this.note?.repeat);
    note.date = backendFormatDate(this.getForm.date.value);

    if (this.isAddMode) {
      return this.store.dispatch(
        new fromActionsNote.NoteSave(note)
      );
    } else {
      note.id = this.id;
      return this.store.dispatch(
        new fromActionsNote.NoteUpdate(note)
      );
    }
  }

  get delete(): void {
    const title = this.translate.instant('NOTE.DELETED.TITLE');
    const description = this.note?.description;
    const content = this.translate.instant('NOTE.DELETED.CONTENT', { description });

    return executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: this.note }, result => {
      if (result) {
        this.store.dispatch(
          new fromActionsNote.DeleteNote(result.id)
        );
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = id;
    }
    this.isAddMode = !this.id;
    this.clean();
    this.createForm();
    this.subscribe();
    if (this.extras) {
      this.getForm.professional.setValue(this.extras.professional);
      this.getForm.date.setValue(this.extras.date);
    }
    if (!this.isAddMode) {
      this.getNote();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getProfessionals();
  }

  displayFn(user: IUser): string {
    return user ? getUserName(user) : '';
  }

  keyDownHandler(event: any): void {
    if (event.code === 'Backspace') {
      this.getForm.professional.setValue('');
    }
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.professionals = state.professionals;
      this.note = state.selected;
      if (this.note?.id) {
        this.form.patchValue(this.note);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        this.router.navigate(['reservation', 'calendar']);
      }
    });
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      description: ['', Validators.required],
      professional: ['', Validators.required, requireMatchAsync],
      date: ['', Validators.required],
      repeat: ['', Validators.required]
    });
    this.filteredOptions = this.getForm.professional.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filter(name) : this.professionals ? this.professionals.slice() : this.professionals)
    );
  }

  private filter(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.professionals?.filter(option => getUserName(option)?.toLowerCase().indexOf(filterValue) === 0);
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsNote.Clean()
    );
  }

  private getProfessionals(): void {
    return this.store.dispatch(
      new fromActionsNote.GetAllProfessional()
    );
  }

  private getNote(): void {
    this.store.dispatch(
      new fromActionsNote.NoteFind(this.id)
    );
  }
}
