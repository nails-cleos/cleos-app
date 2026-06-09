import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationService } from '../services/navigation.service';
import { TreatmentStore } from '../store/treatment.store';
import { TreatmentCreatePageComponent } from './treatment-create-page.component';

describe('TreatmentCreatePageComponent', () => {
  let component: TreatmentCreatePageComponent;
  let fixture: ComponentFixture<TreatmentCreatePageComponent>;
  let treatmentStoreSpy: {
    colors: ReturnType<typeof signal<any>>;
    subErrors: ReturnType<typeof signal<any>>;
    clean: jasmine.Spy;
    loadColors: jasmine.Spy;
    create: jasmine.Spy;
  };

  beforeEach(async () => {
    treatmentStoreSpy = {
      colors: signal(undefined),
      subErrors: signal(undefined),
      clean: jasmine.createSpy('clean'),
      loadColors: jasmine.createSpy('loadColors'),
      create: jasmine.createSpy('create'),
    };

    await TestBed.configureTestingModule({
      imports: [TreatmentCreatePageComponent, TranslateModule.forRoot()],
      providers: [
        { provide: TreatmentStore, useValue: treatmentStoreSpy },
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
    expect(treatmentStoreSpy.loadColors).toHaveBeenCalled();
  });

  it('should call create when submit receives a treatment group', () => {
    const treatmentGroup = { name: 'Massage' };

    component.submit(treatmentGroup as any);

    expect(treatmentStoreSpy.create).toHaveBeenCalledWith(treatmentGroup as any);
  });
});
