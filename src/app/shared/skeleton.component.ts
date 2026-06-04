import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  template: `
    <div class="app-surface-canvas app-surface-shell app-surface-stack">
      <section class="app-surface-section">
        <div class="app-detail-section-header">
          <div>
            <div class="ssc-line"></div>
          </div>
        </div>
        <div class="app-crud-loading">
          <div class="app-surface-skeleton-spacer"></div>
          <div class="ssc-square app-crud-loading__block"></div>
          <div class="app-surface-skeleton-spacer"></div>
        </div>
      </section>
    </div>
  `,
})
export class SkeletonComponent {

}
