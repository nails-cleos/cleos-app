import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { TreatmentStore } from '../store/treatment.store';
import { TreatmentCreatePageComponent } from './treatment-create-page.component';
import { ColorStore } from '../store/color.store';
import { provideTranslateService } from '@ngx-translate/core';

describe('TreatmentCreatePageComponent', () => {
  let component: TreatmentCreatePageComponent;
  let fixture: ComponentFixture<TreatmentCreatePageComponent>;
  let treatmentStoreSpy: {
    subErrors: ReturnType<typeof signal<any>>;
    clean: jasmine.Spy;
    create: jasmine.Spy;
  };
  let colorStoreSpy: {
    data: ReturnType<typeof signal<any>>;
    loadAll: jasmine.Spy;
  };

  beforeEach(async () => {
    treatmentStoreSpy = {
      subErrors: signal(undefined),
      clean: jasmine.createSpy('clean'),
      create: jasmine.createSpy('create'),
    };
    colorStoreSpy = {
      data: signal(undefined),
      loadAll: jasmine.createSpy('loadAll'),
    };

    await TestBed.configureTestingModule({
      imports: [TreatmentCreatePageComponent],
      providers: [
        provideTranslateService(),
        { provide: TreatmentStore, useValue: treatmentStoreSpy },
        { provide: ColorStore, useValue: colorStoreSpy },
        { provide: NavigationService, useValue: { back: jasmine.createSpy('back') } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clean and load colors on init', () => {
    expect(treatmentStoreSpy.clean).toHaveBeenCalled();
    expect(colorStoreSpy.loadAll).toHaveBeenCalled();
  });

  it('should call create when submit receives a treatment group', () => {
    const treatmentGroup = { name: 'Massage' };

    component.submit(treatmentGroup as any);

    expect(treatmentStoreSpy.create).toHaveBeenCalledWith(treatmentGroup as any);
  });
});
