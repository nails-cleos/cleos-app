import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ICatalogueAll } from '../../interfaces/catalogue';
import { Store } from '@ngrx/store';
import { AppState, selectCatalogueState } from '../../store/app.states';
import * as fromActionsCatalogue from '../../store/catalogue.actions';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { MainContentService } from '../main-content.service';
import { getImage } from '../../util/file';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  imports: [SharedModule]
})
export class CatalogComponent implements OnInit, OnDestroy {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  subscription?: Subscription;
  getState: Observable<any>;

  catalogues: ICatalogueAll[] = [];

  constructor(private breakpointObserver: BreakpointObserver, private store: Store<AppState>,
              private mainContent: MainContentService) {
    this.getState = this.store.select(selectCatalogueState);
  }

  ngOnInit(): void {
    this.subscribe();
    this.clean();
    this.getCatalogs();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private clean = (): void => this.store.dispatch(new fromActionsCatalogue.Clean());

  private getCatalogs = (): void => this.store.dispatch(new fromActionsCatalogue.GetAllCatalogs());

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe((state) => {
      if (state.data) {
        state.data.forEach((it?: ICatalogueAll) => {
          if (it && it.blob) {
            const image = getImage(it.blob, it.contentType);
            this.catalogues.push(Object.assign({}, it, { image }));
          }
        });
        if (this.catalogues?.length) {
          this.mainContent.configure(false, 'open');
        }
      }
    });
  }
}

