import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniCardComponent } from './mini-card.component';
import { IError } from '@app/interfaces/common';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';
import { provideTranslateService } from "@ngx-translate/core";

describe('MiniCardComponent', () => {
  let component: MiniCardComponent;
  let fixture: ComponentFixture<MiniCardComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    await TestBed.configureTestingModule({
      imports: [MiniCardComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MiniCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(component.title()).toBe('Test Title');
  });

  it('should set all the inputs correctly', () => {
    fixture.componentRef.setInput('icon', 'test-icon');
    fixture.componentRef.setInput('duration', 'PT15M');
    fixture.componentRef.setInput('period', 'This Week');
    fixture.componentRef.setInput('previousPeriod', 'Last Week');
    fixture.componentRef.setInput('projection', 'Projected Value');
    fixture.componentRef.setInput('percentValue', 15);
    fixture.componentRef.setInput('value', 1000);
    fixture.componentRef.setInput('previousPeriodValue', 850);
    fixture.componentRef.setInput('color', 'primary');
    fixture.componentRef.setInput('isIncrease', true);
    fixture.componentRef.setInput('isInfinity', false);
    fixture.componentRef.setInput('isCurrency', true);
    fixture.componentRef.setInput('isProjection', false);
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('error', { message: 'Error occurred' } as IError);

    expect(component.title()).toBe('Test Title');
    expect(component.icon()).toBe('test-icon');
    expect(component.duration()).toBe('PT15M');
    expect(component.period()).toBe('This Week');
    expect(component.previousPeriod()).toBe('Last Week');
    expect(component.projection()).toBe('Projected Value');
    expect(component.percentValue()).toBe(15);
    expect(component.value()).toBe(1000);
    expect(component.previousPeriodValue()).toBe(850);
    expect(component.color()).toBe('primary');
    expect(component.isIncrease()).toBeTrue();
    expect(component.isInfinity()).toBeFalse();
    expect(component.isCurrency()).toBeTrue();
    expect(component.isProjection()).toBeFalse();
    expect(component.isLoading()).toBeFalse();
    expect(component.error()).toEqual({ message: 'Error occurred' } as IError);
    expect(component.language).toEqual(DEFAULT_LOCALE);
  });
});
