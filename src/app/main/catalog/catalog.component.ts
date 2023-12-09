import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ICatalogueAll } from '../../interfaces/catalogue';
import { Store } from '@ngrx/store';
import { AppState, selectCatalogueState } from '../../store/app.states';
import * as fromActionsCatalogue from '../../store/catalogue.actions';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { MainContentService } from '../main-content.service';
import { b64toBlob } from '../../util/file';

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

  subscription?: Subscription;
  getState: Observable<any>;
  imageURL: any;
  viewerOpen = false;

  catalogues: ICatalogueAll[] = [];

  constructor(private breakpointObserver: BreakpointObserver, private store: Store<AppState>, private mainContent: MainContentService) {
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

  openImage(catalogue: ICatalogueAll): void {
    this.imageURL = `data:${ catalogue.contentType };base64,${ catalogue.blob }`;
    this.viewerOpen = true;
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.data) {
        state.data.forEach((it?: ICatalogueAll) => {
          if (it && it.blob) {
            const blob = b64toBlob(it.blob, it.contentType);
            const image = URL.createObjectURL(blob);
            this.catalogues.push(Object.assign({}, it, { image }));
          }
        });
        if (this.catalogues?.length) {
          this.mainContent.showPreload(false);
        }
      }
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsCatalogue.Clean()
    );
  }

  private getCatalogs(): void {
    this.store.dispatch(
      new fromActionsCatalogue.GetAllCatalogs()
    );
  }
}

