import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AppState, selectCatalogueState } from '../store/app.states';
import * as fromActionsCatalogue from '../store/catalogue.actions';
import { Catalogue, ICatalogue } from '../interfaces/catalogue';
import { formatBytes } from '../util/file';

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.scss']
})
export class CatalogueComponent implements OnInit, OnDestroy {
  getState: Observable<any>;
  subscription: Subscription | undefined;
  form!: FormGroup;
  errors: any = [];
  file: any;

  name: FormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private snackBar: MatSnackBar, private store: Store<AppState>, private formBuilder: FormBuilder) {
    this.getState = this.store.select(selectCatalogueState);
  }

  ngOnInit(): void {
    this.createForm();
    this.clean();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }

    const catalogue: ICatalogue = new Catalogue();
    catalogue.name = this.name.value;
    catalogue.description = this.form.value.description;

    this.store.dispatch(
      new fromActionsCatalogue.CatalogueSave({catalogue, file: this.file})
    );
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

  deleteFile(): void {
    this.file = undefined;
  }

  formatBytes(bytes: any, decimals: number): string {
    return formatBytes(bytes, decimals);
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      description: new FormControl()
    });
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsCatalogue.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.errorMessage) {
        this.snackBar.open(state.errorMessage, 'OK', {
          duration: 5000
        });
      }
    });
  }

  private uploadFilesSimulator(): void {
    setTimeout(() => {
      const progressInterval = setInterval(() => {
        if (this.file.progress === 100) {
          clearInterval(progressInterval);
        } else {
          this.file.progress += 5;
        }
      }, 200);
    }, 1000);
  }
}
