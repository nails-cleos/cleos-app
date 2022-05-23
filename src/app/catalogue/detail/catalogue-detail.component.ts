import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Catalogue, ICatalogue } from '../../interfaces/catalogue';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectCatalogueState } from '../../store/app.states';
import { fieldChange } from '../../util/validators';
import * as fromActionsCatalogue from '../../store/catalogue.actions';
import { formatBytes } from '../../util/file';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-catalogue-detail',
  templateUrl: './catalogue-detail.component.html',
  styleUrls: ['./catalogue-detail.component.scss']
})
export class CatalogueDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() catalogue?: ICatalogue;
  form!: FormGroup;
  subscription?: Subscription;
  getState: Observable<any>;
  errors: any = [];
  file: any;
  img: any;
  showImg = true;

  name: FormControl = new FormControl('', [
    Validators.required
  ]);

  home: FormControl = new FormControl();
  catalog: FormControl = new FormControl();

  constructor(private route: ActivatedRoute, private snackBar: MatSnackBar, private store: Store<AppState>,
              private formBuilder: FormBuilder, private translate: TranslateService, public dialog: MatDialog,
              private router: Router) {
    this.getState = this.store.select(selectCatalogueState);
  }

  get update(): void {
    if (this.form.invalid) {
      return;
    }
    const catalogue: ICatalogue = new Catalogue();
    catalogue.id = this.catalogue?.id;
    catalogue.name = fieldChange(this.name, this.catalogue?.name);
    catalogue.description = fieldChange(this.form.value?.description, this.catalogue?.description);
    catalogue.home = fieldChange(this.home, this.catalogue?.home);
    catalogue.catalog = fieldChange(this.catalog, this.catalogue?.catalog);

    return this.store.dispatch(new fromActionsCatalogue.CatalogueUpdate({catalogue, file: this.file}));
  }

  get deleteFile(): void {
    this.file = undefined;
    return;
  }

  get deleteImg(): void {
    const content = this.translate.instant('CATALOGUE.DELETE.MESSAGE', {name: this.catalogue?.name});
    const undo = this.translate.instant('CATALOGUE.DELETE.UNDO');
    const snackBarRef = this.snackBar.open(content, undo, {
      duration: 5000
    });
    snackBarRef.onAction().subscribe(() => {
      this.showImg = true;
    });

    this.showImg = false;
    return;
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getCatalogue();
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
      name: this.name,
      description: new FormControl(),
      home: this.home,
      catalog: this.catalog
    });
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        this.catalogue = {
          id: state.selected.id,
          name: state.selected.name,
          description: state.selected.description,
          home: state.selected.home,
          catalog: state.selected.catalog
        } as ICatalogue;
        this.img = state.selected.blob;
        this.showImg = !!this.img;
        this.form.patchValue(this.catalogue);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.message) {
        this.router.navigate(['catalogues']);
      }
    });
  }

  private getCatalogue(): void {
    if (!this.catalogue) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsCatalogue.CatalogueFind(id)
      );
    }
  }

  private uploadFilesSimulator(): void {
    setTimeout(() => {
      const progressInterval = setInterval(() => {
        if (this.file) {
          if (this.file.progress === 100) {
            clearInterval(progressInterval);
          } else {
            this.file.progress += 5;
          }
        }
      }, 200);
    }, 500);
  }
}
