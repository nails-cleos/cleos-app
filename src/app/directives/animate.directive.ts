import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AnimationBuilder,
  AnimationFactory,
  AnimationMetadata,
  AnimationPlayer,
  AnimationSequenceMetadata,
} from '@angular/animations';

@Directive({
  selector: '[appAnimate]',
  standalone: true,
})
export class AnimateDirective implements OnInit, AfterViewInit, OnDestroy {

  @Input() animateInAnimation?: AnimationMetadata | AnimationMetadata[] | AnimationSequenceMetadata;
  @Input() stopAnimation: boolean;
  @Input() threshold: number;

  private animating: boolean;
  private player?: AnimationPlayer;

  constructor(private el: ElementRef, private animationBuilder: AnimationBuilder) {
    this.animating = false;
    this.stopAnimation = false;
    this.threshold = 0.1;
  }

  ngOnInit(): void {
    this.player = this.initialize();
    this.player?.init();
  }

  ngAfterViewInit(): void {
    const rootMargin = '0px';
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        this.animate(entry.isIntersecting);
        if (entry.isIntersecting && this.stopAnimation) {
          observer.disconnect();
        }
      }),
      { threshold: this.threshold, rootMargin }
    );
    observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.player?.destroy();
  }

  private initialize = (): AnimationPlayer | undefined => {
    let animation: AnimationFactory | undefined;
    if (this.animateInAnimation) {
      animation = this.animationBuilder.build(this.animateInAnimation);
    }

    return animation?.create(this.el.nativeElement);
  }

  private animate = (inView: boolean): void => {
    if (!inView) {
      this.animating = false;
    }

    if (!inView || this.animating) {
      return;
    }

    this.player?.play();
    this.animating = true;
  }
}
