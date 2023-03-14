import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';

import { CdkDragEnter, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable, Subscription } from 'rxjs';
import { AppState, selectCatalogueState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsCatalogue from '../../store/catalogue.actions';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ICatalogueAll } from '../../interfaces/catalogue';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-catalogue-list',
  templateUrl: './catalogues.component.html',
  styleUrls: ['./catalogues.component.scss']
})
export class CataloguesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(CdkDropList) dropsQuery!: QueryList<CdkDropList>;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  subscription?: Subscription;
  getState: Observable<any>;
  drops: CdkDropList[] = [];

  catalogues: ICatalogueAll[] = [];

  constructor(private readonly translate: TranslateService, public dialog: MatDialog,
              private breakpointObserver: BreakpointObserver, private store: Store<AppState>,
              private snackBar: MatSnackBar, private cdRef: ChangeDetectorRef) {
    this.getState = this.store.select(selectCatalogueState);
  }

  get finish(): void {
    return this.store.dispatch(
      new fromActionsCatalogue.CatalogueUpdateAll(this.catalogues)
    );
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
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

  edit(catalogue: ICatalogueAll): void {
    this.store.dispatch(
      new fromActionsCatalogue.CatalogueSelected(catalogue)
    );
  }

  delete(catalogue: ICatalogueAll): void {
    const title = this.translate.instant('CATALOGUE.DELETED.TITLE');
    const content = this.translate.instant('CATALOGUE.DELETED.CONTENT', {name: catalogue.name});
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {title, content, value: catalogue}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(
          new fromActionsCatalogue.DeleteCatalogue(result.id)
        );
      }
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.data) {
        this.catalogues = [...state.data];
        this.cdRef.detectChanges();
      }
      if (state.message) {
        this.clean();
        this.getCatalogues();
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
