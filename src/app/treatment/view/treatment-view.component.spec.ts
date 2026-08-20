import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TreatmentStore } from '@app/store/treatment.store';
import { TreatmentViewComponent } from './treatment-view.component';
import { NavigationService } from '@app/services/navigation.service';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { provideTranslateService } from '@ngx-translate/core';

describe('TreatmentViewComponent', () => {
  let component: TreatmentViewComponent;
  let fixture: ComponentFixture<TreatmentViewComponent>;
  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };

  let treatmentStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    selected: ReturnType<typeof signal<any>>;
    history: ReturnType<typeof signal<any>>;
    clean: Mock;
    loadById: Mock;
    loadHistory: Mock;
  };

  beforeEach(async () => {
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    treatmentStoreSpy = {
      isLoading: signal(false),
      selected: signal({ id: '123', name: 'Deep Tissue', treatments: [] }),
      history: signal(undefined),
      clean: vi.fn().mockName('clean'),
      loadById: vi.fn().mockName('loadById'),
      loadHistory: vi.fn().mockName('loadHistory'),
    };

    await TestBed.configureTestingModule({
      imports: [TreatmentViewComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: TreatmentStore, useValue: treatmentStoreSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentViewComponent);
    component = fixture.componentInstance;

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
    expect(component.treatment()).toEqual(
      expect.objectContaining({ id: '123', name: 'Deep Tissue' }),
    );
  });

  it('should navigate to edit on edit()', () => {
    component.edit();

    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'treatments',
      '123',
      'edit',
    ]);
  });

  it('should load treatment history', () => {
    component.getHistory('treatment-1');

    expect(treatmentStoreSpy.loadHistory).toHaveBeenCalledWith(
      '123',
      'treatment-1',
    );
  });

  it('should include history on the selected treatment', () => {
    treatmentStoreSpy.selected.set({
      id: '123',
      name: 'Deep Tissue',
      treatments: [
        { id: 't1', name: 'Treatment 1' },
        { id: 't2', name: 'Treatment 2' },
      ],
    });
    treatmentStoreSpy.history.set([{ id: 'history-1' }]);

    component.getHistory('t2');
    fixture.detectChanges();

    const treatments = component.treatment()?.treatments as any[];
    expect(treatments[0].showHistory).toBeUndefined();
    expect(treatments[1].showHistory).toBe(true);
    expect(treatments[1].history).toEqual([{ id: 'history-1' }]);
  });
});
