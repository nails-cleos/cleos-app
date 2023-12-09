import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAdditionalState } from '../store/app.states';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, ɵTypedOrUntyped } from '@angular/forms';
import { Additional, IAdditional } from '../interfaces/additional';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromActionsAdditional from '../store/additional.actions';
import { IGroupService, ITreatmentGroup } from '../interfaces/treatment';
import { fieldChange, requireMatch, valueChange } from '../util/validators';
import { map, startWith } from 'rxjs/operators';
import { formatDuration } from '../util/dates';

@Component({
  selector: 'app-additional',
  templateUrl: './additional.component.html',
  styleUrls: ['./additional.component.scss']
})
export class AdditionalComponent implements OnInit, OnDestroy {
  @Input() additional?: IAdditional;
  form!: UntypedFormGroup;
  id?: string;
  isAddMode: boolean;

  groups?: IGroupService[];
  filteredGroup?: Observable<IGroupService[] | undefined>;

  errors: any = [];

  private getState: Observable<any>;
  private subscription: Subscription | undefined;

  constructor(private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private router: Router,
              private route: ActivatedRoute, private cdRef: ChangeDetectorRef) {
    this.isAddMode = true;
    this.getState = this.store.select(selectAdditionalState);
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }

    const additional: IAdditional = new Additional();
    additional.name = fieldChange(this.getForm.name as UntypedFormControl, this.additional?.name);
    additional.description = valueChange(this.getForm.description.value, this.additional?.description);
    additional.duration = fieldChange(this.getForm.duration as UntypedFormControl, this.additional?.duration);
    additional.groupId = this.getForm.group.value?.id;

    if (this.isAddMode) {
      return this.store.dispatch(new fromActionsAdditional.AdditionalSave(additional));
    } else {
      additional.id = this.id;
      this.additional = undefined;
      return this.store.dispatch(new fromActionsAdditional.AdditionalUpdate(additional));
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = id;
    }
    this.clean();
    this.findGroups();
    this.createForm();
    this.subscribe();
    this.isAddMode = !this.id;
    if (!this.isAddMode) {
      this.getAdditional();
    }
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  displayFnGroup(group: ITreatmentGroup): string {
    return group ? `${ group.name }` : '';
  }

  keyDownGroup(event: any): void {
    if (event.code === 'Backspace') {
      this.getForm.group.setValue('');
    }
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      description: [''],
      name: ['', Validators.required],
      duration: ['', Validators.required],
      group: ['', requireMatch]
    });

    this.filteredGroup = this.getForm.group.valueChanges.pipe(startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this.filterGroup(name) : this.groups ? this.groups.slice() : this.groups)
    );
  }

  private filterGroup(name: string): IGroupService[] | undefined {
    const filterValue = name.toLowerCase();

    return this.groups?.filter(option => option.name?.toLowerCase().indexOf(filterValue) === 0);
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

  private getAdditional(): void {
    if (!this.additional) {
      this.store.dispatch(
        new fromActionsAdditional.AdditionalFind(this.id)
      );
    }
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.groups = state.groups;
      if (state.selected) {
        this.additional = {
          id: state.selected.id,
          name: state.selected.name,
          description: state.selected.description,
          duration: formatDuration(state.selected.duration),
          groupId: state.selected.group?.id
        } as IAdditional;
        this.form.patchValue(this.additional);
        this.getForm.group.setValue(state.selected.group);
      }
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
}
