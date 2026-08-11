import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  InjectionToken,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { ToastData } from './toast.model';
import { TranslatePipe } from '@ngx-translate/core';

export const TOAST_DATA = new InjectionToken<ToastData>('TOAST_DATA');
export const TOAST_DISMISS = new InjectionToken<Subject<void>>('TOAST_DISMISS');
export const TOAST_ACTION = new InjectionToken<Subject<void>>('TOAST_ACTION');

@Component({
  selector: 'app-toast',
  imports: [CommonModule, MatIconModule, MatButtonModule, TranslatePipe],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  public data = inject<ToastData>(TOAST_DATA);
  public dismiss$ = inject<Subject<void>>(TOAST_DISMISS);
  public action$ = inject<Subject<void>>(TOAST_ACTION);

  getIcon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }

  onAction() {
    this.action$.next();
    this.dismiss$.next();
    this.dismiss$.complete();
  }

  onDismiss() {
    this.dismiss$.next();
    this.dismiss$.complete();
  }
}
