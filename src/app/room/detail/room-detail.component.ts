import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { IRoom, Room } from '../../interfaces/room';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../../store/app.states';
import * as fromActionsRoom from '../../store/room.actions';
import { FieldChange } from '../../util/validators';

@Component({
  selector: 'app-room-detail',
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.scss']
})
export class RoomDetailComponent implements OnInit, AfterViewInit {

  @Input() room: IRoom | undefined;
  form!: FormGroup;
  getState: Observable<any>;
  errors: any = [];
  professionalName: string | undefined;

  name: FormControl = new FormControl('', [
    Validators.required
  ]);
  startDate: FormControl = new FormControl('', [
    Validators.required
  ]);
  endDate: FormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private route: ActivatedRoute, private snackBar: MatSnackBar, private store: Store<AppState>,
              private formBuilder: FormBuilder) {
    this.getState = this.store.select(selectRoomState);
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
  }

  ngAfterViewInit(): void {
    this.getUser();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      startDate: this.startDate,
      endDate: this.endDate
    });
  }

  clean(): void {
    this.store.dispatch(
      new fromActionsRoom.Clean()
    );
  }

  subscribe(): void {
    this.getState.subscribe(state => {
      if (state.selected) {
        this.room = {
          id: state.selected.id,
          name: state.selected.name
        } as IRoom;
        this.professionalName = `${state.selected.professional.firstName} ${state.selected.professional.lastName}`;
        const startTime = state.selected.availability.start.split(':');
        this.room.startDate = new Date(new Date().setHours(startTime[0], startTime[1]));
        const endTime = state.selected.availability.end.split(':');
        this.room.endDate = new Date(new Date().setHours(endTime[0], endTime[1]));
        this.form.patchValue(this.room);
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

  getUser(): void {
    if (!this.room) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsRoom.RoomFind(id)
      );
    }
  }

  update(): void {
    if (this.form.invalid) {
      return;
    }
    const room: IRoom = new Room();
    room.id = this.room?.id;
    room.name = FieldChange(this.name, this.room?.name);

    const startTime = this.startDate.value;
    const startHours = `0${startTime.getHours()}`.slice(-2);
    const startMinutes = `0${startTime.getMinutes()}`.slice(-2);
    room.availability.start = `${startHours}:${startMinutes}`;

    const endTime = this.endDate.value;
    const endHours = `0${endTime.getHours()}`.slice(-2);
    const endMinutes = `0${endTime.getMinutes()}`.slice(-2);
    room.availability.end = `${endHours}:${endMinutes}`;

    this.store.dispatch(new fromActionsRoom.RoomUpdate(room));
  }
}

