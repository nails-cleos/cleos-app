import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';
import { Injector } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';

describe('ToastService', () => {
  let service: ToastService;
  let overlay: jasmine.SpyObj<Overlay>;
  let injector: jasmine.SpyObj<Injector>;

  beforeEach(() => {
    overlay = jasmine.createSpyObj('Overlay', ['create', 'position']);
    injector = jasmine.createSpyObj('Injector', ['get']);
    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: Overlay, useValue: overlay },
        { provide: Injector, useValue: injector },
      ],
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
