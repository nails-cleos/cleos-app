import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  ɵTypedOrUntyped
} from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, selectColorState } from '../store/app.states';
import { ActivatedRoute, Router } from '@angular/router';
import { Color, IColor } from '../interfaces/color';
import * as fromActionsColor from '../store/color.actions';
import { TranslateService } from '@ngx-translate/core';
import { fieldChange, valueChange } from '../util/validators';
import { SharedModule } from "../shared/shared.module";
import { BackButtonDirective } from "../directives/back-button.directive";

@Component({
  selector: 'app-colors',
  templateUrl: './color.component.html',
  styleUrls: ['./color.component.scss'],
  standalone: true,
  imports: [SharedModule, BackButtonDirective]
})
export class ColorComponent implements OnInit, OnDestroy {
  @Input() color?: IColor;

  id?: string;
  isAddMode: boolean;
  form!: UntypedFormGroup;

  errors: any = [];

  private getState: Observable<any>;
  private subscription: Subscription | undefined;
  private readonly language: string;

  constructor(private store: Store<AppState>, private formBuilder: UntypedFormBuilder, private router: Router,
              private translate: TranslateService, private route: ActivatedRoute, private cdRef: ChangeDetectorRef) {
    this.isAddMode = true;
    this.getState = this.store.select(selectColorState);
    this.language = this.translate.currentLang;
  }

  get getForm(): ɵTypedOrUntyped<any, any, { [p: string]: AbstractControl<any> }> {
    return this.form.controls;
  }

  get submit(): void {
    if (this.form.invalid) {
      return;
    }

    const color: IColor = new Color();
    color.name = fieldChange(this.getForm.name as UntypedFormControl, this.color?.name);
    color.description = valueChange(this.getForm.description.value, this.color?.description);

    if (this.isAddMode) {
      return this.store.dispatch(
        new fromActionsColor.ColorSave(color)
      );
    } else {
      color.id = this.id;
      this.color = undefined;
      return this.store.dispatch(new fromActionsColor.ColorUpdate(color));
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = id;
    }
    this.clean();
    this.createForm();
    this.subscribe();
    this.isAddMode = !this.id;
    if (!this.isAddMode) {
      this.getColor();
    }
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private createForm = (): void => {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['']
    });
  }

  private clean = (): void => this.store.dispatch(new fromActionsColor.Clean());

  private getColor = (): void => {
    if (!this.color) {
      this.store.dispatch(
        new fromActionsColor.ColorFind(this.id)
      );
    }
  }

  private subscribe = (): void => {
    this.subscription = this.getState.subscribe(state => {
      if (state.selected) {
        this.color = {
          id: state.selected.id,
          name: state.selected.name,
          description: state.selected.description
        } as IColor;
        this.form.patchValue(this.color);
      }
      if (state.subErrors) {
        state.subErrors.forEach((value: any) => {
          this.errors[value.field] = value.message;
          this.form.controls[value.field].setErrors({ incorrect: true });
        });
      } else if (state.message) {
        this.router.navigate([this.language, 'colors']);
      }
    });
  }
}
