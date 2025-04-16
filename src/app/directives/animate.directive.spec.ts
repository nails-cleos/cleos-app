import { AnimateDirective } from './animate.directive';
import { ElementRef } from '@angular/core';
import { AnimationBuilder } from '@angular/animations';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';

const mockRouter = {
  getCurrentNavigation: () => ({ extras: { state: { key: 'value' } } }),
};

TestBed.configureTestingModule({
  providers: [
    { provide: Router, useValue: mockRouter },
  ],
});

describe('AnimateDirective', () => {
  let directive: AnimateDirective;
  let elementRef: ElementRef;
  let animationBuilder: AnimationBuilder;

  beforeEach(() => {
    elementRef = new ElementRef(document.createElement('div'));
    animationBuilder = jasmine.createSpyObj('AnimationBuilder', ['build']);
    directive = new AnimateDirective(elementRef, animationBuilder);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should initialize the player on ngOnInit', () => {
    (directive as any).initialize = jasmine.createSpy().and.callThrough();

    directive.ngOnInit();
    expect((directive as any).initialize).toHaveBeenCalled();
    expect((directive as any).player).toHaveBeenCalled();
  });
});
