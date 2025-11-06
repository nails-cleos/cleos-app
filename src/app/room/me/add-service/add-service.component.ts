import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import { getServices, updateServices } from '../../../store/room.actions';
import { MatDialog } from '@angular/material/dialog';
import { IService, IServicePrice, ServicePrice, ServiceType } from '../../../interfaces/room';
import { IGroupService } from '../../../interfaces/treatment';
import { createTreatmentGroupService, executeDialogNoWidth } from '../../../util/helper';
import { SharedModule } from '../../../shared/shared.module';
import { CurrencySymbolPipe } from '../../../pipes/currency-symbol.pipe';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { PriceDialogComponent } from './price-dialog.component';

@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.component.html',
  styleUrls: ['./add-service.component.scss'],
  imports: [SharedModule, CurrencySymbolPipe, BackButtonDirective],
})
export class AddServiceComponent implements OnInit, AfterViewInit, OnDestroy {

  additional: IService[] = [];
  selectedAdditional: IService[] = [];
  groups: Map<string, IGroupService> = new Map<string, IGroupService>();
  errors: any = [];

  private roomId?: string;
  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, public dialog: MatDialog) {
    this.getState = this.store.select(selectRoomState);
  }

  get save(): void {
    let prices: IServicePrice[] = [];
    this.selectedAdditional.forEach(additional => {
      const price = new ServicePrice(additional.id, additional.price, ServiceType.additional);
      prices = [...prices, price];
    });
    for (const [, value] of this.groups) {
      value.selectedTreatments.forEach(treatment => {
        const price = new ServicePrice(treatment.id, treatment.price, ServiceType.treatment);
        prices = [...prices, price];
      });
    }
    return this.store.dispatch(updateServices({ id: this.roomId!, prices }));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.subscribe();
  }

  ngAfterViewInit(): void {
    this.getServices();
  }

  drop = (event: CdkDragDrop<IService[]>, showDialog: boolean): void => {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else if (showDialog) {
      const selectedItem = event.previousContainer.data[event.previousIndex];
      executeDialogNoWidth(this.dialog, PriceDialogComponent, { name: selectedItem.name, type: selectedItem.type },
        s => {
          if (s) {
            const price = s.price;
            event.previousContainer.data[event.previousIndex] = Object.assign({}, selectedItem, { price });
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex,
              event.currentIndex);
          }
        });
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  };

  changePrice = (service: IService): void => {
    const dialogRef = this.dialog.open(PriceDialogComponent, {
      data: { name: service.name, type: service.type, currentPrice: service.price },
    });
    dialogRef.afterClosed().subscribe(s => {
      if (s) {
        if (s.type === ServiceType.additional) {
          const i = this.selectedAdditional.indexOf(service);
          if (i > -1) {
            const price = s.price;
            this.selectedAdditional[i] = Object.assign({}, service, { price });
          }
        } else if (s.type === ServiceType.treatment) {
          for (const [, value] of this.groups) {
            const i = value.selectedTreatments.indexOf(service);
            if (i > -1) {
              const price = s.price;
              value.selectedTreatments[i] = Object.assign({}, service, { price });
              break;
            }
          }
        }
      }
    });
  };

  private getServices = (): void => {
    this.route.params.subscribe((routeParams) => {
      this.roomId = routeParams.id;
      this.store.dispatch(getServices({ id: this.roomId! }));
    });
  };

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => {
      if (state.services) {
        const currency = state.services.currency.code;
        this.additional = state.services.additionalList.map((value: any) =>
          Object.assign({}, value, { currency, type: ServiceType.additional }));
        this.selectedAdditional = state.services.selectedAdditionalList.map((value: any) =>
          Object.assign({}, value, { currency, type: ServiceType.additional }));

        this.groups = new Map<string, IGroupService>();
        this.groups = createTreatmentGroupService(this.groups, state.services.treatments, currency);
        this.groups = createTreatmentGroupService(this.groups, state.services.selectedTreatments, currency, true);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
        });
      } else if (state.response) {
        this.getServices();
      }
    });
  };
}
