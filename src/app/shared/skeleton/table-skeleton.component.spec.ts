import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSkeletonComponent } from './table-skeleton.component';
import { beforeEach, describe, expect, it } from 'vitest';

describe('TableSkeletonComponent', () => {
  let component: TableSkeletonComponent;
  let fixture: ComponentFixture<TableSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableSkeletonComponent],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(TableSkeletonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', [
      { key: 'name' },
      { key: 'status', hideOnMobile: true },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the configured number of rows', () => {
    fixture.componentRef.setInput('rowCount', 4);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(4);
  });

  it('should apply mobile visibility classes per column', () => {
    const headerCells = fixture.nativeElement.querySelectorAll('th');
    const bodyCells = fixture.nativeElement.querySelectorAll(
      'tbody tr:first-child td',
    );

    expect(headerCells[1].classList.contains('app-surface-hide-mobile')).toBe(
      true,
    );
    expect(bodyCells[1].classList.contains('app-surface-hide-mobile')).toBe(
      true,
    );
  });

  it('should render paginator skeleton when enabled', () => {
    fixture.componentRef.setInput('showPaginator', true);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.app-table-skeleton-paginator'),
    ).toBeTruthy();
  });
});
