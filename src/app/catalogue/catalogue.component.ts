import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { combineLatestWith } from 'rxjs';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Catalogue, ICatalogue, ICatalogueAll } from '../interfaces/catalogue';
import { fieldChange, requireMatch, valueChange } from '../util/validators';
import { ITreatmentGroup, ITreatmentGroupAll } from '../interfaces/treatment';
import { map, startWith } from 'rxjs/operators';
import { SortByPipe } from '../pipes/sort-by.pipe';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../interfaces/common';
import { FileDropComponent, UploadFile } from '../shared/file-drop/file-drop.component';
import { MatError, MatFormField, MatHint, MatInput, MatLabel } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { TranslatePipe } from '@ngx-translate/core';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { CatalogueStore } from '../store/catalogue.store';
import { BackButtonDirective } from '../directives/back-button.directive';
import { ICommon } from '../interfaces/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

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
  imports: [MatFormField, MatLabel, MatInput, MatOption, TranslatePipe,
    MatAutocomplete, MatError, MatAutocompleteTrigger, SortByPipe, FileDropComponent, ReactiveFormsModule, MatHint,
    MatCheckbox, BackButtonDirective, MatButton, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueComponent {
  config = input.required<ICommon>();
  undoImage = input(false);
  catalogue = input<ICatalogueAll | undefined>();
  submitData = output<{
    catalogue: ICatalogue;
    resizedImageDataUrl: string;
  }>();

  private readonly catalogueStore = inject(CatalogueStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly allGroups$ = toObservable(this.catalogueStore.groups);
  private readonly subErrorsSignal = this.catalogueStore.subErrors;

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

  catalogueSignal = computed(() => this.catalogue());

  filteredGroupSignal = toSignal(
    this.getForm.group.valueChanges.pipe(
      startWith(''),
      map((value: any) => !value || typeof value === 'string' ? value : value.code),
      combineLatestWith(this.allGroups$),
      map(([name, groups]) => {
        if (name) {
          return groups ? this.filterGroup(name, groups) : groups;
        } else {
          return groups ? groups.slice() : groups;
        }
      }),
    ),
  );
  errors = signal<Record<string, unknown>>({});
  file = signal<UploadFile | undefined>(undefined);
  image = signal<string | undefined>(undefined);

  private selectedHome = toSignal(this.getForm.home.valueChanges);

  constructor() {
    this.catalogueStore.loadGroups();

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
      const catalogue = this.catalogue();
      if (catalogue) {
        this.form.patchValue(catalogue);
        this.file.set({
          name: catalogue.name,
          size: 0,
          progress: 100,
          image: `data:${ catalogue.contentType };base64,${ catalogue.blob }`,
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

  get getConfig(): ICommon {
    return this.config();
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

    this.submitData.emit({ catalogue, resizedImageDataUrl });
  }

  onImageSelected(image?: string) {
    this.image.set(image);
  }

  displayFnGroup = (group: ITreatmentGroup): string => group ? `${ group.name }` : '';

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
