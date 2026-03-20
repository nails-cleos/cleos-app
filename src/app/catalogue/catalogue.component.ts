import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { combineLatestWith } from 'rxjs';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { createCatalogue, getCatalogue, updateCatalogue } from '../store/catalogue.actions';
import { Catalogue, ICatalogue } from '../interfaces/catalogue';
import { fieldChange, requireMatch, valueChange } from '../util/validators';
import { ITreatmentGroup, ITreatmentGroupAll } from '../interfaces/treatment';
import { map, startWith } from 'rxjs/operators';
import { SharedModule } from '../shared/shared.module';
import { SortByPipe } from '../pipes/sort-by.pipe';
import { BackButtonDirective } from '../directives/back-button.directive';
import {
  getCurrentCatalogueIdPipe,
  getGroupPipe,
  getSelectedCataloguePipe,
  getSubErrorsPipe,
} from '../store/selectors/catalogue.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../interfaces/common';
import { CatalogueState } from '../store/reducers/catalogue.reducers';
import { FileDropComponent, UploadFile } from '../shared/file-drop/file-drop.component';

type CatalogueForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
  home: FormControl<boolean>;
  catalog: FormControl<boolean>;
  group: FormControl<ITreatmentGroupAll | undefined>;
};

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.scss'],
  imports: [SharedModule, SortByPipe, BackButtonDirective, FileDropComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueComponent {
  private readonly store: Store<CatalogueState> = inject(Store<CatalogueState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private catalogueId$ = this.store.pipe(getCurrentCatalogueIdPipe);
  private selectedCatalogue$ = this.store.pipe(getSelectedCataloguePipe);
  private allGroups$ = this.store.pipe(getGroupPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);

  private catalogueIdSignal = toSignal(this.catalogueId$, { initialValue: null });
  private selectedCatalogueSignal = toSignal(this.selectedCatalogue$);
  private subErrorsSignal = toSignal(this.subErrors$);

  private catalogueId = computed(() => this.catalogueIdSignal());

  form: FormGroup<CatalogueForm> = this.formBuilder.group<CatalogueForm>({
    name: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    description: this.formBuilder.control(undefined),
    home: this.formBuilder.control(false),
    catalog: this.formBuilder.control(false),
    group: this.formBuilder.control(undefined, {
      validators: [requireMatch],
    }),
  });

  catalogueSignal = computed(() => this.selectedCatalogueSignal());

  filteredGroupSignal = toSignal(
    this.getForm.group.valueChanges.pipe(
      startWith(''),
      map((value: any) => !value || typeof value === 'string' ? value : value.code),
      combineLatestWith(this.allGroups$),
      map(([name, groups]) => {
        if (name) {
          return this.filterGroup(name, groups);
        } else {
          return groups ? groups.slice() : groups;
        }
      }),
    ),
  );
  isAddModeSignal = computed(() => !this.catalogueId());
  errors = signal<Record<string, unknown>>({});
  file = signal<UploadFile | undefined>(undefined);
  image = signal<string | undefined>(undefined);

  private selectedHome = toSignal(this.getForm.home.valueChanges);

  constructor() {
    effect(() => {
      const subErrors = this.subErrorsSignal();
      if (subErrors) {
        const errorMap: Record<string, unknown> = {};
        subErrors.forEach((error: IError) => {
          const field = error.field as keyof CatalogueForm | undefined;

          if (field && field in this.form.controls) {
            errorMap[field] = error.message;
            this.form.controls[field].setErrors({ incorrect: true });
          }
        });
        this.errors.set(errorMap);
      }
    });

    effect(() => {
      const id = this.catalogueId();
      if (id) {
        this.store.dispatch(getCatalogue({ id }));
      }
    });

    effect(() => {
      const catalogue = this.selectedCatalogueSignal();
      if (catalogue?.id) {
        this.form.patchValue(catalogue);
        this.file.set({
          name: catalogue.name,
          size: 0,
          progress: 100,
          image: `data:${catalogue.contentType};base64,${catalogue.blob}`,
        });
        this.getForm.group.setValue(catalogue.group);
      }
    });

    effect(() => {
      this.getForm.group.setValidators(this.selectedHome() ? [Validators.required, requireMatch] : [requireMatch]);
      this.getForm.group.updateValueAndValidity({ emitEvent: false });
    });
  }

  get getForm(): CatalogueForm {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const resizedImageDataUrl = this.image() || this.file()?.image;
    if (!resizedImageDataUrl) {
      return;
    }

    const catalogueSignal = this.catalogueSignal();
    const catalogue: ICatalogue = new Catalogue();
    catalogue.name = fieldChange(this.getForm.name, catalogueSignal?.name);
    catalogue.description = valueChange(this.getForm.description.value, catalogueSignal?.description);
    catalogue.home = fieldChange(this.getForm.home, catalogueSignal?.home);
    catalogue.catalog = fieldChange(this.getForm.catalog, catalogueSignal?.catalog);
    catalogue.groupId = this.getForm.group.value?.id;

    const id = this.catalogueId();
    if (!id) {
      this.store.dispatch(createCatalogue({ catalogue, resizedImageDataUrl }));
    } else {
      this.store.dispatch(updateCatalogue({ id, catalogue, resizedImageDataUrl }));
    }
  }

  onImageSelected(image?: string) {
    this.image.set(image);
  }

  displayFnGroup = (group: ITreatmentGroup): string => group ? `${group.name}` : '';

  keyDownGroup = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.group.setValue(undefined);
    }
  };

  private filterGroup = (
    name: string,
    groups: ITreatmentGroupAll[],
  ): ITreatmentGroupAll[] | undefined => groups?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0,
  );
}
