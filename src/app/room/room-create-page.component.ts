import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RoomComponent } from './room.component';
import { ICommon } from '../interfaces/common';
import { Store } from '@ngrx/store';
import { RoomState } from '../store/reducers/room.reducers';
import { createRoom } from '../store/actions/room.actions';
import { IRoom } from '../interfaces/room';
import { getCurrenciesPipe, getOfficesPipe } from '../store/selectors/room.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-room-create-page',
  template: '<app-room [config]="config" [currencies]="currencies()" [offices]="offices()" (submitData)="submit($event)" />',
  imports: [RoomComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomCreatePageComponent {
  config: ICommon = {
    title: 'ROOM.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  private readonly store: Store<RoomState> = inject(Store<RoomState>);

  currencies = toSignal(this.store.pipe(getCurrenciesPipe));
  offices = toSignal(this.store.pipe(getOfficesPipe));

  submit(room: IRoom) {
    this.store.dispatch(createRoom({ room }));
  }
}
