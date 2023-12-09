import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, ɵTypedOrUntyped } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, selectCatalogueState } from '../store/app.states';
import * as fromActionsCatalogue from '../store/catalogue.actions';
import { Catalogue, ICatalogue } from '../interfaces/catalogue';
import { formatBytes } from '../util/file';
import { ActivatedRoute, Router } from '@angular/router';
import { fieldChange, requireMatch, valueChange } from '../util/validators';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { IGroupService, ITreatmentGroup } from '../interfaces/treatment';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.scss']
})
export class CatalogueComponent implements OnInit, OnDestroy {

  @Input() catalogue?: ICatalogue;
  form!: UntypedFormGroup;
  id?: string;
  isAddMode: boolean;
  file: any;
  img: any;
  showImg: boolean;

  groups?: IGroupService[];
  filteredGroup?: Observable<IGroupService[] | undefined>;
  errors: any = [];
  private getState: Observable<any>;
  private subscription?: Subscription;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
              private router: Router, private translate: TranslateService, private snackBar: MatSnackBar,
              private cdRef: ChangeDetectorRef, private sanitizer: DomSanitizer) {
    this.isAddMode = true;
    this.showImg = false;
    this.getState = this.store.select(selectCatalogueState);
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }

    const catalogue: ICatalogue = new Catalogue();
    catalogue.name = fieldChange(this.getForm.name as UntypedFormControl, this.catalogue?.name);
    catalogue.description = valueChange(this.getForm.description.value, this.catalogue?.description);
    catalogue.home = fieldChange(this.getForm.home as UntypedFormControl, this.catalogue?.home);
    catalogue.catalog = fieldChange(this.getForm.catalog as UntypedFormControl, this.catalogue?.catalog);
    catalogue.groupId = this.getForm.group.value?.id;

    if (this.isAddMode) {
      return this.store.dispatch(
        new fromActionsCatalogue.CatalogueSave({ catalogue, file: this.file })
      );
    } else {
      catalogue.id = this.id;
      this.catalogue = undefined;
      return this.store.dispatch(new fromActionsCatalogue.CatalogueUpdate({ catalogue, file: this.file }));
    }
  }

  get deleteFile(): void {
    this.file = undefined;
    return;
  }

  get deleteImg(): void {
    if (this.isAddMode) {
      this.file = undefined;
      this.showImg = false;
    } else {
      const content = this.translate.instant('CATALOGUE.DELETE.MESSAGE', { name: this.catalogue?.name });
      const undo = this.translate.instant('CATALOGUE.DELETE.UNDO');
      const snackBarRef = this.snackBar.open(content, undo, {
        duration: 5000
      });
      snackBarRef.onAction().subscribe(() => {
        this.showImg = true;
      });

      this.showImg = false;
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
      this.getCatalogue();
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

  onFileDropped(files: any): void {
    files[0].progress = 0;
    this.file = files[0];
    this.uploadFilesSimulator();
  }

  fileBrowseHandler($event: any): void {
    $event.target.files[0].progress = 0;
    this.file = $event.target.files[0];
    this.uploadFilesSimulator();
  }

  formatBytes(bytes: any, decimals: number): string {
    return formatBytes(bytes, decimals);
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      home: [''],
      catalog: [''],
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

  private uploadFilesSimulator(): void {
    setTimeout(() => {
      const progressInterval = setInterval(() => {
        if (this.file.progress === 100) {
          this.img = this.sanitizer.bypassSecurityTrustUrl(
            window.URL.createObjectURL(this.file)
          );
          this.showImg = true;
          clearInterval(progressInterval);
        } else {
          this.file.progress += 5;
        }
      }, 200);
    }, 1000);
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsCatalogue.Clean()
    );
  }

  private findGroups(): void {
    this.store.dispatch(
      new fromActionsCatalogue.FindGroups()
    );
  }

  private getCatalogue(): void {
    if (!this.catalogue) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsCatalogue.CatalogueFind(id)
      );
    }
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      this.groups = state.groups;
      if (state.selected) {
        console.log(state.selected)
        this.catalogue = {
          id: state.selected.id,
          name: state.selected.name,
          description: state.selected.description,
          home: state.selected.home,
          catalog: state.selected.catalog,
          groupId: state.selected.treatmentGroup?.id
        } as ICatalogue;
        this.img = `data:${state.selected.contentType};base64,${ state.selected.blob }`;
        this.showImg = !!this.img;
        this.form.patchValue(this.catalogue);
        if (state.selected.treatmentGroup) {
          this.getForm.group.setValue(state.selected.treatmentGroup);
        }
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        this.router.navigate(['catalogues']);
      }
    });
  }
}
