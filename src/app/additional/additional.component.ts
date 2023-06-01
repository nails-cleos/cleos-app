import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAdditionalState } from '../store/app.states';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Additional, IAdditional } from '../interfaces/additional';
import { Router } from '@angular/router';
import * as fromActionsAdditional from '../store/additional.actions';
import { IGroupService, ITreatmentGroup } from '../interfaces/treatment';
import { requireMatch } from '../util/validators';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-additional',
  templateUrl: './additional.component.html',
  styleUrls: ['./additional.component.scss']
})
export class AdditionalComponent implements OnInit, OnDestroy {
  form!: UntypedFormGroup;

  name: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  duration: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);
  groups?: IGroupService[];
  filteredGroup?: Observable<IGroupService[] | undefined>;
  group: UntypedFormControl = new UntypedFormControl('', [requireMatch]);

  errors: any = [];

  private getState: Observable<any>;
  private subscription: Subscription | undefined;

  constructor(private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private router: Router) {
    this.getState = this.store.select(selectAdditionalState);
  }

  get create(): void {
    if (this.form.invalid) {
      return;
    }

    const additional: IAdditional = new Additional();
    additional.name = this.name.value;
    additional.description = this.form.value.description;
    additional.duration = this.duration.value;
    additional.groupId = this.group.value.id;

    this.store.dispatch(
      new fromActionsAdditional.AdditionalSave(additional)
    );

    return;
  }

  ngOnInit(): void {
    this.clean();
    this.findGroups();
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFnGroup(group: ITreatmentGroup): string {
    return group ? `${ group.name }` : '';
  }

  keyDownGroup(event: any): void {
    if (event.code === 'Backspace') {
      this.group.setValue('');
    }
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      description: new UntypedFormControl(),
      name: this.name,
      duration: this.duration,
      group: this.group
    });


    this.filteredGroup = this.group.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterGroup(name) : this.groups ? this.groups.slice() : this.groups)
    );
  }

  private findGroups(): void {
    this.store.dispatch(
      new fromActionsAdditional.FindGroups()
    );
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsAdditional.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.groups = state.groups;
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        this.router.navigate(['additional']);
      }
    });
  }

  private filterGroup(name: string): IGroupService[] | undefined {
    const filterValue = name.toLowerCase();

    return this.groups?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
  }
}
