import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { combineLatestWith, interval } from 'rxjs';
import { NonNullableFormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { createCatalogue, getCatalogue, updateCatalogue } from '../store/catalogue.actions';
import { Catalogue, ICatalogue } from '../interfaces/catalogue';
import { formatBytes, resizeImage } from '../util/file';
import { Router } from '@angular/router';
import { fieldChange, requireMatch, valueChange } from '../util/validators';
import { TranslateService } from '@ngx-translate/core';
import { ITreatmentGroup, ITreatmentGroupAll } from '../interfaces/treatment';
import { map, startWith } from 'rxjs/operators';
import { SharedModule } from '../shared/shared.module';
import { DragDropDirective } from '../directives/drag-drop.directive';
import { SortByPipe } from '../pipes/sort-by.pipe';
import { BackButtonDirective } from '../directives/back-button.directive';
import { ToastService } from '../services/toast.service';
import {
  getCurrentCatalogueIdPipe,
  getGroupPipe,
  getCatalogueResponsePipe,
  getSelectedCataloguePipe,
  getSubErrorsPipe,
} from '../store/selectors/catalogue.selectors';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { IError } from '../interfaces/common';
import { CatalogueState } from '../store/reducers/catalogue.reducers';

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
  imports: [SharedModule, DragDropDirective, SortByPipe, BackButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueComponent {
  private readonly store: Store<CatalogueState> = inject(Store<CatalogueState>);
  private readonly formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly router: Router = inject(Router);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private catalogueId$ = this.store.pipe(getCurrentCatalogueIdPipe);
  private selectedCatalogue$ = this.store.pipe(getSelectedCataloguePipe);
  private allGroups$ = this.store.pipe(getGroupPipe);
  private subErrors$ = this.store.pipe(getSubErrorsPipe);
  private response$ = this.store.pipe(getCatalogueResponsePipe);

  private catalogueIdSignal = toSignal(this.catalogueId$, { initialValue: null });
  private selectedCatalogueSignal = toSignal(this.selectedCatalogue$);
  private subErrorsSignal = toSignal(this.subErrors$);
  private responseSignal = toSignal(this.response$);

  private catalogueId = computed(() => this.catalogueIdSignal());

  private canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private canvasXs = viewChild<ElementRef<HTMLCanvasElement>>('canvasXs');
  private resizedImage = viewChild<ElementRef<HTMLImageElement>>('resizedImage');

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
  resizedImageDataUrl = signal<string | undefined>(undefined);
  file = signal<{ name: string; size: number; progress: number; raw: File } | undefined>(undefined);

  private readonly language: string = this.translate.currentLang;

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
      if (this.responseSignal()) {
        this.router.navigate([this.language, 'catalogues']);
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
        this.resizedImageDataUrl.set(`data:${catalogue.contentType};base64,${catalogue.blob}`);
        this.getForm.group.setValue(catalogue.treatmentGroup);
      }
    });
  }

  get getForm(): CatalogueForm {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const catalogueSignal = this.catalogueSignal();
    const catalogue: ICatalogue = new Catalogue();
    catalogue.name = fieldChange(this.getForm.name, catalogueSignal?.name);
    catalogue.description = valueChange(this.getForm.description.value, catalogueSignal?.description);
    catalogue.home = fieldChange(this.getForm.home, catalogueSignal?.home);
    catalogue.catalog = fieldChange(this.getForm.catalog, catalogueSignal?.catalog);
    catalogue.groupId = this.getForm.group.value?.id;

    if (this.isAddModeSignal()) {
      this.store.dispatch(createCatalogue({ catalogue, resizedImageDataUrl: this.resizedImageDataUrl()! }));
    } else {
      const id = this.catalogueId()!;
      this.store.dispatch(updateCatalogue({ id, catalogue, resizedImageDataUrl: this.resizedImageDataUrl()! }));
    }
  }

  deleteImg(): void {
    this.file.set(undefined);
    if (this.isAddModeSignal()) {
      this.file.set(undefined);
      this.resizedImageDataUrl.set(undefined);
    } else {
      const content = this.translate.instant('CATALOGUE.DELETE.MESSAGE', { name: this.catalogueSignal()?.name });
      const toastRef = this.toastService.warning(content, 5000, 'button', 'undo');
      const image = this.resizedImageDataUrl();
      toastRef.onAction().subscribe(() => {
        this.resizedImageDataUrl.set(image);
      });

      this.resizedImageDataUrl.set(undefined);
    }
    return;
  }

  displayFnGroup = (group: ITreatmentGroup): string => group ? `${group.name}` : '';

  keyDownGroup = (event: KeyboardEvent): void => {
    if (event.code === 'Backspace') {
      this.getForm.group.setValue(undefined);
    }
  };

  onFileDropped = (files: FileList): void => {
    const rawFile = files[0];
    this.file.set({
      name: rawFile.name,
      size: rawFile.size,
      progress: 0,
      raw: rawFile,
    });
    this.uploadFilesSimulator();
  };

  fileBrowseHandler = (target: EventTarget | null): void => {
    const rawFile = (target as HTMLInputElement)?.files?.[0];
    if (rawFile) {
      this.file.set({
        name: rawFile.name,
        size: rawFile.size,
        progress: 0,
        raw: rawFile,
      });
      this.uploadFilesSimulator();
    }
  };

  formatBytes = (bytes: any, decimals: number): string => formatBytes(bytes, decimals);

  private filterGroup = (
    name: string,
    groups: ITreatmentGroupAll[],
  ): ITreatmentGroupAll[] | undefined => groups?.filter(
    option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0,
  );

  private uploadFilesSimulator = (): void => {
    const currentFile = this.file();
    if (!currentFile) {
      return;
    }

    const totalSteps = 10;
    const baseTime = 400;
    const stepTime = baseTime / totalSteps;

    interval(stepTime)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const file = this.file();
        if (!file) {
          return;
        }

        if (file.progress >= 100) {
          this.file.update(f => f ? { ...f, progress: 100 } : f);
          this.processImageFromFile();
          return;
        }
        this.file.update(f => f ? { ...f, progress: f.progress + 1 } : f);
      });
  };

  private processImageFromFile(): void {
    const currentFile = this.file();
    if (!currentFile) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        this.resizedImageDataUrl.set(resizeImage(img, this.canvas()?.nativeElement || this.canvasXs()?.nativeElement));
        const resizedImage = this.resizedImage();
        if (resizedImage) {
          resizedImage.nativeElement.src = this.resizedImageDataUrl()!;
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(currentFile.raw);
  }
}
