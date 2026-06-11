import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { AuthUserService } from '../services/auth-user.service';
import { ICommon } from '../interfaces/common';
import { IUnavailable } from './unavailable';
import { UnavailableStore } from '../store/unavailable.store';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { UnavailableComponent } from './unavailable.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { executeDialogNoWidth } from '../util/helper';
import { DialogComponent } from '../shared/dialog/generic/dialog.component';

@Component({
  selector: 'app-unavailable-details-page',
  template: `
    @if (unavailable(); as unavailable) {
      <app-unavailable
        [unavailable]="unavailable"
        [config]="config"
        (submitData)="submit($event)"
        (deleteData)="delete()"
      />
    } @else {
      <app-skeleton [buttons]="3"/>
    }
  `,
  imports: [UnavailableComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnavailableDetailsPageComponent {
  id = input.required<string>();

  private readonly unavailableStore = inject(UnavailableStore);
  private readonly authUserService = inject(AuthUserService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly dialog: MatDialog = inject(MatDialog);

  config: ICommon = {
    title: 'UNAVAILABLE.DETAIL',
    button: { icon: 'published_with_changes', label: 'COMMON.BUTTON.UPDATE', showDelete: true },
  };

  unavailable = computed(() => this.unavailableStore.selected());

  constructor() {
    effect(() => {
      this.unavailableStore.clean();
      this.unavailableStore.loadById(this.id());
    });
  }

  submit(unavailable: IUnavailable) {
    this.unavailableStore.update({
      id: this.id(),
      unavailable,
      path: this.authUserService.authUser()?.isRoomAdmin ? 'dashboard/events' : 'unavailable',
    });
  }

  delete() {
    const unavailable = this.unavailable();
    if (!unavailable) {
      return;
    }
    const title = this.translate.instant('UNAVAILABLE.DELETED.TITLE');
    const date = unavailable.start;
    const content = this.translate.instant('UNAVAILABLE.DELETED.CONTENT', { date });

    executeDialogNoWidth(this.dialog, DialogComponent, { title, content, value: unavailable, variant: 'warning' },
      result => {
        if (result) {
          this.unavailableStore.delete({
            id: result.id,
            timestamp: result.timestamp,
            timeZone: result.timeZone,
          });
        }
      });
  }
}
