import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState } from '../../store/app.states';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromActionsLogin from '../../store/auth.actions';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-activation-code',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss']
})
export class ActivateAccountComponent implements OnInit, OnDestroy {

  getState: Observable<any>;
  subscription: Subscription | undefined;

  lang: string;

  constructor(private store: Store<AppState>, private route: ActivatedRoute, private router: Router,
              private translate: TranslateService) {
    this.getState = this.store.select(selectAuthState);
    this.lang = this.route.snapshot.queryParamMap.get('lang') || navigator.language;
  }

  ngOnInit(): void {
    this.translate.use(this.lang);
    this.clean();
    this.subscribe();
  }

  activate(): void {
    const token: string | null = this.route.snapshot.queryParamMap.get('token');
    this.translate.use(this.lang);
    this.store.dispatch(
      new fromActionsLogin.ActivateAccount(token)
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe((state) => {
      if (state.message) {
        this.router.navigate(['auth']);
      }
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsLogin.Clean()
    );
  }
}
