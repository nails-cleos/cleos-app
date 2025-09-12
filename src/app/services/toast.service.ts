import { inject, Injectable, Injector } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { EMPTY, Subject } from 'rxjs';
import { ToastComponent } from '../shared/toast/toast.component';
import { ToastActionType, ToastData, ToastRef, ToastType } from '../shared/toast/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private overlay = inject(Overlay);
  private injector = inject(Injector);

  private overlayRefs: OverlayRef[] = [];
  private topSpace = 20;
  private spaceBetween = 110;

  /**
   * Show a toast with the specified message and type
   * @param message Message to display in the toast
   * @param type Type of toast (success, error, info, warning)
   * @param duration Duration in milliseconds before auto-dismissing, default 5000ms (5s)
   * @param actionType Type of action (button, link, none)
   * @param action Text for the action button
   * @returns ToastRef with onAction and onDismiss methods
   */
  show(
    message: string,
    type: ToastType = 'info',
    duration: number = 5000,
    actionType: ToastActionType = 'none',
    action?: string,
  ): ToastRef {
    const topOffset = this.topSpace + (this.overlayRefs.length * this.spaceBetween);
    const positionStrategy = this.overlay.position().global().top(`${topOffset}px`).centerHorizontally();
    const toastDismissed = new Subject<void>();
    const toastAction = new Subject<void>();

    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
    });

    // Check for duplicate
    const isDuplicate = this.overlayRefs.some(ref => {
      const data = (ref as any).toastData as ToastData;
      return data?.message === message && data?.type === type;
    });

    if (isDuplicate) {
      return {
        onAction: () => EMPTY,
        onDismiss: () => EMPTY,
      };
    }

    const toastData = { message, type, duration, action, actionType } as ToastData;
    (overlayRef as any).toastData = toastData;
    this.overlayRefs.push(overlayRef);

    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: 'TOAST_DATA', useValue: toastData },
        { provide: 'TOAST_DISMISS', useValue: toastDismissed },
        { provide: 'TOAST_ACTION', useValue: toastAction },
      ],
    });

    const toastPortal = new ComponentPortal(ToastComponent, null, injector);

    toastDismissed.subscribe(() => this.dismissSpecific(overlayRef));

    overlayRef.attach(toastPortal);

    if (duration > 0) {
      setTimeout(() => {
        this.dismissSpecific(overlayRef);
      }, duration);
    }

    return {
      onAction: () => toastAction.asObservable(),
      onDismiss: () => toastDismissed.asObservable(),
    };
  }

  /**
   * Show a success toast
   */
  success(message: string, duration = 5000, actionType: ToastActionType = 'none', action?: string) {
    return this.show(message, 'success', duration, actionType, action);
  }

  /**
   * Show an error toast
   */
  error(message: string, duration = 5000, actionType: ToastActionType = 'none', action?: string) {
    return this.show(message, 'error', duration, actionType, action);
  }

  /**
   * Show a warning toast
   */
  warning(message: string, duration = 5000, actionType: ToastActionType = 'none', action?: string) {
    return this.show(message, 'warning', duration, actionType, action);
  }

  /**
   * Show an info toast
   */
  info(message: string, duration = 5000, actionType: ToastActionType = 'none', action?: string) {
    return this.show(message, 'info', duration, actionType, action);
  }

  /**
   * Dismiss a specific toast
   */
  dismissSpecific(overlayRef: OverlayRef) {
    const index = this.overlayRefs.indexOf(overlayRef);
    if (index > -1) {
      this.overlayRefs.splice(index, 1);
      overlayRef.dispose();
      this.repositionToasts();
    }
  }

  /**
   * Reposition remaining toasts after one is dismissed
   */
  private repositionToasts() {
    this.overlayRefs.forEach((overlayRef, index) => {
      const topOffset = this.topSpace + (index * this.spaceBetween);
      overlayRef.updatePositionStrategy(
        this.overlay.position().global().top(`${topOffset}px`).centerHorizontally(),
      );
    });
  }
}
