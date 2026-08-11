import { computed, effect, signal, type Signal } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, type SortDirection } from '@angular/material/sort';

export type MatTableBaseRequest = {
  page: number;
  sort: string;
  direction: SortDirection;
};

export const createMatTableState = (
  paginator: Signal<MatPaginator | undefined>,
  sort: Signal<MatSort | undefined>,
  defaultActive: string,
  defaultDirection: SortDirection = 'asc',
) => {
  const pageIndex = signal(0);
  const sortActive = signal(defaultActive);
  const sortDirection = signal(defaultDirection);

  effect((onCleanup) => {
    const p = paginator();

    if (!p) {
      return;
    }

    const sub = p.page.subscribe(({ pageIndex: next }) => {
      if (pageIndex() !== next) {
        pageIndex.set(next);
      }
    });

    onCleanup(() => sub.unsubscribe());
  });

  effect(() => {
    const p = paginator();

    if (p && p.pageIndex !== pageIndex()) {
      p.pageIndex = pageIndex();
    }
  });

  effect((onCleanup) => {
    const s = sort();

    if (!s) {
      return;
    }

    // Initial UI state
    s.active = defaultActive;
    s.direction = defaultDirection;

    const sub = s.sortChange.subscribe(({ active, direction }) => {
      sortActive.set(active || defaultActive);
      sortDirection.set(direction || defaultDirection);
    });

    onCleanup(() => sub.unsubscribe());
  });

  const baseRequest = computed(() => ({
    page: pageIndex(),
    sort: sortActive(),
    direction: sortDirection(),
  }));

  const resetPage = () => {
    pageIndex.set(0);
    paginator()?.firstPage();
  };

  const resetOn = (trigger: Signal<unknown>, onReset: () => void) =>
    effect(() => {
      if (trigger()) {
        onReset();
        resetPage();
      }
    });

  return {
    paginator,
    sort,
    pageIndex: pageIndex.asReadonly(),
    sortActive: sortActive.asReadonly(),
    sortDirection: sortDirection.asReadonly(),
    baseRequest,
    resetPage,
    resetOn,
  };
};
