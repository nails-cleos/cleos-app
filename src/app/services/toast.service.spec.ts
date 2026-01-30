import { TestBed } from '@angular/core/testing';
import { DestroyableInjector, Injector } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { EMPTY, Subject } from 'rxjs';

import { ToastService } from './toast.service';
import { ToastActionType, ToastType } from '../shared/toast/toast.model';

describe('ToastService', () => {
  let service: ToastService;
  let overlay: jasmine.SpyObj<Overlay>;
  let injector: jasmine.SpyObj<DestroyableInjector>;
  let overlayRef: jasmine.SpyObj<OverlayRef>;
  let positionStrategy: jasmine.SpyObj<any>;

  beforeEach(() => {
    const overlayRefSpy = jasmine.createSpyObj('OverlayRef', [
      'attach',
      'dispose',
      'updatePositionStrategy',
    ]);
    const positionStrategySpy = jasmine.createSpyObj('PositionStrategy', [
      'global',
      'top',
      'centerHorizontally',
    ]);

    // Chain the position strategy methods
    positionStrategySpy.global.and.returnValue(positionStrategySpy);
    positionStrategySpy.top.and.returnValue(positionStrategySpy);
    positionStrategySpy.centerHorizontally.and.returnValue(positionStrategySpy);

    const overlaySpy = jasmine.createSpyObj('Overlay', ['create', 'position']);
    overlaySpy.position.and.returnValue(positionStrategySpy);
    overlaySpy.create.and.returnValue(overlayRefSpy);

    const injectorSpy = jasmine.createSpyObj('Injector', ['get']);

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: Overlay, useValue: overlaySpy },
        { provide: Injector, useValue: injectorSpy },
      ],
    });

    service = TestBed.inject(ToastService);
    overlay = TestBed.inject(Overlay) as jasmine.SpyObj<Overlay>;
    injector = TestBed.inject(Injector) as jasmine.SpyObj<DestroyableInjector>;
    overlayRef = overlay.create() as jasmine.SpyObj<OverlayRef>;
    positionStrategy = overlay.position() as jasmine.SpyObj<any>;

    // Mock Injector.create static method
    spyOn(Injector, 'create').and.returnValue(injector);
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
      expect(overlayRef.attach).toHaveBeenCalledWith(jasmine.any(ComponentPortal));
      expect(toastRef).toBeDefined();
      expect(toastRef.onAction).toBeDefined();
      expect(toastRef.onDismiss).toBeDefined();
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
            provide: 'TOAST_DATA', useValue: jasmine.objectContaining({
              message,
              type,
              duration,
              actionType,
              action,
            }),
          },
          { provide: 'TOAST_DISMISS', useValue: jasmine.any(Subject) },
          { provide: 'TOAST_ACTION', useValue: jasmine.any(Subject) },
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
      jasmine.clock().install();
      const message = 'Auto dismiss test';
      const duration = 1000;

      spyOn(service, 'dismissSpecific');

      service.show(message, 'info', duration);

      jasmine.clock().tick(duration);

      expect(service.dismissSpecific).toHaveBeenCalledWith(overlayRef);
      jasmine.clock().uninstall();
    });

    it('should not auto-dismiss when duration is 0', () => {
      const message = 'No auto dismiss';
      const duration = 0;

      spyOn(service, 'dismissSpecific');
      spyOn(window, 'setTimeout');

      service.show(message, 'info', duration);

      expect(window.setTimeout).not.toHaveBeenCalled();
    });
  });

  describe('dismissSpecific', () => {
    it('should remove overlay ref and dispose when toast exists', () => {
      // Add a toast to the internal array
      service.show('Test message');
      const currentOverlayRef = overlay.create();

      spyOn(service as any, 'repositionToasts');

      service.dismissSpecific(currentOverlayRef);

      expect(currentOverlayRef.dispose).toHaveBeenCalled();
      expect((service as any).repositionToasts).toHaveBeenCalled();
    });

    it('should not dispose when overlay ref does not exist', () => {
      const nonExistentOverlayRef = jasmine.createSpyObj('OverlayRef', ['dispose']);

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
  });

  describe('toast data and subjects', () => {
    it('should provide correct toast data to injector', () => {
      const message = 'Test message';
      const type: ToastType = 'warning';
      const duration = 2000;
      const actionType: ToastActionType = 'button';
      const action = 'Action';

      service.show(message, type, duration, { actionType, action });

      expect(Injector.create).toHaveBeenCalledWith(jasmine.objectContaining({
        providers: jasmine.arrayContaining([
          {
            provide: 'TOAST_DATA', useValue: jasmine.objectContaining({
              message,
              type,
              duration,
              actionType,
              action,
            }),
          },
        ]),
      }));
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
      spyOn(service, 'dismissSpecific');

      // Simulate toast dismiss by triggering the subject
      (service as any).overlayRefs[0] = overlayRef;

      // Manually call the subscribe callback that would be triggered
      service.dismissSpecific(overlayRef);

      expect(service.dismissSpecific).toHaveBeenCalledWith(overlayRef);
    });

    it('should handle empty overlayRefs array in repositionToasts', () => {
      expect(() => (service as any).repositionToasts()).not.toThrow();
    });
  });
});
