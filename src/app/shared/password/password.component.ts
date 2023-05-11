import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { confirmedValidator } from '../../util/validators';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {
  @Input() formGroup!: UntypedFormGroup;
  @Input() label!: string;
  @Input() confirmLabel?: string;
  hide = true;
  hideConfirm = true;
  passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])/;
  min = 6;
  max = 30;

  mapCompleted: Map<string, boolean> = new Map();

  ngOnInit(): void {
    this.formGroup.get('password')?.setValidators([
      Validators.required,
      Validators.pattern(this.passwordRegex),
      Validators.minLength(this.min),
      Validators.maxLength(this.max)
    ]);
    this.formGroup.get('confirmPassword')?.setValidators([
      confirmedValidator(this.formGroup.get('password'), this.formGroup.get('confirmPassword'))
    ]);
    this.validate();
  }

  validate(value?: string): void {
    this.mapCompleted.set('AUTH.PASSWORD.LOWER_CASE', !!value?.match(/[a-z]/));
    this.mapCompleted.set('AUTH.PASSWORD.UPPER_CASE', !!value?.match(/[A-Z]/));
    this.mapCompleted.set('AUTH.PASSWORD.DIGIT', !!value?.match(/[0-9]/));
    this.mapCompleted.set('AUTH.PASSWORD.SPECIAL', !!value?.match(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/));
    this.mapCompleted.set('AUTH.PASSWORD.MIN', value ? value.length >= this.min : false);
    this.mapCompleted.set('AUTH.PASSWORD.MAX', value ? value.length < this.max : false);
  }
}
