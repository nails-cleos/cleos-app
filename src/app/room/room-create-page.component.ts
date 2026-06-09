import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RoomComponent } from './room.component';
import { ICommon } from '../interfaces/common';
import { IRoom } from './room';
import { RoomStore } from '../store/room.store';
import { Store } from '@ngrx/store';
import { PaymentState } from '../store/reducers/payment.reducers';
import { getOptions } from '../store/actions/payment.actions';

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

  private readonly roomStore = inject(RoomStore);
  private readonly paymentStore: Store<PaymentState> = inject(Store<PaymentState>);

  currencies = this.roomStore.currencies;
  offices = this.roomStore.offices;

  constructor() {
    this.roomStore.clean();
    this.roomStore.loadInfo();
    this.paymentStore.dispatch(getOptions());
  }

  submit(room: IRoom) {
    this.roomStore.create(room);
  }
}
