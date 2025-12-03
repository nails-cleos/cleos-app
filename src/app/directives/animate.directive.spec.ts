import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AnimateDirective } from './animate.directive';
import { AnimationBuilder, AnimationPlayer, style } from '@angular/animations';

@Component({
  template: `
    <div
      id="host"
      appAnimate
      [animateInAnimation]="animation"
      [stopAnimation]="stop"
      [threshold]="threshold"></div>`,
  imports: [AnimateDirective],
})
class HostComponent {
  animation: any = null;
  stop = false;
  threshold = 0.1;
}

describe('AnimateDirective (host-component tests)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let hostComp: HostComponent;
  let directive: AnimateDirective;
  let animationBuilderSpy: jasmine.SpyObj<AnimationBuilder>;
  let animationPlayerSpy: jasmine.SpyObj<AnimationPlayer>;
  let animationFactorySpy: jasmine.SpyObj<{ create: (el: any) => AnimationPlayer }>;
  let mockObserver: any;

  beforeEach(() => {
    // Mock AnimationBuilder/Player
    animationPlayerSpy = jasmine.createSpyObj('AnimationPlayer', ['init', 'play', 'destroy']);
    animationBuilderSpy = jasmine.createSpyObj('AnimationBuilder', ['build']);
    animationFactorySpy = jasmine.createSpyObj('AnimationFactory', ['create']);

    animationFactorySpy.create.and.returnValue(animationPlayerSpy);
    animationFactorySpy.create.and.returnValue(animationPlayerSpy);
    animationBuilderSpy.build.and.returnValue(animationFactorySpy);

    // Mock IntersectionObserver
    mockObserver = {
      observe: jasmine.createSpy('observe'),
      disconnect: jasmine.createSpy('disconnect'),
    };

    // Create a constructor function for IntersectionObserver
    const IntersectionObserverMock = function(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      (mockObserver as any).callback = cb;
      (mockObserver as any).options = options;
      return mockObserver;
    } as any;

    spyOn(window as any, 'IntersectionObserver').and.callFake(IntersectionObserverMock);

    TestBed.configureTestingModule({
      imports: [HostComponent, AnimateDirective],
      providers: [
        { provide: AnimationBuilder, useValue: animationBuilderSpy },
      ],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComp = fixture.componentInstance;

    // initial detect so directive is instantiated
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(AnimateDirective));
    directive = debugEl.injector.get(AnimateDirective);
  });

  it('should create the directive via host', () => {
    expect(directive).toBeTruthy();
  });

  it('should build animation when host animation input changes', () => {
    hostComp.animation = style({ opacity: 1 });
    fixture.detectChanges(); // IMPORTANT: updates the bound inputs

    expect(animationBuilderSpy.build).toHaveBeenCalled();
    expect(animationPlayerSpy.init).toHaveBeenCalled();
  });

  it('should observe element when animation is provided', () => {
    hostComp.animation = style({ opacity: 1 });
    hostComp.threshold = 0.25;
    fixture.detectChanges();

    expect(window.IntersectionObserver).toHaveBeenCalled();
    const hostEl = fixture.nativeElement.querySelector('#host');
    expect(mockObserver.observe).toHaveBeenCalledWith(hostEl);
  });

  it('should play animation when observer reports intersection', () => {
    // set animation so player exists
    hostComp.animation = style({ opacity: 1 });
    fixture.detectChanges();

    // call the stored callback to simulate IntersectionObserver entry
    (mockObserver as any).callback([
      { isIntersecting: true } as IntersectionObserverEntry,
    ]);

    expect(animationPlayerSpy.play).toHaveBeenCalled();
  });

  it('should not re-play while animating and should reset when not intersecting', () => {
    hostComp.animation = style({ opacity: 1 });
    fixture.detectChanges();

    const cb = (mockObserver as any).callback as IntersectionObserverCallback;

    // first visible -> play
    cb([{ isIntersecting: true } as IntersectionObserverEntry], mockObserver);
    // still visible -> should not play again
    cb([{ isIntersecting: true } as IntersectionObserverEntry], mockObserver);
    expect(animationPlayerSpy.play).toHaveBeenCalledTimes(1);

    // not visible -> resets animating
    cb([{ isIntersecting: false } as IntersectionObserverEntry], mockObserver);
    // visible again -> plays again
    cb([{ isIntersecting: true } as IntersectionObserverEntry], mockObserver);
    expect(animationPlayerSpy.play).toHaveBeenCalledTimes(2);
  });
});
