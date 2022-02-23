import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectRoomState } from '../../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsRoom from '../../../store/room.actions';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IService, IServicePrice, ServicePrice, ServiceType } from '../../../interfaces/room';
import { GroupService, IGroupService, IProductAll } from '../../../interfaces/product';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { createProductGroupService } from '../../../util/helper';

@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.component.html',
  styleUrls: ['./add-service.component.scss']
})
export class AddServiceComponent implements OnInit, AfterViewInit, OnDestroy {

  additional: IService[] = [];
  selectedAdditional: IService[] = [];
  groups: Map<string, IGroupService> = new Map<string, IGroupService>();
  errors: any = [];

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, public dialog: MatDialog) {
    this.getState = this.store.select(selectRoomState);
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

  drop(event: CdkDragDrop<IService[]>, showDialog: boolean): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else if (showDialog) {
      const selectedItem = event.previousContainer.data[event.previousIndex];
      const dialogRef = this.dialog.open(PriceDialogComponent, {
        data: {name: selectedItem.name, type: selectedItem.type}
      });

      dialogRef.afterClosed().subscribe(s => {
        if (s) {
          const price = s.price;
          event.previousContainer.data[event.previousIndex] = Object.assign({}, selectedItem, {price});
          transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }
      });
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  save(): void {
    let prices: IServicePrice[] = [];
    this.selectedAdditional.forEach(additional => {
      const price = new ServicePrice(additional.id, additional.price, ServiceType.additional);
      prices = [...prices, price];
    });
    for (const [, value] of this.groups) {
      value.selectedProducts.forEach(product => {
        const price = new ServicePrice(product.id, product.price, ServiceType.product);
        prices = [...prices, price];
      });
    }
    this.store.dispatch(
      new fromActionsRoom.UpdateMyServices(prices)
    );
  }

  changePrice(service: IService): void {
    const dialogRef = this.dialog.open(PriceDialogComponent, {
      data: {name: service.name, type: service.type, currentPrice: service.price}
    });
    dialogRef.afterClosed().subscribe(s => {
      if (s) {
        if (s.type === ServiceType.additional) {
          const i = this.selectedAdditional.indexOf(service);
          if (i > -1) {
            const price = s.price;
            this.selectedAdditional[i] = Object.assign({}, service, {price});
          }
        } else if (s.type === ServiceType.product) {
          for (const [, value] of this.groups) {
            const i = value.selectedProducts.indexOf(service);
            if (i > -1) {
              const price = s.price;
              value.selectedProducts[i] = Object.assign({}, service, {price});
              break;
            }
          }
        }
      }
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.services) {
        const currency = state.services.currency.code;
        this.additional = state.services.additionalList.map((value: any) =>
          Object.assign({}, value, {currency, type: ServiceType.additional}));
        this.selectedAdditional = state.services.selectedAdditionalList.map((value: any) =>
          Object.assign({}, value, {currency, type: ServiceType.additional}));

        this.groups = new Map<string, IGroupService>();
        this.groups = createProductGroupService(this.groups, state.services.products, currency);
        this.groups = createProductGroupService(this.groups, state.services.selectedProducts, currency, true);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
        });
      } else if (state.message) {
        this.getServices();
      }
    });
  }

  private createProductGroupService(list: IProductAll[], currency: string, isSelected: boolean): void {
    list.forEach((product: IProductAll) => {
      const groupId = product.group.id;
      const mapGroup = this.groups.get(groupId);
      const keyGroup: IGroupService = mapGroup ? mapGroup : new GroupService(groupId, product.group.name);

      product = Object.assign({}, product, {currency, type: ServiceType.product});

      if (isSelected) {
        keyGroup.selectedProducts = [...keyGroup.selectedProducts, product];
      } else {
        keyGroup.products = [...keyGroup.products, product];
      }
      this.groups.set(groupId, keyGroup);
    });
  }

  private getServices(): void {
    this.store.dispatch(
      new fromActionsRoom.GetMyServices()
    );
  }
}

@Component({
  selector: 'app-price-dialog',
  templateUrl: 'price-dialog.html'
})
export class PriceDialogComponent implements OnInit {

  form!: FormGroup;
  price: FormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(public dialogRef: MatDialogRef<PriceDialogComponent>, private formBuilder: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: { name: string; price: number, currentPrice?: number }) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      price: this.price
    });

    if (this.data.currentPrice) {
      this.price.setValue(this.data.currentPrice);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.data.price = this.price.value;
    this.dialogRef.close(this.data);
  }
}
