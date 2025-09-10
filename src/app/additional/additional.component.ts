import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectAdditionalState } from '../store/app.states';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ɵTypedOrUntyped,
} from '@angular/forms';
import { Additional, IAdditional } from '../interfaces/additional';
import { ActivatedRoute, Router } from '@angular/router';
import * as fromActionsAdditional from '../store/additional.actions';
import { IGroupService } from '../interfaces/treatment';
import { fieldChange, valueChange } from '../util/validators';
import { map, startWith } from 'rxjs/operators';
import { formatDuration } from '../util/dates';
import { areEquals } from '../util/helper';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { BackButtonDirective } from '../directives/back-button.directive';

@Component({
  selector: 'app-additional',
  templateUrl: './additional.component.html',
  styleUrls: ['./additional.component.scss'],
  imports: [SharedModule, BackButtonDirective],
})
export class AdditionalComponent implements OnInit, OnDestroy {
  @Input() additional?: IAdditional;
  @ViewChild('groupInput') groupInput!: ElementRef<HTMLInputElement>;
  form!: UntypedFormGroup;
  id?: string;
  isAddMode: boolean;

  groups: IGroupService[] = [];
  filteredGroup?: Observable<IGroupService[] | undefined>;
  allGroups?: IGroupService[];

  errors: any = [];
  language: string;

  private getState: Observable<any>;
  private subscription: Subscription | undefined;
  private currentGroupIds: string[] = [];

  constructor(private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private router: Router,
              private route: ActivatedRoute, private cdRef: ChangeDetectorRef, private translate: TranslateService) {
  	this.isAddMode = true;
  	this.getState = this.store.select(selectAdditionalState);

  	this.language = this.translate.currentLang;
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

  	const newGroupIds = this.groups.map(({ id }) => id);
  	if (!areEquals(newGroupIds, this.currentGroupIds)) {
  		additional.groupIds = newGroupIds;
  	}

  	if (this.isAddMode) {
  		this.store.dispatch(new fromActionsAdditional.CreateAdditional(additional));
  	} else {
  		this.additional = undefined;
  		this.store.dispatch(new fromActionsAdditional.UpdateAdditional(this.id!, additional));
  	}
  	return;
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

  remove = (group: IGroupService): void => {
  	const index = this.groups.indexOf(group);
  	if (index >= 0) {
  		this.groups.splice(index, 1);
  		this.allGroups?.push(group);
  		this.getForm.group.setValue(null);
  	}
  };

  selectedGroup = (event: MatAutocompleteSelectedEvent): void => {
  	const group = event.option.value;
  	this.groups.push(group);
  	this.allGroups = this.allGroups?.filter(c => c.id !== group.id);
  	this.groupInput.nativeElement.value = '';
  	this.getForm.group.setValue(null);
  };

  sortGroups = (data: any): IGroupService[] => data.sort((a: any, b: any) => {
  	const aName = a.name.toUpperCase();
  	const bName = b.name.toUpperCase();
  	return (aName > bName) ? 1 : ((bName > aName) ? -1 : 0);
  });

  private createForm = (): void => {
  	this.form = this.formBuilder.group({
  		description: [''],
  		name: ['', Validators.required],
  		duration: ['', Validators.required],
  		group: [''],
  	});

  	this.filteredGroup = this.getForm.group.valueChanges.pipe(
  		startWith(''),
  		map(value => typeof value === 'string' ? value : value ? value.name : ''),
  		map(
  			name => name ? this.filterGroup(name) : (this.allGroups ? this.allGroups.slice() : this.allGroups)),
  	);
  };

  private filterGroup = (name: string): IGroupService[] | undefined => this.allGroups?.filter(
  	option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0);

  private findGroups = (): void => this.store.dispatch(new fromActionsAdditional.GetAllTreatmentsGroup());

  private clean = (): void => this.store.dispatch(new fromActionsAdditional.Clean());

  private getAdditional = (): void => {
  	if (!this.additional) {
  		this.store.dispatch(
  			new fromActionsAdditional.GetAdditional(this.id!),
  		);
  	}
  };

  private subscribe = (): void => {
  	this.subscription = this.getState.subscribe((state) => {
  		this.allGroups = state.groups;
  		if (state.selected) {
  			this.additional = {
  				id: state.selected.id,
  				name: state.selected.name,
  				description: state.selected.description,
  				duration: formatDuration(state.selected.duration),
  				groupId: state.selected.group?.id,
  			} as IAdditional;
  			this.groups = [];
  			state.selected.groups?.forEach((group: IGroupService) => {
  				this.groups.push(group);
  				this.allGroups = this.allGroups?.filter(c => c.id !== group.id);
  			});
  			this.currentGroupIds = this.groups.map(({ id }) => id);
  			this.form.patchValue(this.additional);
  		}
  		if (state.subErrors) {
  			state.subErrors.forEach((value: any) => {
  				this.errors[value.field] = value.message;
  				this.form.controls[value.field].setErrors({ incorrect: true });
  			});
  		} else if (state.response) {
  			this.router.navigate([this.language, 'additional']);
  		}
  	});
  };
}
