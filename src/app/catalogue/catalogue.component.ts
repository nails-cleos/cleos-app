import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { combineLatestWith } from 'rxjs';
import {
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Catalogue,
  CatalogueForm,
  ICatalogue,
  ICatalogueAll,
} from './catalogue';
import { requireMatch } from '../util/validators';
import { ITreatmentGroup, ITreatmentGroupAll } from '../treatment/treatment';
import { map, startWith } from 'rxjs/operators';
import { SortByPipe } from '../pipes/sort-by.pipe';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ICommon, IError } from '../interfaces/common';
import {
  FileDropComponent,
  UploadFile,
} from '../shared/file-drop/file-drop.component';
import {
  MatError,
  MatFormField,
  MatHint,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { TranslatePipe } from '@ngx-translate/core';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { CatalogueStore } from '../store/catalogue.store';
import { BackButtonDirective } from '../directives/back-button.directive';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { TreatmentStore } from '../store/treatment.store';

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatOption,
    TranslatePipe,
    MatAutocomplete,
    MatError,
    MatAutocompleteTrigger,
    SortByPipe,
    FileDropComponent,
    ReactiveFormsModule,
    MatHint,
    MatCheckbox,
    BackButtonDirective,
    MatButton,
    MatIcon,
    SkeletonComponent,
    SkeletonComponent,
  ],
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
  private readonly treatmentStore = inject(TreatmentStore);
  private readonly formBuilder: NonNullableFormBuilder = inject(
    NonNullableFormBuilder,
  );
  private readonly allGroupsSignal = computed(() => {
    const data = this.treatmentStore.data();
    return data?.kind === 'list' ? data.value : undefined;
  });
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
      map((value: any) =>
        !value || typeof value === 'string' ? value : value.code,
      ),
      combineLatestWith(toObservable(this.allGroupsSignal)),
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
    this.treatmentStore.loadAllGroups();

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
          image: `data:${catalogue.contentType};base64,${catalogue.blob}`,
        });
        this.getForm.group.setValue(catalogue.group);
      }
    });

    effect(() => {
      this.getForm.group.setValidators(
        this.selectedHome()
          ? [Validators.required, requireMatch]
          : [requireMatch],
      );
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

    const catalogue = Catalogue.fromForm(this.getForm, this.catalogueSignal());
    this.submitData.emit({ catalogue, resizedImageDataUrl });
  }

  onImageSelected(image?: string) {
    this.image.set(image);
  }

  displayFnGroup = (group: ITreatmentGroup): string =>
    group ? `${group.name}` : '';

  keyDownGroup = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.group.setValue(undefined);
    }
  };

  private filterGroup = (
    name: string,
    groups: ITreatmentGroupAll[],
  ): ITreatmentGroupAll[] | undefined =>
    groups?.filter(
      (option) => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0,
    );
}
