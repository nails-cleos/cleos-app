import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';

import { IService, IServicePrice, ServicePrice, ServiceType } from '../../room';
import { IGroupService } from '../../../treatment/treatment';
import { createTreatmentGroupService, executeDialogNoWidth } from '../../../util/helper';
import { CurrencySymbolPipe } from '../../../pipes/currency-symbol.pipe';
import { BackButtonDirective } from '../../../directives/back-button.directive';
import { PriceDialogComponent } from './price-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { KeyValuePipe } from '@angular/common';
import { RoomStore } from '../../../store/room.store';

@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.component.html',
  styleUrls: ['./add-service.component.scss'],
  imports: [MatIcon, MatButton, TranslatePipe, KeyValuePipe, BackButtonDirective,
    CurrencySymbolPipe, CurrencySymbolPipe, BackButtonDirective, CdkDropList, CdkDrag],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddServiceComponent {
  id = input<string>();

  private readonly roomStore = inject(RoomStore);
  private readonly dialog = inject(MatDialog);

  private servicesSignal = this.roomStore.services;
  private responseSignal = this.roomStore.response;

  additional = signal<IService[]>([]);
  selectedAdditional = signal<IService[]>([]);
  groups = signal<Map<string, IGroupService>>(new Map());

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.roomStore.loadServices(id);
      }
    });

    effect(() => {
      const services = this.servicesSignal();
      if (!services?.currency) {
        return;
      }

      const currency = services.currency.code;

      this.additional.set(
        services.additionalList.map(s => ({
          ...s,
          currency,
          type: ServiceType.additional,
        })),
      );

      this.selectedAdditional.set(
        services.selectedAdditionalList.map(s => ({
          ...s,
          currency,
          type: ServiceType.additional,
        })),
      );

      const groups = new Map<string, IGroupService>();
      createTreatmentGroupService(groups, services.treatments, currency);
      createTreatmentGroupService(
        groups,
        services.selectedTreatments,
        currency,
        true,
      );

      this.groups.set(groups);
    });

    effect(() => {
      const response = this.responseSignal();
      const id = this.id();
      if (response && id) {
        this.roomStore.loadServices(id);
      }
    });
  }

  save() {
    const id = this.id();
    if (!id) {
      return;
    }

    const prices: IServicePrice[] = [];

    this.selectedAdditional().forEach(service => {
      prices.push(
        new ServicePrice(service.id, service.price, ServiceType.additional),
      );
    });

    const groups = this.groups();
    if (!groups) {
      return;
    }

    for (const [, group] of groups) {
      group.selectedTreatments.forEach(t => {
        prices.push(
          new ServicePrice(t.id, t.price, ServiceType.treatment),
        );
      });
    }

    this.roomStore.updateServices(id, prices);
  }

  changePrice(service: IService): void {
    const dialogRef = this.dialog.open(PriceDialogComponent, {
      data: {
        name: service.name,
        type: service.type,
        currentPrice: service.price,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      if (result.type === ServiceType.additional) {
        this.selectedAdditional.update(list => {
          const copy = [...list];
          const i = copy.findIndex(s => s.id === service.id);
          if (i > -1) {
            copy[i] = { ...service, price: result.price };
          }
          return copy;
        });
      }

      if (result.type === ServiceType.treatment) {
        this.groups.update(groups => {
          if (!groups) {
            return groups;
          }

          const newGroups = new Map(groups);

          for (const [key, group] of newGroups) {
            const i = group.selectedTreatments.findIndex(
              t => t.id === service.id,
            );
            if (i > -1) {
              const treatments = [...group.selectedTreatments];
              treatments[i] = { ...service, price: result.price };

              newGroups.set(key, {
                ...group,
                selectedTreatments: treatments,
              });
              break;
            }
          }

          return newGroups;
        });
      }
    });
  }

  dropAdditional(
    event: CdkDragDrop<IService[]>,
    showDialog: boolean,
  ): void {
    const fromAdditional = event.previousContainer.data === this.additional();
    const toSelected = event.container.data === this.selectedAdditional();

    if (event.previousContainer === event.container) {
      const signal = toSelected ? this.selectedAdditional : this.additional;
      signal.update(list => {
        const copy = [...list];
        moveItemInArray(copy, event.previousIndex, event.currentIndex);
        return copy;
      });
      return;
    }

    const item = fromAdditional ? this.additional()[event.previousIndex] :
      this.selectedAdditional()[event.previousIndex];

    const commit = (price?: number) => {
      const sourceSignal = fromAdditional ? this.additional : this.selectedAdditional;
      const targetSignal = fromAdditional ? this.selectedAdditional : this.additional;

      sourceSignal.update(src => {
        const source = [...src];
        const target = [...targetSignal()];

        if (price !== undefined) {
          source[event.previousIndex] = { ...item, price };
        }

        transferArrayItem(
          source,
          target,
          event.previousIndex,
          event.currentIndex,
        );

        targetSignal.set(target);
        return source;
      });
    };

    if (showDialog) {
      executeDialogNoWidth(this.dialog, PriceDialogComponent, { name: item.name, type: item.type },
        result => commit(result?.price),
      );
    } else {
      commit();
    }
  }

  dropTreatment(
    event: CdkDragDrop<IService[]>,
    showDialog: boolean,
  ): void {
    const selectedItem = event.previousContainer.data[event.previousIndex];

    const commit = (price?: number) => {
      this.groups.update(groups => {
        if (!groups) {
          return groups;
        }

        const newGroups = new Map(groups);

        for (const [key, group] of newGroups) {
          const fromTreatments = group.treatments.some(t => t.id === selectedItem.id);
          const fromSelected = group.selectedTreatments.some(t => t.id === selectedItem.id);

          if (!fromTreatments && !fromSelected) {
            continue;
          }

          const source = fromTreatments ? [...group.treatments] : [...group.selectedTreatments];
          const target = fromTreatments ? [...group.selectedTreatments] : [...group.treatments];

          if (price !== undefined) {
            source[event.previousIndex] = { ...selectedItem, price };
          }

          if (event.previousContainer === event.container) {
            moveItemInArray(source, event.previousIndex, event.currentIndex);
          } else {
            transferArrayItem(source, target, event.previousIndex, event.currentIndex);
          }

          newGroups.set(key, {
            ...group,
            treatments: fromTreatments ? source : target,
            selectedTreatments: fromTreatments ? target : source,
          });

          break;
        }

        return newGroups;
      });
    };


    if (showDialog) {
      executeDialogNoWidth(this.dialog, PriceDialogComponent, { name: selectedItem.name, type: selectedItem.type },
        result => result && commit(result.price),
      );
    } else {
      commit();
    }
  }
}
