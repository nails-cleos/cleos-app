import { QueryList, Component, ViewChildren, AfterViewInit, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';

import { CdkDropList, CdkDragEnter, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectCatalogueState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsCatalogue from '../../store/catalogue.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICatalogueAll } from '../../interfaces/catalogue';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-catalogue-list',
  templateUrl: './catalogues.component.html',
  styleUrls: ['./catalogues.component.scss']
})
export class CataloguesComponent implements OnInit, AfterViewInit, OnDestroy {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  subscription: Subscription | undefined;
  getState: Observable<any>;
  error: any;

  @ViewChildren(CdkDropList) dropsQuery!: QueryList<CdkDropList>;
  drops: CdkDropList[] = [];

  catalogues: ICatalogueAll[] = [];

  constructor(private breakpointObserver: BreakpointObserver, private store: Store<AppState>, private snackBar: MatSnackBar,
              private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectCatalogueState);
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
    this.getCatalogues();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dropsQuery.changes.subscribe(() => {
      this.drops = this.dropsQuery.toArray();
    });
    Promise.resolve().then(() => {
      this.drops = this.dropsQuery.toArray();
    });
  }

  entered($event: CdkDragEnter): void {
    moveItemInArray(this.catalogues, $event.item.data, $event.container.data);
  }

  finish(): void {
    this.store.dispatch(
      new fromActionsCatalogue.CatalogueUpdateAll(this.catalogues)
    );
  }

  edit(catalogue: ICatalogueAll): void {
    this.store.dispatch(
      new fromActionsCatalogue.CatalogueSelected(catalogue)
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.data) {
        this.catalogues = [...state.data];
        this.cdRef.detectChanges();
      }
      if (state.errorMessage || state.message) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });

        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.clean();
            this.getCatalogues();
          });
        } else {
          this.error = state.error;
          return;
        }
      }
      if (state.error) {
        this.error = state.error;
      }
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsCatalogue.Clean()
    );
  }

  private getCatalogues(): void {
    this.store.dispatch(
      new fromActionsCatalogue.GetAll()
    );
  }
}
