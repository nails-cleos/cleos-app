import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Additional, IAdditional } from '../../interfaces/additional';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectAdditionalState } from '../../store/app.states';
import { MatDialog } from '@angular/material/dialog';
import { formatDuration } from '../../util/dates';
import * as fromActionsAdditional from '../../store/additional.actions';
import { fieldChange, valueChange } from '../../util/validators';

@Component({
  selector: 'app-additional-detail',
  templateUrl: './additional-detail.component.html',
  styleUrls: ['./additional-detail.component.scss']
})
export class AdditionalDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() additional: IAdditional | undefined;

  form!: UntypedFormGroup;

  name: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  duration: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  errors: any = [];

  private subscription: Subscription | undefined;
  private getState: Observable<any>;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
              private router: Router, public dialog: MatDialog) {
    this.getState = this.store.select(selectAdditionalState);
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getAdditional();
  }

  get update(): void {
    if (this.form.invalid) {
      return;
    }
    const additional: IAdditional = new Additional();
    additional.id = this.additional?.id;

    additional.name = fieldChange(this.name, this.additional?.name);
    additional.description = valueChange(this.form.value?.description, this.additional?.description);
    additional.duration = fieldChange(this.duration, this.additional?.duration);

    this.store.dispatch(new fromActionsAdditional.AdditionalUpdate(additional));
    return;
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      description: new UntypedFormControl(),
      duration: this.duration
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        this.additional = {
          id: state.selected.id,
          name: state.selected.name,
          description: state.selected.description,
          duration: formatDuration(state.selected.duration)
        } as IAdditional;
        this.form.patchValue(this.additional);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.message) {
        this.router.navigate(['additional']);
      }
    });
  }

  private getAdditional(): void {
    if (!this.additional) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsAdditional.AdditionalFind(id)
      );
    }
  }
}
