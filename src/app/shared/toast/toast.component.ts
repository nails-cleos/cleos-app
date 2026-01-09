import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { ToastData } from './toast.model';
import { toastAnimation } from '../../util/animation';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toast',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  animations: [toastAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  private readonly router: Router = inject(Router);

  constructor(
    @Inject('TOAST_DATA') public data: ToastData,
    @Inject('TOAST_DISMISS') public dismiss$: Subject<void>,
    @Inject('TOAST_ACTION') public action$: Subject<void>,
  ) {
  }

  navigateAction() {
    const url = URL.createObjectURL(this.data.action as Blob);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    window.open(url, '_blank');
  }

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
