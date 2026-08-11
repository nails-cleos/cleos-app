import {
  computed,
  effect,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ComponentPortal } from '@angular/cdk/portal';
import { EMPTY, Subject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  TOAST_ACTION,
  TOAST_DATA,
  TOAST_DISMISS,
  ToastComponent,
} from '../shared/toast/toast.component';
import {
  ToastData,
  ToastOptions,
  ToastRef,
  ToastType,
} from '../shared/toast/toast.model';

const MOBILE_BREAKPOINT = '(max-width: 640px)';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private overlay = inject(Overlay);
  private environmentInjector = inject(EnvironmentInjector);
  private injector = inject(Injector);
  private breakpointObserver = inject(BreakpointObserver);

  private overlayRefs: OverlayRef[] = [];
  private toastDataByOverlayRef = new WeakMap<OverlayRef, ToastData>();
  private breakpointState = toSignal(
    this.breakpointObserver.observe(MOBILE_BREAKPOINT),
    {
      initialValue: {
        matches: false,
        breakpoints: { [MOBILE_BREAKPOINT]: false },
      },
    },
  );
  private isMobileViewport = computed(() => this.breakpointState().matches);
  private desktopTopSpace = 20;
  private mobileBottomSpace = 16;
  private desktopSpaceBetween = 110;
  private mobileSpaceBetween = 96;

  constructor() {
    let previousViewport = this.isMobileViewport();

    effect(
      () => {
        const currentViewport = this.isMobileViewport();
        if (currentViewport === previousViewport) {
          return;
        }

        previousViewport = currentViewport;
        if (this.overlayRefs.length > 0) {
          this.repositionToasts();
        }
      },
      { injector: this.environmentInjector },
    );
  }

  /**
   * Show a toast with the specified message and type
   * @param message Message to display in the toast
   * @param type Type of toast (success, error, info, warning)
   * @param duration Duration in milliseconds before auto-dismissing, default 5000ms (5s)
   * @param options Additional options for the toast
   * @returns ToastRef with onAction and onDismiss methods
   */
  show(
    message: string,
    type: ToastType = 'info',
    duration: number = 5000,
    options: ToastOptions = { actionType: 'none' },
  ): ToastRef {
    const positionStrategy = this.createPositionStrategy(
      this.overlayRefs.length,
    );
    const toastDismissed = new Subject<void>();
    const toastAction = new Subject<void>();

    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
    });

    // Check for duplicate
    const isDuplicate = this.overlayRefs.some((ref) => {
      const data = this.toastDataByOverlayRef.get(ref);
      return data?.message === message && data?.type === type;
    });

    if (isDuplicate) {
      return {
        onAction: () => EMPTY,
        onDismiss: () => EMPTY,
      };
    }

    const toastData = {
      message,
      type,
      duration,
      action: options.action,
      actionType: options.actionType,
    } as ToastData;
    this.toastDataByOverlayRef.set(overlayRef, toastData);
    this.overlayRefs.push(overlayRef);

    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: TOAST_DATA, useValue: toastData },
        { provide: TOAST_DISMISS, useValue: toastDismissed },
        { provide: TOAST_ACTION, useValue: toastAction },
      ],
    });

    const toastPortal = new ComponentPortal(ToastComponent, null, injector);

    toastDismissed.subscribe(() => this.dismissSpecific(overlayRef));

    overlayRef.attach(toastPortal);

    if (duration > 0) {
      setTimeout(() => {
        toastDismissed.next();
      }, duration);
    }

    return {
      onAction: () => toastAction.asObservable(),
      onDismiss: () => toastDismissed.asObservable(),
    };
  }

  /**
   * Dismiss a specific toast
   */
  dismissSpecific(overlayRef: OverlayRef) {
    const index = this.overlayRefs.indexOf(overlayRef);
    if (index > -1) {
      this.overlayRefs.splice(index, 1);
      this.toastDataByOverlayRef.delete(overlayRef);
      overlayRef.dispose();
      this.repositionToasts();
    }
  }

  /**
   * Reposition remaining toasts after one is dismissed
   */
  private repositionToasts() {
    this.overlayRefs.forEach((overlayRef, index) => {
      overlayRef.updatePositionStrategy(this.createPositionStrategy(index));
    });
  }

  private createPositionStrategy(index: number) {
    const strategy = this.overlay.position().global();

    if (this.isMobileViewport()) {
      const bottomOffset =
        this.mobileBottomSpace + index * this.mobileSpaceBetween;
      return strategy.bottom(`${bottomOffset}px`).centerHorizontally();
    }

    const topOffset = this.desktopTopSpace + index * this.desktopSpaceBetween;
    return strategy.top(`${topOffset}px`).centerHorizontally();
  }
}
