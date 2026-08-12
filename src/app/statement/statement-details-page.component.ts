import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { StatementComponent } from './statement.component';
import { DocumentStore } from '../store/document.store';
import { ICommon } from '../interfaces/common';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-statement-details-page',
  template: `
    @if (statement(); as statement) {
      <app-statement
        [statement]="statement"
        [config]="config"
        (submitData)="submit($event)"
      />
    } @else {
      <app-skeleton />
    }
  `,
  imports: [StatementComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementDetailsPageComponent {
  id = input.required<string>();
  config: ICommon = {
    title: 'DOCUMENT.STATEMENT.DETAIL',
    button: { icon: 'published_with_changes', label: 'COMMON.BUTTON.UPDATE' },
  };

  private readonly documentStore = inject(DocumentStore);
  statement = computed(() => this.documentStore.selected());

  constructor() {
    effect(() => {
      this.documentStore.clean();
      this.documentStore.loadById(this.id());
    });
  }

  submit(data: { officeId: string; blob: Blob; fileName: string }) {
    this.documentStore.uploadStatement(
      data.officeId,
      data.blob,
      data.fileName,
      this.id(),
    );
  }
}
