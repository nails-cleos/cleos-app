import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ICatalogueAll } from '../interfaces/catalogue';
import { Store } from '@ngrx/store';
import { AppState, selectCatalogueState } from '../store/app.states';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as fromActionsCatalogue from '../store/catalogue.actions';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit, OnDestroy {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  subscription: Subscription | undefined;
  getState: Observable<any>;
  error: any;
  imageURL: any;
  viewerOpen = false;

  catalogues: ICatalogueAll[] = [];

  constructor(private breakpointObserver: BreakpointObserver, private store: Store<AppState>, private snackBar: MatSnackBar) {
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

  openImage(catalogue: ICatalogueAll): void {
    this.imageURL = `data:image/jpg;base64,${catalogue.blob}`;
    this.viewerOpen = true;
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.data) {
        this.catalogues = state.data;
      }
      if (state.errorMessage || state.message) {
        this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });
        this.error = state.error;
        return;
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

