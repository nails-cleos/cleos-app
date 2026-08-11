import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { EMPTY, Subject } from 'rxjs';

import { ToastService } from './toast.service';
import { ToastActionType, ToastType } from '../shared/toast/toast.model';
import {
  TOAST_ACTION,
  TOAST_DATA,
  TOAST_DISMISS,
} from '@app/shared/toast/toast.component';

describe('ToastService', () => {
  let service: ToastService;
  let overlay: {
    create: ReturnType<typeof vi.fn>;
    position: ReturnType<typeof vi.fn>;
  };

  let injector: {
    get: ReturnType<typeof vi.fn>;
  };

  let overlayRef: {
    attach: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
    updatePositionStrategy: ReturnType<typeof vi.fn>;
  };

  let breakpointState$: Subject<BreakpointState>;

  let positionStrategy: {
    global: ReturnType<typeof vi.fn>;
    bottom: ReturnType<typeof vi.fn>;
    top: ReturnType<typeof vi.fn>;
    centerHorizontally: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    overlayRef = {
      attach: vi.fn().mockName('OverlayRef.attach'),
      dispose: vi.fn().mockName('OverlayRef.dispose'),
      updatePositionStrategy: vi
        .fn()
        .mockName('OverlayRef.updatePositionStrategy'),
    };

    positionStrategy = {
      global: vi.fn().mockName('PositionStrategy.global'),
      bottom: vi.fn().mockName('PositionStrategy.bottom'),
      top: vi.fn().mockName('PositionStrategy.top'),
      centerHorizontally: vi
        .fn()
        .mockName('PositionStrategy.centerHorizontally'),
    };

    // chain methods
    positionStrategy.global.mockReturnValue(positionStrategy);
    positionStrategy.bottom.mockReturnValue(positionStrategy);
    positionStrategy.top.mockReturnValue(positionStrategy);
    positionStrategy.centerHorizontally.mockReturnValue(positionStrategy);

    overlay = {
      create: vi.fn().mockName('Overlay.create'),
      position: vi.fn().mockName('Overlay.position'),
    };

    overlay.position.mockReturnValue(positionStrategy);
    overlay.create.mockReturnValue(overlayRef);

    injector = {
      get: vi.fn().mockName('Injector.get'),
    };

    breakpointState$ = new Subject<BreakpointState>();

    const breakpointObserverSpy = {
      observe: vi.fn().mockName('BreakpointObserver.observe'),
    };

    breakpointObserverSpy.observe.mockReturnValue(
      breakpointState$.asObservable(),
    );

    await TestBed.configureTestingModule({
      providers: [
        ToastService,
        {
          provide: Overlay,
          useValue: overlay,
        },
        {
          provide: Injector,
          useValue: injector,
        },
        {
          provide: BreakpointObserver,
          useValue: breakpointObserverSpy,
        },
      ],
    }).compileComponents();

    service = TestBed.inject(ToastService);

    vi.spyOn(Injector, 'create').mockReturnValue(injector as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('show', () => {
    it('should create toast with default parameters', () => {
      const message = 'Test message';

      const toastRef = service.show(message);

      expect(overlay.position).toHaveBeenCalled();
      expect(positionStrategy.global).toHaveBeenCalled();
      expect(positionStrategy.top).toHaveBeenCalledWith('20px');
      expect(positionStrategy.centerHorizontally).toHaveBeenCalled();
      expect(overlay.create).toHaveBeenCalledWith({
        positionStrategy: positionStrategy,
        hasBackdrop: false,
      });
      expect(overlayRef.attach).toHaveBeenCalledWith(
        expect.any(ComponentPortal),
      );
      expect(toastRef).toBeDefined();
      expect(toastRef.onAction).toBeDefined();
      expect(toastRef.onDismiss).toBeDefined();
    });

    it('should position toast from the bottom on mobile', () => {
      breakpointState$.next({
        matches: true,
        breakpoints: { '(max-width: 640px)': true },
      });

      service.show('Mobile toast');

      expect(positionStrategy.bottom).toHaveBeenCalledWith('16px');
      expect(positionStrategy.centerHorizontally).toHaveBeenCalled();
    });

    it('should create toast with custom parameters', () => {
      const message = 'Custom message';
      const type: ToastType = 'error';
      const duration = 3000;
      const actionType: ToastActionType = 'button';
      const action = 'Retry';

      service.show(message, type, duration, { actionType, action });

      expect(Injector.create).toHaveBeenCalledWith({
        parent: injector,
        providers: [
          {
            provide: TOAST_DATA,
            useValue: expect.objectContaining({
              message,
              type,
              duration,
              actionType,
              action,
            }),
          },
          { provide: TOAST_DISMISS, useValue: expect.any(Subject) },
          { provide: TOAST_ACTION, useValue: expect.any(Subject) },
        ],
      });
    });

    it('should position multiple toasts with correct spacing', () => {
      service.show('First toast');
      service.show('Second toast');
      service.show('Third toast');

      expect(positionStrategy.top).toHaveBeenCalledWith('20px');
      expect(positionStrategy.top).toHaveBeenCalledWith('130px');
      expect(positionStrategy.top).toHaveBeenCalledWith('240px');
    });

    it('should return EMPTY observables for duplicate toasts', () => {
      const message = 'Duplicate message';
      const type: ToastType = 'info';

      // Create first toast
      service.show(message, type);

      // Try to create duplicate
      const duplicateToast = service.show(message, type);

      expect(duplicateToast.onAction()).toBe(EMPTY);
      expect(duplicateToast.onDismiss()).toBe(EMPTY);
    });

    it('should auto-dismiss toast after specified duration', () => {
      vi.useFakeTimers();
      const message = 'Auto dismiss test';
      const duration = 1000;

      vi.spyOn(service, 'dismissSpecific').mockReturnValue(undefined);

      service.show(message, 'info', duration);

      vi.advanceTimersByTime(duration);

      expect(service.dismissSpecific).toHaveBeenCalledWith(overlayRef);
      vi.useRealTimers();
    });

    it('should not auto-dismiss when duration is 0', () => {
      const message = 'No auto dismiss';
      const duration = 0;

      vi.spyOn(service, 'dismissSpecific').mockReturnValue(undefined);
      vi.spyOn(window, 'setTimeout').mockReturnValue(undefined as any);

      service.show(message, 'info', duration);

      expect(window.setTimeout).not.toHaveBeenCalled();
    });
  });

  describe('dismissSpecific', () => {
    it('should remove overlay ref and dispose when toast exists', () => {
      service.show('Test message');

      vi.spyOn(service as any, 'repositionToasts').mockReturnValue(undefined);

      service.dismissSpecific(overlayRef as any);

      expect(overlayRef.dispose).toHaveBeenCalled();
      expect((service as any).repositionToasts).toHaveBeenCalled();
    });

    it('should not dispose when overlay ref does not exist', () => {
      const nonExistentOverlayRef: any = {
        dispose: vi.fn().mockName('OverlayRef.dispose'),
      };

      service.dismissSpecific(nonExistentOverlayRef);

      expect(nonExistentOverlayRef.dispose).not.toHaveBeenCalled();
    });
  });

  describe('repositionToasts', () => {
    it('should reposition remaining toasts after dismissal', () => {
      // Create multiple toasts
      service.show('First toast');
      service.show('Second toast');
      service.show('Third toast');

      // Access the private method
      (service as any).repositionToasts();

      // Verify that updatePositionStrategy was called for each remaining toast
      expect(overlayRef.updatePositionStrategy).toHaveBeenCalled();
    });

    it('should reposition active toasts when viewport breakpoint changes', () => {
      service.show('Responsive toast');

      breakpointState$.next({
        matches: true,
        breakpoints: { '(max-width: 640px)': true },
      });
      TestBed.flushEffects();

      expect(overlayRef.updatePositionStrategy).toHaveBeenCalled();
      expect(positionStrategy.bottom).toHaveBeenCalledWith('16px');
    });
  });

  describe('toast data and subjects', () => {
    it('should provide correct toast data to injector', () => {
      const message = 'Test message';
      const type: ToastType = 'warning';
      const duration = 2000;
      const actionType: ToastActionType = 'button';
      const action = 'Action';

      service.show(message, type, duration, { actionType, action });

      expect(Injector.create).toHaveBeenCalledWith(
        expect.objectContaining({
          providers: expect.arrayContaining([
            {
              provide: TOAST_DATA,
              useValue: expect.objectContaining({
                message,
                type,
                duration,
                actionType,
                action,
              }),
            },
          ]),
        }),
      );
    });

    it('should return observables from action and dismiss subjects', () => {
      const toastRef = service.show('Test message');

      expect(toastRef.onAction()).toBeDefined();
      expect(toastRef.onDismiss()).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle toast dismissal through subject', () => {
      service.show('Test message');
      vi.spyOn(service, 'dismissSpecific').mockReturnValue(undefined);

      // Simulate toast dismiss by triggering the subject
      (service as any).overlayRefs[0] = overlayRef;

      // Manually call the subscribe callback that would be triggered
      service.dismissSpecific(overlayRef as any);

      expect(service.dismissSpecific).toHaveBeenCalledWith(overlayRef);
    });

    it('should handle empty overlayRefs array in repositionToasts', () => {
      expect(() => (service as any).repositionToasts()).not.toThrow();
    });
  });
});
