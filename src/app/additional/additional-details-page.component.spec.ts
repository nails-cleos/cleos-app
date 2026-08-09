import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdditionalDetailsPageComponent } from './additional-details-page.component';
import { AdditionalStore } from '../store/additional.store';
import { IAdditionalAll } from './additional';
import { AdditionalComponent } from './additional.component';
import { TreatmentStore } from '../store/treatment.store';
import { DateAdapter } from '@angular/material/core';
import { NavigationService } from '../services/navigation.service';
import { DEFAULT_LOCALE } from '../util/dates';
import { provideTranslateService } from '@ngx-translate/core';

describe('AdditionalDetailsPageComponent', () => {
  let component: AdditionalDetailsPageComponent;
  let fixture: ComponentFixture<AdditionalDetailsPageComponent>;
  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };

  let additionalStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: Mock;
    loadById: Mock;
    update: Mock;
  };

  let treatmentStoreStoreSpy: {
    data: ReturnType<typeof signal>;
    loadAllGroups: Mock;
  };

  const id = '123';

  const mockAdditional: Partial<IAdditionalAll> = {
    id,
    name: 'Test Additional',
    description: 'Test Description',
    duration: '00:30',
  };

  beforeEach(async () => {
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    additionalStoreSpy = {
      selected: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      clean: vi.fn().mockName('clean'),
      loadById: vi.fn().mockName('loadById'),
      update: vi.fn().mockName('update'),
    };
    treatmentStoreStoreSpy = {
      data: signal<any>(undefined),
      loadAllGroups: vi.fn().mockName('loadAllGroups'),
    };

    await TestBed.configureTestingModule({
      imports: [AdditionalDetailsPageComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: AdditionalStore, useValue: additionalStoreSpy },
        { provide: TreatmentStore, useValue: treatmentStoreStoreSpy },
        { provide: DateAdapter, useValue: { setLocale: vi.fn() } },
      ],
    })
      .overrideTemplate(AdditionalComponent, '<input #groupInput />')
      .overrideTemplate(
        AdditionalDetailsPageComponent,
        `
        @if (additional(); as additional) {
          <app-additional [additional]="additional" [config]="config" />
        }
      `,
      )
      .compileComponents();

    fixture = TestBed.createComponent(AdditionalDetailsPageComponent);

    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load additional when id emits a value', () => {
    fixture.componentRef.setInput('id', '1234');
    fixture.detectChanges();

    expect(additionalStoreSpy.clean).toHaveBeenCalled();
    expect(additionalStoreSpy.loadById).toHaveBeenCalledWith('1234');
  });

  it('should pass selected additional to the shared form', () => {
    additionalStoreSpy.selected.set(mockAdditional);
    fixture.detectChanges();

    const additionalComponent = fixture.debugElement.children[0]
      .componentInstance as AdditionalComponent;

    expect(additionalComponent.additional()).toEqual(
      expect.objectContaining({
        id,
        name: 'Test Additional',
        description: 'Test Description',
        duration: '00:30',
      }),
    );
  });

  it('should call update when additional is received', () => {
    fixture.detectChanges();

    component.submit(mockAdditional);

    expect(additionalStoreSpy.update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        name: 'Test Additional',
        description: 'Test Description',
        duration: '00:30',
      }),
    );
  });
});
