import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Color, IColor } from '../../interfaces/color';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, selectColorState } from '../../store/app.states';
import { MatDialog } from '@angular/material/dialog';
import { fieldChange, valueChange } from '../../util/validators';
import * as fromActionsColor from '../../store/color.actions';

@Component({
  selector: 'app-color-detail',
  templateUrl: './color-detail.component.html',
  styleUrls: ['./color-detail.component.scss']
})
export class ColorDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() color?: IColor;

  form!: UntypedFormGroup;

  name: UntypedFormControl = new UntypedFormControl('', [
    Validators.required
  ]);

  errors: any = [];

  private subscription?: Subscription;
  private getState: Observable<any>;

  constructor(private route: ActivatedRoute, private store: Store<AppState>, private formBuilder: UntypedFormBuilder,
              private router: Router, public dialog: MatDialog) {
    this.getState = this.store.select(selectColorState);
  }

  get update(): void {
    if (this.form.invalid) {
      return;
    }
    const color: IColor = new Color();
    color.id = this.color?.id;

    color.name = fieldChange(this.name, this.color?.name);
    color.description = valueChange(this.form.value?.description, this.color?.description);

    return this.store.dispatch(new fromActionsColor.ColorUpdate(color));
  }

  ngOnInit(): void {
    this.createForm();
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.getColor();
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      name: this.name,
      description: new UntypedFormControl()
    });
  }

  private subscribe(): void {
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
          this.form.controls[value.field].setErrors({incorrect: true});
        });
      } else if (state.message) {
        this.router.navigate(['colors']);
      }
    });
  }

  private getColor(): void {
    if (!this.color) {
      const id = this.route.snapshot.paramMap.get('id');
      this.store.dispatch(
        new fromActionsColor.ColorFind(id)
      );
    }
  }
}

