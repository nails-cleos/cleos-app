import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../store/app.states';
import * as fromActionsRoom from '../store/room.actions';
import { IRoom, Room } from '../interfaces/room';
import { IUser } from '../interfaces/user';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
  getState: Observable<any>;
  form!: FormGroup;
  errors: any = [];

  professionals: IUser[] | undefined;
  filteredOptions: Observable<IUser[] | undefined> | undefined;

  name: FormControl = new FormControl('', [
    Validators.required
  ]);

  professional: FormControl = new FormControl('', [
    Validators.required
  ]);
  start: FormControl;
  end: FormControl;

  constructor(private snackBar: MatSnackBar, private store: Store<AppState>, private formBuilder: FormBuilder) {
    this.getState = this.store.select(selectRoomState);
    const start = new Date(new Date().setHours(9, 0));
    const end = new Date(new Date().setHours(18, 0));

    this.start = new FormControl(start, [
      Validators.required
    ]);

    this.end = new FormControl(end, [
      Validators.required
    ]);
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
    this.getProfessionals();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      professional: this.professional,
      start: this.start,
      end: this.end
    });
    this.filteredOptions = this.professional.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => {
          return name ? this._filter(name) : this.professionals ? this.professionals.slice() : this.professionals;
        })
      );
  }

  clean(): void {
    this.store.dispatch(
      new fromActionsRoom.Clean()
    );
  }

  subscribe(): void {
    this.getState.subscribe(state => {
      if (state.professionals) {
        this.professionals = state.professionals;
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.errorMessage) {
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
      }
    });
  }

  getProfessionals(): void {
    this.store.dispatch(
      new fromActionsRoom.GetAllProfessional()
    );
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }
    const room: IRoom = new Room();
    room.name = this.name.value;
    room.professionalId = this.professional.value.id;

    const startTime = this.start.value;
    const startHours = `0${startTime.getHours()}`.slice(-2);
    const startMinutes = `0${startTime.getMinutes()}`.slice(-2);
    room.availability.start = `${startHours}:${startMinutes}`;
    const endTime = this.end.value;
    const endHours = `0${endTime.getHours()}`.slice(-2);
    const endMinutes = `0${endTime.getMinutes()}`.slice(-2);
    room.availability.end = `${endHours}:${endMinutes}`;

    this.store.dispatch(
      new fromActionsRoom.RoomSave(room)
    );
  }

  displayFn(user: IUser): string {
    return user && user.firstName ? user.firstName : '';
  }

  private _filter(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.professionals?.filter(option => option.firstName?.toLowerCase().indexOf(filterValue) === 0 ||
      option.lastName?.toLowerCase().indexOf(filterValue) === 0);
  }
}
