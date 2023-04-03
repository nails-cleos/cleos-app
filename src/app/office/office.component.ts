import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { IUser, IUserAll } from '../interfaces/user';
import { requireMatch } from '../util/validators';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { AppState, selectOfficeState } from '../store/app.states';
import { Router } from '@angular/router';
import { getUserName } from '../util/helper';
import * as fromActionsOffice from '../store/office.actions';
import { Role } from '../interfaces/token';
import { map, startWith } from 'rxjs/operators';
import { IOffice, Office } from '../interfaces/office';

@Component({
  selector: 'app-office',
  templateUrl: './office.component.html',
  styleUrls: ['./office.component.scss']
})
export class OfficeComponent implements OnInit, OnDestroy {
  form!: UntypedFormGroup;
  errors: any = [];
  managers?: IUserAll[];
  filteredOptions?: Observable<IUser[] | undefined>;

  name: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  manager: UntypedFormControl = new UntypedFormControl('', [
    Validators.required, requireMatch
  ]);

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(private readonly translate: TranslateService, private store: Store<AppState>,
              private formBuilder: UntypedFormBuilder, private router: Router) {
    this.getState = this.store.select(selectOfficeState);
  }

  get create(): void {
    if (this.form.invalid) {
      return;
    }

    const office: IOffice = new Office();
    office.name = this.name.value;
    office.managerId = this.manager.value.id;

    return this.store.dispatch(
      new fromActionsOffice.OfficeSave(office)
    );
  }

  get addManager(): void {
    this.router.navigate(['users', 'add'], {state: {role: Role.manager}});
    return;
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
    this.getManagers();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFn(user: IUser): string {
    return user ? getUserName(user) : '';
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      manager: this.manager
    });
    this.filteredOptions = this.manager.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filter(name) : this.managers ? this.managers.slice() : this.managers)
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsOffice.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.managers) {
        this.managers = state.managers;
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.message) {
        this.router.navigate(['offices']);
      }
    });
  }

  private getManagers(): void {
    this.store.dispatch(
      new fromActionsOffice.GetAllManagers()
    );
  }

  private filter(name: string): IUser[] | undefined {
    const filterValue = name.toLowerCase();

    return this.managers?.filter(option => getUserName(option)?.toLowerCase().indexOf(filterValue) === 0);
  }
}

