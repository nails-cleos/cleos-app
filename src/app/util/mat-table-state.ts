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
  const sortDirection = signal<SortDirection>(defaultDirection);

  effect((onCleanup) => {
    const paginatorRef = paginator();

    if (!paginatorRef) {
      pageIndex.set(0);
      return;
    }

    pageIndex.set(paginatorRef.pageIndex ?? 0);

    const sub = paginatorRef.page.subscribe(({ pageIndex: nextPageIndex }) => {
      pageIndex.set(nextPageIndex);
    });

    onCleanup(() => sub.unsubscribe());
  });

  effect((onCleanup) => {
    const sortRef = sort();

    if (!sortRef) {
      sortActive.set(defaultActive);
      sortDirection.set(defaultDirection);
      return;
    }

    sortActive.set(sortRef.active || defaultActive);
    sortDirection.set(sortRef.direction || defaultDirection);

    const sub = sortRef.sortChange.subscribe(({ active: nextActive, direction: nextDirection }) => {
      sortActive.set(nextActive || defaultActive);
      sortDirection.set(nextDirection || defaultDirection);
    });

    onCleanup(() => sub.unsubscribe());
  });

  const baseRequest = computed<MatTableBaseRequest>(() => ({
    page: pageIndex(),
    sort: sortActive(),
    direction: sortDirection(),
  }));

  const resetPage = () => {
    pageIndex.set(0);
    paginator()?.firstPage();
  };

  const resetOn = (trigger: Signal<unknown>, onReset?: () => void) => effect(() => {
    if (trigger()) {
      onReset?.();
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
