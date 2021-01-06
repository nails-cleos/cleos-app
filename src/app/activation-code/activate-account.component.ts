import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectUserState } from '../store/app.states';
import { Observable } from 'rxjs';
import { GetAll } from '../store/user.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivateAccount, Clean } from '../store/auth.actions';

@Component({
  selector: 'app-activation-code',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss']
})
export class ActivateAccountComponent implements OnInit {

  getState: Observable<any>;

  constructor(private snackBar: MatSnackBar, private store: Store<AppState>, private route: ActivatedRoute, private router: Router) {
    this.getState = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.subscribe();
  }

  subscribe(): void {
    this.getState.subscribe((state) => {
      if (state.errorMessage || state.message) {
        const snackBarRef = this.snackBar.open(state.errorMessage || state.message, 'OK', {
          duration: 5000
        });

        if (state.message) {
          snackBarRef.afterDismissed().subscribe(() => {
            this.clean();
            this.router.navigate(['dashboard', 'login']);
          });
        }
      }
    });
  }

  clean(): void {
    this.store.dispatch(
      new Clean()
    );
  }

  activate(): void {
    const token: string | null = this.route.snapshot.queryParamMap.get('token');
    this.store.dispatch(
      new ActivateAccount(token)
    );
  }
}
