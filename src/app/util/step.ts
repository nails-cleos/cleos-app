import { MatStepper } from '@angular/material/stepper';
import { FirebaseService } from '../services/firebase.service';

export interface IStep {
  order: number;
  name: string;
  enable: boolean;
  optional: boolean;
  completed: boolean;
  call: (goNext: boolean) => void;
  next?: IStep;
}

export class Step implements IStep {
  order: number;
  name: string;
  enable: boolean;
  optional: boolean;
  completed: boolean;
  call: (goNext: boolean) => void;
  next?: IStep;

  constructor(
    order: number,
    name: string,
    call: (goNext: boolean) => void,
    next?: IStep,
    optional: boolean = false,
    enable: boolean = true,
  ) {
    this.order = order;
    this.name = name;
    this.enable = enable;
    this.optional = optional;
    this.completed = false;
    this.call = call;
    this.next = next;
  }
}


export const completeAndNext = (
  steps: IStep[],
  myStepper: MatStepper,
  goNext: boolean,
  firebaseService?: FirebaseService,
): void => {
  setTimeout(() => {
    const step = getStep(steps, myStepper.selectedIndex - (goNext ? 0 : 1));
    if (step) {
      if (firebaseService) {
        firebaseService.logEvent('screen_view', {
          // eslint-disable-next-line camelcase
          firebase_screen: `Customer reservation. Step: ${ step?.name }`,
          // eslint-disable-next-line camelcase
          firebase_screen_class: 'MeReservationComponent',
        });
      }
      if (goNext) {
        myStepper.next();
      }
      step.completed = true;
      steps[step.order] = step;
      goNextStep(step);
    }
  }, 100);
};

export const goNextStep = (step: IStep): void => {
  const nextStep = step.next;
  if (nextStep && !nextStep.enable) {
    nextStep.call(true);
  }
  return;
};

export const getIndex = (steps: IStep[], name: string): number | undefined => steps.find(s => s.name === name)?.order;

export const getStepCall = (steps: IStep[], index: number, goNext: boolean = false): void => getStep(steps, index)
  ?.call(goNext);

export const getStepName = (steps: IStep[], index: number): string => {
  const step = getStep(steps, index);
  return step ? step.name : '';
};

export const getStepEnabled = (steps: IStep[], index: number): boolean => {
  const step = getStep(steps, index);
  return !!step?.enable;
};

export const getStepOptional = (steps: IStep[], index: number): boolean => {
  const step = getStep(steps, index);
  return !!step?.optional;
};

export const getStepCompleted = (steps: IStep[], index: number): boolean => {
  const step = getStep(steps, index);
  return !!step?.completed;
};

export const getBackIndex = (steps: IStep[], current: number): number => {
  let index = -1;
  for (const step of steps.slice(0, current).reverse()) {
    if (step.enable) {
      index = step.order;
      break;
    }
  }
  return index;
};

export const enableStep = (steps: IStep[], name: string, enable: boolean = true): number | undefined => {
  let index;
  const step = steps.find(it => it.name === name);
  if (step) {
    step.enable = enable;
    steps[step.order] = step;
    index = step.order;
  }
  return index;
};

const getStep = (steps: IStep[], index: number): IStep | undefined => steps.find(s => s.order === index);
