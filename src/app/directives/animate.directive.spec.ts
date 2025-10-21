import { AnimateDirective } from './animate.directive';
import { ElementRef } from '@angular/core';
import { AnimationBuilder, AnimationPlayer, style } from '@angular/animations';

describe('AnimateDirective', () => {
  let directive: AnimateDirective;
  let mockElementRef: ElementRef;
  let animationBuilderSpy: jasmine.SpyObj<AnimationBuilder>;
  let animationPlayerSpy: jasmine.SpyObj<AnimationPlayer>;

  beforeEach(() => {
    const mockElement = document.createElement('div');
    mockElementRef = new ElementRef(mockElement);

    const mockAnimationFactory = jasmine.createSpyObj('AnimationFactory', ['create']);
    animationPlayerSpy = jasmine.createSpyObj('AnimationPlayer', ['init', 'play', 'destroy']);
    animationBuilderSpy = jasmine.createSpyObj('AnimationBuilder', ['build']);

    mockAnimationFactory.create.and.returnValue(animationPlayerSpy);
    animationBuilderSpy.build.and.returnValue(mockAnimationFactory);

    directive = new AnimateDirective(mockElementRef, animationBuilderSpy);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(directive.stopAnimation).toBeFalse();
    expect(directive.threshold).toBe(0.1);
  });

  it('should initialize player on ngOnInit when animation is provided', () => {
    directive.animateInAnimation = style({ opacity: 1 });
    
    directive.ngOnInit();
    
    expect(animationBuilderSpy.build).toHaveBeenCalled();
    expect(animationPlayerSpy.init).toHaveBeenCalled();
  });

  it('should not initialize player on ngOnInit when no animation is provided', () => {
    directive.ngOnInit();
    
    expect(animationBuilderSpy.build).not.toHaveBeenCalled();
  });

  it('should destroy player on ngOnDestroy', () => {
    directive.animateInAnimation = style({ opacity: 1 });
    directive.ngOnInit();
    
    directive.ngOnDestroy();
    
    expect(animationPlayerSpy.destroy).toHaveBeenCalled();
  });

  it('should setup IntersectionObserver on ngAfterViewInit', () => {
    spyOn(window, 'IntersectionObserver').and.returnValue({
      observe: jasmine.createSpy('observe'),
      disconnect: jasmine.createSpy('disconnect'),
    } as any);

    directive.ngAfterViewInit();

    expect(window.IntersectionObserver).toHaveBeenCalledWith(
      jasmine.any(Function),
      { threshold: 0.1, rootMargin: '0px' },
    );
  });
});
