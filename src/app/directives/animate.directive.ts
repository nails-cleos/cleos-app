import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { AnimationBuilder, AnimationMetadata, AnimationSequenceMetadata } from '@angular/animations';

@Directive({
  selector: '[appAnimate]',
})
export class AnimateDirective {
  animateInAnimation = input<AnimationMetadata | AnimationMetadata[] | AnimationSequenceMetadata>();
  stopAnimation = input(false);
  threshold = input(0.1);


  private el = inject(ElementRef);
  private animationBuilder = inject(AnimationBuilder);

  private animating = false;

  constructor() {
    effect((onCleanup) => {
      const animation = this.animateInAnimation();
      const threshold = this.threshold();

      if (!animation) {
        return;
      }

      // Build player
      const factory = this.animationBuilder.build(animation);
      const player = factory.create(this.el.nativeElement);
      player.init();

      // Setup observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const inView = entry.isIntersecting;
            if (!inView) {
              this.animating = false;
              return;
            }

            if (this.animating) {
              return;
            }

            player.play();
            this.animating = true;

            if (this.stopAnimation()) {
              observer.disconnect();
            }
          });
        },
        { threshold, rootMargin: '0px' },
      );

      observer.observe(this.el.nativeElement);

      onCleanup(() => {
        player.destroy();
        observer.disconnect();
      });
    });
  }

}
