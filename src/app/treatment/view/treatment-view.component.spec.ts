import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TreatmentStore } from '../../store/treatment.store';
import { TreatmentViewComponent } from './treatment-view.component';
import { NavigationService } from '../../services/navigation.service';
import { DEFAULT_LOCALE } from '../../util/dates';

describe('TreatmentViewComponent', () => {
  let component: TreatmentViewComponent;
  let fixture: ComponentFixture<TreatmentViewComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let treatmentStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    selected: ReturnType<typeof signal<any>>;
    history: ReturnType<typeof signal<any>>;
    clean: jasmine.Spy;
    loadById: jasmine.Spy;
    loadHistory: jasmine.Spy;
  };

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    treatmentStoreSpy = {
      isLoading: signal(false),
      selected: signal({ id: '123', name: 'Deep Tissue', treatments: [] }),
      history: signal(undefined),
      clean: jasmine.createSpy('clean'),
      loadById: jasmine.createSpy('loadById'),
      loadHistory: jasmine.createSpy('loadHistory'),
    };

    await TestBed.configureTestingModule({
      imports: [TreatmentViewComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: TreatmentStore, useValue: treatmentStoreSpy },
        { provide: NavigationService, useValue: { back: jasmine.createSpy('back') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentViewComponent);
    component = fixture.componentInstance;
    component.language = DEFAULT_LOCALE;

    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clean and load by id on init', () => {
    expect(treatmentStoreSpy.clean).toHaveBeenCalled();
    expect(treatmentStoreSpy.loadById).toHaveBeenCalledWith('123');
  });

  it('should expose the selected treatment', () => {
    expect(component.treatment()).toEqual(jasmine.objectContaining({ id: '123', name: 'Deep Tissue' }));
  });

  it('should navigate to edit on edit()', () => {
    component.edit();

    expect(routerSpy.navigate).toHaveBeenCalledWith([DEFAULT_LOCALE, 'treatments', '123', 'edit']);
  });

  it('should load treatment history', () => {
    component.getHistory('treatment-1');

    expect(treatmentStoreSpy.loadHistory).toHaveBeenCalledWith('123', 'treatment-1');
  });

  it('should include history on the selected treatment', () => {
    treatmentStoreSpy.selected.set({
      id: '123',
      name: 'Deep Tissue',
      treatments: [{ id: 't1', name: 'Treatment 1' }, { id: 't2', name: 'Treatment 2' }],
    });
    treatmentStoreSpy.history.set([{ id: 'history-1' }]);

    component.getHistory('t2');
    fixture.detectChanges();

    const treatments = component.treatment()?.treatments as any[];
    expect(treatments[0].showHistory).toBeUndefined();
    expect(treatments[1].showHistory).toBeTrue();
    expect(treatments[1].history).toEqual([{ id: 'history-1' }]);
  });
});
