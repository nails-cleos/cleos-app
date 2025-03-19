import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ɵTypedOrUntyped
} from '@angular/forms';
import { IUser, IUserAll } from '../interfaces/user';
import { fieldChange, requireMatch } from '../util/validators';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { AppState, selectOfficeState } from '../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromActionsOffice from '../store/office.actions';
import { Role } from '../interfaces/token';
import { map, startWith } from 'rxjs/operators';
import { IOffice, Office } from '../interfaces/office';
import { SharedModule } from "../shared/shared.module";
import { BackButtonDirective } from "../directives/back-button.directive";

@Component({
  selector: 'app-office',
  templateUrl: './office.component.html',
  styleUrls: ['./office.component.scss'],
  standalone: true,
  imports: [SharedModule, BackButtonDirective],
})
export class OfficeComponent implements OnInit, OnDestroy {
  @Input() office?: IOffice;

  id?: string;
  isAddMode: boolean;
  form!: UntypedFormGroup;
  errors: any = [];
  managers?: IUserAll[];
  filteredOptions?: Observable<IUser[] | undefined>;
  managerName?: string;

  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly language: string;

  constructor(private translate: TranslateService, private store: Store<AppState>,
              private formBuilder: UntypedFormBuilder, private router: Router, private route: ActivatedRoute,
              private cdRef: ChangeDetectorRef) {
    this.isAddMode = true;
    this.getState = this.store.select(selectOfficeState);
    this.language = this.translate.currentLang;
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }

    const office: IOffice = new Office();
    office.name = fieldChange(this.getForm.name as UntypedFormControl, this.office?.name);
    office.subject = fieldChange(this.getForm.subject as UntypedFormControl, this.office?.subject);
    office.kvk = fieldChange(this.getForm.kvk as UntypedFormControl, this.office?.kvk);
    office.account = fieldChange(this.getForm.account as UntypedFormControl, this.office?.account);
    office.btw = fieldChange(this.getForm.btw as UntypedFormControl, this.office?.btw);
    office.billingAddress = fieldChange(this.getForm.billingAddress as UntypedFormControl, this.office?.billingAddress);

    if (this.isAddMode) {
      office.managerId = this.getForm.manager.value.id;
      return this.store.dispatch(
        new fromActionsOffice.OfficeSave(office)
      );
    } else {
      office.id = this.id;
      this.office = undefined;
      return this.store.dispatch(new fromActionsOffice.OfficeUpdate(office));
    }
  }

  get addManager(): void {
    this.router.navigate([this.language, 'users', 'add'], { state: { role: Role.manager } });
    return;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = id;
    }
    this.clean();
    this.createForm();
    this.subscribe();
    this.isAddMode = !this.id;
    if (!this.isAddMode) {
      this.getOffice();
    } else {
      this.getManagers();
    }
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFn = (user: IUser): string => user?.displayName ? user.displayName : '';

  private createForm = (): void => {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      manager: ['', [Validators.required, requireMatch]],
      subject: [''],
      kvk: [''],
      account: [''],
      btw: [''],
      billingAddress: ['']
    });
    this.filteredOptions = this.getForm.manager.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filter(name) : this.managers ? this.managers.slice() : this.managers)
    );
  }

  private filter = (name: string): IUser[] | undefined => this.managers?.filter(
    option => option.displayName?.toLowerCase().indexOf(name.toLowerCase()) === 0)

  private clean = (): void => this.store.dispatch(new fromActionsOffice.Clean());

  private getManagers = (): void => this.store.dispatch(new fromActionsOffice.GetAllManagers());

  private getOffice = (): void => {
    if (!this.office) {
      this.store.dispatch(
        new fromActionsOffice.OfficeFind(this.id)
      );
    }
  }

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      if (state.managers) {
        this.managers = state.managers;
      }
      if (state.selected) {
        this.managerName = state.selected.office.manager.displayName;
        this.office = {
          id: state.selected.office.id,
          manager: state.selected.office.manager,
          name: state.selected.office.name,
          rooms: state.selected.office.rooms,
          subject: state.selected.office.subject,
          kvk: state.selected.office.kvk,
          account: state.selected.office.account,
          btw: state.selected.office.btw,
          billingAddress: state.selected.office.billingAddress
        } as IOffice;
        this.form.patchValue(this.office);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        this.router.navigate([this.language, 'offices']);
      }
    });
  }
}

