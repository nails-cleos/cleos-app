import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectOfficeState } from '../../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import { IOffice, Office } from '../../interfaces/office';
import { fieldChange } from '../../util/validators';
import * as fromActionsOffice from '../../store/office.actions';
import { getUserName } from '../../util/helper';

@Component({
  selector: 'app-office-detail',
  templateUrl: './office-detail.component.html',
  styleUrls: ['./office-detail.component.scss']
})
export class OfficeDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() office?: IOffice;

  form!: UntypedFormGroup;
  errors: any = [];
  managerName?: string;

  name: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
              private router: Router) {
    this.getState = this.store.select(selectOfficeState);
  }

  get update(): void {
    if (this.form.invalid) {
      return;
    }
    const office: IOffice = new Office();
    office.id = this.office?.id;

    office.name = fieldChange(this.name, this.office?.name);

    return this.store.dispatch(new fromActionsOffice.OfficeUpdate(office));
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getOffice();
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        this.managerName = getUserName(state.selected.office.manager);
        this.office = {
          id: state.selected.office.id,
          name: state.selected.office.name,
          rooms: state.selected.office.rooms
        } as IOffice;
        this.form.patchValue(this.office);
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

  private getOffice(): void {
    if (!this.office) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsOffice.OfficeFind(id)
      );
    }
  }

}
