import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, Subscription } from 'rxjs';
import { ICatalogue, ISlide, Slide } from '../interfaces/catalogue';
import { AppState, selectAuthState, selectMainState } from '../store/app.states';
import { Store } from '@ngrx/store';
import * as fromActionsMain from '../store/main.actions';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { IProduct } from '../interfaces/product';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { requireMatch } from '../util/validators';
import { getNow, plusMonthDate } from '../util/dates';
import { MAX_RESERVATION_MONTH } from '../interfaces/reservation';
import { ViewportScroller } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { IUserAll } from '../interfaces/user';
import { getUserName } from '../util/helper';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  title = environment.title;
  isAuthenticated = false;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, private store: Store<AppState>,
              private viewportScroller: ViewportScroller, private router: Router) {
    this.store.select(selectAuthState).subscribe((state: any) => {
      this.isAuthenticated = state.isAuthenticated;
    });
  }

  onNavigation(elementId: string): void {
    this.router.navigate(['main']).then(() => {
      this.viewportScroller.scrollToAnchor(elementId);
    });
  }
}
