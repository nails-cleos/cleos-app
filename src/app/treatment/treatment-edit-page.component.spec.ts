import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { TreatmentStore } from '../store/treatment.store';
import { TreatmentEditPageComponent } from './treatment-edit-page.component';
import { ColorStore } from '../store/color.store';
import { provideTranslateService } from "@ngx-translate/core";

describe('TreatmentEditPageComponent', () => {
  let component: TreatmentEditPageComponent;
  let fixture: ComponentFixture<TreatmentEditPageComponent>;
  let treatmentStoreSpy: {
    subErrors: ReturnType<typeof signal<any>>;
    selected: ReturnType<typeof signal<any>>;
    clean: jasmine.Spy;
    loadById: jasmine.Spy;
    update: jasmine.Spy;
  };
  let colorStoreSpy: {
    data: ReturnType<typeof signal<any>>;
    loadAll: jasmine.Spy;
  };

  beforeEach(async () => {
    treatmentStoreSpy = {
      subErrors: signal(undefined),
      selected: signal({ id: '123', name: 'Deep Tissue' }),
      clean: jasmine.createSpy('clean'),
      loadById: jasmine.createSpy('loadById'),
      update: jasmine.createSpy('update'),
    };
    colorStoreSpy = {
      data: signal(undefined),
      loadAll: jasmine.createSpy('loadAll'),
    };

    await TestBed.configureTestingModule({
      imports: [TreatmentEditPageComponent],
      providers: [
        provideTranslateService(),
        { provide: TreatmentStore, useValue: treatmentStoreSpy },
        { provide: ColorStore, useValue: colorStoreSpy },
        { provide: NavigationService, useValue: { back: jasmine.createSpy('back') } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentEditPageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clean, load colors, and load by id on init', () => {
    expect(treatmentStoreSpy.clean).toHaveBeenCalled();
    expect(colorStoreSpy.loadAll).toHaveBeenCalled();
    expect(treatmentStoreSpy.loadById).toHaveBeenCalledWith('123');
  });

  it('should expose the selected treatment', () => {
    expect(component.treatment()).toEqual({ id: '123', name: 'Deep Tissue' });
  });

  it('should call update when submit receives a treatment group', () => {
    const treatmentGroup = { name: 'Updated Treatment' };

    component.submit(treatmentGroup as any);

    expect(treatmentStoreSpy.update).toHaveBeenCalledWith('123', treatmentGroup as any);
  });
});
