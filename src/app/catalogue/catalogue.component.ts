import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ɵTypedOrUntyped,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, selectCatalogueState } from '../store/app.states';
import * as fromActionsCatalogue from '../store/catalogue.actions';
import { Catalogue, ICatalogue } from '../interfaces/catalogue';
import { formatBytes, resizeImage } from '../util/file';
import { ActivatedRoute, Router } from '@angular/router';
import { fieldChange, requireMatch, valueChange } from '../util/validators';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IGroupService, ITreatmentGroup } from '../interfaces/treatment';
import { map, startWith } from 'rxjs/operators';
import { SharedModule } from '../shared/shared.module';
import { DragDropDirective } from '../directives/drag-drop.directive';
import { SortByPipe } from '../pipes/sort-by.pipe';
import { BackButtonDirective } from '../directives/back-button.directive';

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.scss'],
  imports: [SharedModule, DragDropDirective, SortByPipe, BackButtonDirective],
})
export class CatalogueComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasXs', { static: false }) canvasXs?: ElementRef<HTMLCanvasElement>;
  @ViewChild('resizedImage', { static: false }) resizedImage?: ElementRef<HTMLImageElement>;
  @Input() catalogue?: ICatalogue;

  form!: UntypedFormGroup;
  id?: string;
  isAddMode: boolean;
  file: any;
  resizedImageDataUrl?: string;

  groups?: IGroupService[];
  filteredGroup?: Observable<IGroupService[] | undefined>;
  errors: any = [];
  private getState: Observable<any>;
  private subscription?: Subscription;
  private readonly language: string;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
              private router: Router, private translate: TranslateService, private snackBar: MatSnackBar,
              private cdRef: ChangeDetectorRef) {
  	this.isAddMode = true;
  	this.getState = this.store.select(selectCatalogueState);
  	this.language = this.translate.currentLang;
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
  		this.store.dispatch(
  			new fromActionsCatalogue.CatalogueSave({ catalogue, file: this.resizedImageDataUrl }),
  		);
  	} else {
  		catalogue.id = this.id;
  		this.catalogue = undefined;
  		this.store.dispatch(
  			new fromActionsCatalogue.CatalogueUpdate({ catalogue, file: this.resizedImageDataUrl }));
  	}
  	return;
  }

  get deleteFile(): void {
  	this.file = undefined;
  	return;
  }

  get deleteImg(): void {
  	if (this.isAddMode) {
  		this.file = undefined;
  		this.resizedImageDataUrl = undefined;
  	} else {
  		const content = this.translate.instant('CATALOGUE.DELETE.MESSAGE', { name: this.catalogue?.name });
  		const undo = this.translate.instant('CATALOGUE.DELETE.UNDO');
  		const snackBarRef = this.snackBar.open(content, undo, { duration: 5000 });
  		const image = this.resizedImageDataUrl;
  		snackBarRef.onAction().subscribe(() => {
  			this.resizedImageDataUrl = image;
  		});

  		this.resizedImageDataUrl = undefined;
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

  displayFnGroup = (group: ITreatmentGroup): string => group ? `${ group.name }` : '';

  keyDownGroup = (event: any): void => {
  	if (event.code === 'Backspace') {
  		this.getForm.group.setValue('');
  	}
  };

  onFileDropped = (files: any): void => {
  	files[0].progress = 0;
  	this.file = files[0];
  	this.uploadFilesSimulator();
  };

  fileBrowseHandler = ($event: any): void => {
  	$event.target.files[0].progress = 0;
  	this.file = $event.target.files[0];
  	this.uploadFilesSimulator();
  };

  formatBytes = (bytes: any, decimals: number): string => formatBytes(bytes, decimals);

  private createForm = (): void => {
  	this.form = this.formBuilder.group({
  		name: ['', Validators.required],
  		description: [''],
  		home: [''],
  		catalog: [''],
  		group: ['', requireMatch],
  	});

  	this.filteredGroup = this.getForm.group.valueChanges.pipe(startWith(''),
  		map(value => typeof value === 'string' ? value : value.name),
  		map(name => name ? this.filterGroup(name) : this.groups ? this.groups.slice() : this.groups),
  	);
  };

  private filterGroup = (name: string): IGroupService[] | undefined => this.groups?.filter(
  	option => option.name?.toLowerCase().indexOf(name.toLowerCase()) === 0,
  );

  private uploadFilesSimulator = (): void => {
  	const fileSizeInMB = this.file.size / (1024 * 1024); // Convert file size to MB
  	const baseInterval = 200; // Base interval in milliseconds

  	const interval = Math.ceil(baseInterval * (fileSizeInMB / 10)); // Calculate interval based on file size

  	setTimeout(() => {
  		const progressInterval = setInterval(() => {
  			if (this.file.progress === 100) {
  				const reader = new FileReader();
  				reader.onload = (e: any) => {
  					const img = new Image();
  					img.onload = () => {
  						this.processImage(img);
  					};
  					img.src = e.target.result;
  				};
  				reader.readAsDataURL(this.file);
  				clearInterval(progressInterval);
  			} else {
  				this.file.progress += 5;
  			}
  		}, interval); // Use calculated interval
  	}, 1000);
  };

  private processImage = (img: HTMLImageElement): void => {
  	this.resizedImageDataUrl = resizeImage(img, this.canvas?.nativeElement || this.canvasXs?.nativeElement);
  	if (this.resizedImage) {
  		this.resizedImage.nativeElement.src = this.resizedImageDataUrl;
  	}
  };

  private clean = (): void => this.store.dispatch(new fromActionsCatalogue.Clean());

  private findGroups = (): void => this.store.dispatch(new fromActionsCatalogue.FindGroups());

  private getCatalogue = (): void => {
  	if (!this.catalogue) {
  		const id = this.route.snapshot.paramMap.get('id');
  		this.store.dispatch(
  			new fromActionsCatalogue.CatalogueFind(id),
  		);
  	}
  };

  private subscribe = (): void => {
  	this.subscription = this.getState.subscribe(state => {
  		this.groups = state.groups;
  		if (state.selected) {
  			this.catalogue = {
  				id: state.selected.id,
  				name: state.selected.name,
  				description: state.selected.description,
  				home: state.selected.home,
  				catalog: state.selected.catalog,
  				groupId: state.selected.treatmentGroup?.id,
  			} as ICatalogue;
  			this.resizedImageDataUrl = `data:${ state.selected.contentType };base64,${ state.selected.blob }`;
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
  			this.router.navigate([this.language, 'catalogues']);
  		}
  	});
  };
}
