/* eslint-disable camelcase */

import { MatStepper } from '@angular/material/stepper';

import { Step } from '../interfaces/step';
import {
  completeAndNext,
  enableStep,
  getBackIndex,
  getIndex,
  getStepCall,
  getStepCompleted,
  getStepEnabled,
  getStepName,
  getStepOptional,
  goNextStep,
} from './step';
import { FirebaseService } from '../services/firebase.service';

describe('Step Utils', () => {
  describe('goNextStep', () => {
    it('should call next step when it exists and is disabled', () => {
      const nextCall = jasmine.createSpy('nextCall');
      const next = new Step(1, 'next', nextCall as unknown as (goNext: boolean) => void, undefined, false, false);
      const current = new Step(0, 'current', jasmine.createSpy('currentCall') as unknown as (goNext: boolean) => void, next);

      goNextStep(current);

      expect(nextCall).toHaveBeenCalledOnceWith(true);
    });

    it('should not call next step when it is enabled', () => {
      const nextCall = jasmine.createSpy('nextCall');
      const next = new Step(1, 'next', nextCall as unknown as (goNext: boolean) => void, undefined, false, true);
      const current = new Step(0, 'current', jasmine.createSpy('currentCall') as unknown as (goNext: boolean) => void, next);

      goNextStep(current);

      expect(nextCall).not.toHaveBeenCalled();
    });
  });

  describe('selectors', () => {
    let firstCall: jasmine.Spy;
    let secondCall: jasmine.Spy;
    let steps: Step[];

    beforeEach(() => {
      firstCall = jasmine.createSpy('firstCall');
      secondCall = jasmine.createSpy('secondCall');

      steps = [
        new Step(0, 'first', firstCall as unknown as (goNext: boolean) => void, undefined, false, true),
        new Step(1, 'second', secondCall as unknown as (goNext: boolean) => void, undefined, true, false),
      ];
    });

    it('should return index for known step names', () => {
      expect(getIndex(steps, 'second')).toBe(1);
      expect(getIndex(steps, 'missing')).toBeUndefined();
    });

    it('should execute step call with default and explicit goNext values', () => {
      getStepCall(steps, 0);
      getStepCall(steps, 1, true);
      getStepCall(steps, 100, true);

      expect(firstCall).toHaveBeenCalledWith(false);
      expect(secondCall).toHaveBeenCalledWith(true);
      expect(firstCall).toHaveBeenCalledTimes(1);
      expect(secondCall).toHaveBeenCalledTimes(1);
    });

    it('should expose step metadata helpers', () => {
      steps[0].completed = true;

      expect(getStepName(steps, 0)).toBe('first');
      expect(getStepName(steps, 99)).toBe('');
      expect(getStepEnabled(steps, 1)).toBeFalse();
      expect(getStepEnabled(steps, 99)).toBeFalse();
      expect(getStepOptional(steps, 1)).toBeTrue();
      expect(getStepOptional(steps, 99)).toBeFalse();
      expect(getStepCompleted(steps, 0)).toBeTrue();
      expect(getStepCompleted(steps, 99)).toBeFalse();
    });
  });

  describe('navigation and enabling', () => {
    it('should find the nearest enabled previous step', () => {
      const steps = [
        new Step(0, 'first', jasmine.createSpy('first') as unknown as (goNext: boolean) => void, undefined, false, true),
        new Step(1, 'second', jasmine.createSpy('second') as unknown as (goNext: boolean) => void, undefined, false, false),
        new Step(2, 'third', jasmine.createSpy('third') as unknown as (goNext: boolean) => void, undefined, false, true),
      ];

      expect(getBackIndex(steps, 3)).toBe(2);
      expect(getBackIndex(steps, 2)).toBe(0);
      expect(getBackIndex(steps.map(s => ({ ...s, enable: false } as Step)), 2)).toBe(-1);
    });

    it('should enable and disable steps by name', () => {
      const steps = [
        new Step(0, 'first', jasmine.createSpy('first') as unknown as (goNext: boolean) => void),
        new Step(1, 'second', jasmine.createSpy('second') as unknown as (goNext: boolean) => void),
      ];

      const disabledIndex = enableStep(steps, 'second', false);
      const enabledIndex = enableStep(steps, 'second');

      expect(disabledIndex).toBe(1);
      expect(enabledIndex).toBe(1);
      expect(steps[1].enable).toBeTrue();
      expect(enableStep(steps, 'missing')).toBeUndefined();
    });
  });

  describe('completeAndNext', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should move to next step and complete current step when goNext is true', () => {
      const blockedNextCall = jasmine.createSpy('blockedNextCall');
      const current = new Step(1, 'current', jasmine.createSpy('currentCall') as unknown as (goNext: boolean) => void);
      const blockedNext = new Step(2, 'next', blockedNextCall as unknown as (goNext: boolean) => void, undefined, false, false);
      current.next = blockedNext;
      const steps = [
        new Step(0, 'first', jasmine.createSpy('first') as unknown as (goNext: boolean) => void),
        current,
        blockedNext,
      ];

      const stepper = {
        selectedIndex: 1,
        next: jasmine.createSpy('next'),
      } as unknown as MatStepper;

      completeAndNext(steps, stepper, true);
      jasmine.clock().tick(101);

      expect(stepper.next).toHaveBeenCalled();
      expect(steps[1].completed).toBeTrue();
      expect(blockedNextCall).toHaveBeenCalledOnceWith(true);
    });

    it('should complete selected step without advancing when goNext is false', () => {
      const enabledNextCall = jasmine.createSpy('enabledNextCall');
      const current = new Step(1, 'current', jasmine.createSpy('currentCall') as unknown as (goNext: boolean) => void);
      const enabledNext = new Step(2, 'next', enabledNextCall as unknown as (goNext: boolean) => void, undefined, false, true);
      current.next = enabledNext;
      const steps = [
        new Step(0, 'first', jasmine.createSpy('first') as unknown as (goNext: boolean) => void),
        current,
        enabledNext,
      ];

      const stepper = {
        selectedIndex: 2,
        next: jasmine.createSpy('next'),
      } as unknown as MatStepper;

      completeAndNext(steps, stepper, false);
      jasmine.clock().tick(101);

      expect(stepper.next).not.toHaveBeenCalled();
      expect(steps[1].completed).toBeTrue();
      expect(enabledNextCall).not.toHaveBeenCalled();
    });

    it('should log the screen view when firebase service is provided', () => {
      const current = new Step(1, 'current', jasmine.createSpy('currentCall') as unknown as (goNext: boolean) => void);
      const steps = [
        new Step(0, 'first', jasmine.createSpy('first') as unknown as (goNext: boolean) => void),
        current,
      ];
      const stepper = {
        selectedIndex: 1,
        next: jasmine.createSpy('next'),
      } as unknown as MatStepper;
      const firebaseService = jasmine.createSpyObj<FirebaseService>('FirebaseService', ['logEvent']);

      completeAndNext(steps, stepper, true, firebaseService);
      jasmine.clock().tick(101);

      expect(firebaseService.logEvent).toHaveBeenCalledWith('screen_view', jasmine.objectContaining({
        firebase_screen: 'Customer reservation. Step: current',
      }));
    });
  });
});
