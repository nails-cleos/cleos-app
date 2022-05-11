export interface IStep {
  order: number;
  name: string;
  enable: boolean;
  completed: boolean;
  call: () => void;
  next?: IStep;
}

export class Step implements IStep {
  order: number;
  name: string;
  enable: boolean;
  completed: boolean;
  call: () => void;
  next?: IStep;

  constructor(order: number, name: string, call: () => void, next?: IStep, enable: boolean = true) {
    this.order = order;
    this.name = name;
    this.enable = enable;
    this.completed = false;
    this.call = call;
    this.next = next;
  }
}
