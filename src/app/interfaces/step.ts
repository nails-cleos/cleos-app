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

  constructor(order: number, name: string, call: (goNext: boolean) => void, next?: IStep, optional: boolean = false,
    enable: boolean = true) {
    this.order = order;
    this.name = name;
    this.enable = enable;
    this.optional = optional;
    this.completed = false;
    this.call = call;
    this.next = next;
  }
}
