import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  imports: [],
  template: `
    <div class="app-surface-canvas app-surface-shell app-surface-stack">
      <section class="app-surface-section">
        @if (showTitle()) {
          <div class="app-detail-section-header app-skeleton-header">
            <div class="ssc-head-line"></div>
            <div class="ssc-line app-skeleton-subtitle"></div>
          </div>
        }
        <div class="app-crud-form-grid app-crud-form-grid--single">
          @for (_ of [].constructor(lines()); track $index) {
            <div class="app-crud-form-grid__full">
              <div class="ssc-line"></div>
            </div>
          }
        </div>
        @for (_ of [].constructor(boxes()); track $index) {
          <div class="app-crud-loading">
            <div class="app-surface-skeleton-spacer"></div>
            <div class="ssc-square app-crud-loading__block"></div>
            <div class="app-surface-skeleton-spacer"></div>
          </div>
        }
        @if (buttons()) {
          <div class="app-detail-actions app-skeleton-actions">
            @for (_ of [].constructor(buttons()); track $index) {
              <div class="ssc-head-line app-skeleton-actions__button"></div>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .app-skeleton-header {
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
    }

    .app-skeleton-actions {
      margin-top: 24px;
    }

    .app-skeleton-actions__button {
      width: 168px;
      max-width: 100%;
      height: 44px;
      border-radius: 999px;
    }

    .app-skeleton-subtitle {
      width: min(320px, 100%);
      height: 16px;
      margin-top: 12px;
      border-radius: 999px;
    }
  `],
})
export class SkeletonComponent {
  showTitle = input<boolean>(true);
  buttons = input<number>(2);
  lines = input<number>(3);
  boxes = input<number>(0);
}
