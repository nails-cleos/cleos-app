/* eslint-disable camelcase */
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { MatStepper } from '@angular/material/stepper';

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
  Step,
} from './step';

describe('Step Utils', () => {
  describe('goNextStep', () => {
    it('should call next step when it exists and is disabled', () => {
      const nextCall = vi.fn().mockName('nextCall');
      const next = new Step(
        1,
        'next',
        nextCall as unknown as (goNext: boolean) => void,
        undefined,
        false,
        false,
      );
      const current = new Step(
        0,
        'current',
        vi.fn().mockName('currentCall') as unknown as (goNext: boolean) => void,
        next,
      );

      goNextStep(current);

      expect(nextCall).toHaveBeenCalledTimes(1);

      expect(nextCall).toHaveBeenCalledWith(true);
    });

    it('should not call next step when it is enabled', () => {
      const nextCall = vi.fn().mockName('nextCall');
      const next = new Step(
        1,
        'next',
        nextCall as unknown as (goNext: boolean) => void,
        undefined,
        false,
        true,
      );
      const current = new Step(
        0,
        'current',
        vi.fn().mockName('currentCall') as unknown as (goNext: boolean) => void,
        next,
      );

      goNextStep(current);

      expect(nextCall).not.toHaveBeenCalled();
    });
  });

  describe('selectors', () => {
    let firstCall: Mock;
    let secondCall: Mock;
    let steps: Step[];

    beforeEach(() => {
      firstCall = vi.fn().mockName('firstCall');
      secondCall = vi.fn().mockName('secondCall');

      steps = [
        new Step(
          0,
          'first',
          firstCall as unknown as (goNext: boolean) => void,
          undefined,
          false,
          true,
        ),
        new Step(
          1,
          'second',
          secondCall as unknown as (goNext: boolean) => void,
          undefined,
          true,
          false,
        ),
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
      expect(getStepEnabled(steps, 1)).toBe(false);
      expect(getStepEnabled(steps, 99)).toBe(false);
      expect(getStepOptional(steps, 1)).toBe(true);
      expect(getStepOptional(steps, 99)).toBe(false);
      expect(getStepCompleted(steps, 0)).toBe(true);
      expect(getStepCompleted(steps, 99)).toBe(false);
    });
  });

  describe('navigation and enabling', () => {
    it('should find the nearest enabled previous step', () => {
      const steps = [
        new Step(
          0,
          'first',
          vi.fn().mockName('first') as unknown as (goNext: boolean) => void,
          undefined,
          false,
          true,
        ),
        new Step(
          1,
          'second',
          vi.fn().mockName('second') as unknown as (goNext: boolean) => void,
          undefined,
          false,
          false,
        ),
        new Step(
          2,
          'third',
          vi.fn().mockName('third') as unknown as (goNext: boolean) => void,
          undefined,
          false,
          true,
        ),
      ];

      expect(getBackIndex(steps, 3)).toBe(2);
      expect(getBackIndex(steps, 2)).toBe(0);
      expect(
        getBackIndex(
          steps.map((s) => ({ ...s, enable: false }) as Step),
          2,
        ),
      ).toBe(-1);
    });

    it('should enable and disable steps by name', () => {
      const steps = [
        new Step(
          0,
          'first',
          vi.fn().mockName('first') as unknown as (goNext: boolean) => void,
        ),
        new Step(
          1,
          'second',
          vi.fn().mockName('second') as unknown as (goNext: boolean) => void,
        ),
      ];

      const disabledIndex = enableStep(steps, 'second', false);
      const enabledIndex = enableStep(steps, 'second');

      expect(disabledIndex).toBe(1);
      expect(enabledIndex).toBe(1);
      expect(steps[1].enable).toBe(true);
      expect(enableStep(steps, 'missing')).toBeUndefined();
    });
  });

  describe('completeAndNext', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should move to next step and complete current step when goNext is true', () => {
      const blockedNextCall = vi.fn().mockName('blockedNextCall');
      const current = new Step(
        1,
        'current',
        vi.fn().mockName('currentCall') as unknown as (goNext: boolean) => void,
      );
      const blockedNext = new Step(
        2,
        'next',
        blockedNextCall as unknown as (goNext: boolean) => void,
        undefined,
        false,
        false,
      );
      current.next = blockedNext;
      const steps = [
        new Step(
          0,
          'first',
          vi.fn().mockName('first') as unknown as (goNext: boolean) => void,
        ),
        current,
        blockedNext,
      ];

      const stepper = {
        selectedIndex: 1,
        next: vi.fn().mockName('next'),
      } as unknown as MatStepper;

      completeAndNext(steps, stepper, true);
      vi.advanceTimersByTime(101);

      expect(stepper.next).toHaveBeenCalled();
      expect(steps[1].completed).toBe(true);
      expect(blockedNextCall).toHaveBeenCalledTimes(1);
      expect(blockedNextCall).toHaveBeenCalledWith(true);
    });

    it('should complete selected step without advancing when goNext is false', () => {
      const enabledNextCall = vi.fn().mockName('enabledNextCall');
      const current = new Step(
        1,
        'current',
        vi.fn().mockName('currentCall') as unknown as (goNext: boolean) => void,
      );
      const enabledNext = new Step(
        2,
        'next',
        enabledNextCall as unknown as (goNext: boolean) => void,
        undefined,
        false,
        true,
      );
      current.next = enabledNext;
      const steps = [
        new Step(
          0,
          'first',
          vi.fn().mockName('first') as unknown as (goNext: boolean) => void,
        ),
        current,
        enabledNext,
      ];

      const stepper = {
        selectedIndex: 2,
        next: vi.fn().mockName('next'),
      } as unknown as MatStepper;

      completeAndNext(steps, stepper, false);
      vi.advanceTimersByTime(101);

      expect(stepper.next).not.toHaveBeenCalled();
      expect(steps[1].completed).toBe(true);
      expect(enabledNextCall).not.toHaveBeenCalled();
    });

    it('should log the screen view when firebase service is provided', () => {
      const current = new Step(
        1,
        'current',
        vi.fn().mockName('currentCall') as unknown as (goNext: boolean) => void,
      );
      const steps = [
        new Step(
          0,
          'first',
          vi.fn().mockName('first') as unknown as (goNext: boolean) => void,
        ),
        current,
      ];
      const stepper = {
        selectedIndex: 1,
        next: vi.fn().mockName('next'),
      } as unknown as MatStepper;
      const firebaseService = {
        logEvent: vi.fn().mockName('FirebaseService.logEvent'),
      };

      completeAndNext(steps, stepper, true, firebaseService);
      vi.advanceTimersByTime(101);

      expect(firebaseService.logEvent).toHaveBeenCalledWith(
        'screen_view',
        expect.objectContaining({
          firebase_screen: 'Customer reservation. Step: current',
        }),
      );
    });
  });
});
