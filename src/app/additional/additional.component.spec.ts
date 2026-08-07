import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IAdditionalAll } from './additional';
import { ICommon } from '../interfaces/common';
import { ITreatmentGroupAll } from '../treatment/treatment';
import { NavigationService } from '../services/navigation.service';
import { AdditionalStore } from '../store/additional.store';
import { AdditionalComponent } from './additional.component';
import { DEFAULT_LOCALE } from '../util/dates';
import { TreatmentStore } from '../store/treatment.store';
import { provideTranslateService } from "@ngx-translate/core";

describe('AdditionalComponent', () => {
  let component: AdditionalComponent;
  let fixture: ComponentFixture<AdditionalComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let additionalStoreSpy: {
    subErrors: ReturnType<typeof signal>;
    clean: jasmine.Spy;
  };

  let treatmentStoreStoreSpy: {
    data: ReturnType<typeof signal>;
    loadAllGroups: jasmine.Spy;
  };

  const mockGroup = {
    id: 'g1',
    name: 'Group 1',
    treatments: [],
    selectedTreatments: [],
  };

  const mockAdditional: Partial<IAdditionalAll> = {
    id: '1',
    name: 'Test Additional',
    description: 'Test Description',
    duration: 'PT15M',
    groups: [mockGroup],
  };

  const config: ICommon = {
    title: 'ADDITIONAL.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back', 'navigate'],
      { language: DEFAULT_LOCALE },
    );
    additionalStoreSpy = {
      subErrors: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
    };
    treatmentStoreStoreSpy = {
      data: signal<any>(undefined),
      loadAllGroups: jasmine.createSpy('loadAllGroups'),
    };

    await TestBed.configureTestingModule({
      imports: [AdditionalComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: AdditionalStore, useValue: additionalStoreSpy },
        { provide: TreatmentStore, useValue: treatmentStoreStoreSpy },
      ],
    }).compileComponents();

    fixture = TestBed
      .overrideTemplate(AdditionalComponent, '<input #groupInput />')
      .createComponent(AdditionalComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form when selectedAdditional emits', () => {
    fixture.componentRef.setInput('additional', mockAdditional);
    treatmentStoreStoreSpy.data.set({
      kind: 'list',
      value: [
        mockGroup,
        { id: 'g2', name: 'Group 2', treatments: [], selectedTreatments: [] },
      ],
    });
    fixture.detectChanges();

    expect(component.additional()?.id).toBe('1');
    expect(component.groupsSignal().length).toBe(1);
    expect(component.allGroupsWritableSignal()?.some?.((g: ITreatmentGroupAll) => g.id === 'g2')).toBeTrue();
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [
      { field: 'name', message: 'Name required' },
      { field: 'duration', message: 'Duration required' },
    ];

    additionalStoreSpy.subErrors.set(errors);
    fixture.detectChanges();

    const errs = component.errors();
    expect(errs['name']).toBe('Name required');
    expect(component.getForm.name.hasError('incorrect')).toBeTrue();
    expect(errs['duration']).toBe('Duration required');
    expect(component.getForm.duration.hasError('incorrect')).toBeTrue();
  });

  it('should not emit submitData when form invalid on submit', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    component.getForm.name.setValue('');
    component.getForm.duration.setValue('');
    fixture.detectChanges();

    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit submitData when form is valid', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    component.getForm.name.setValue('New Additional');
    component.getForm.name.markAsDirty();
    component.getForm.description.setValue('New Description');
    component.getForm.description.markAsDirty();
    component.getForm.duration.setValue('00:30');
    component.getForm.duration.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'New Additional',
      description: 'New Description',
      duration: '00:30',
    }));
  });

  it('should emit changed fields when editing an existing additional', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    fixture.componentRef.setInput('additional', { name: 'Old', description: 'old', duration: 'PT15M' } as any);
    fixture.detectChanges();

    component.getForm.name.setValue('Updated Additional');
    component.getForm.name.markAsDirty();
    component.getForm.description.setValue('Updated Description');
    component.getForm.description.markAsDirty();
    component.getForm.duration.setValue('00:45');
    component.getForm.duration.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      description: 'Updated Description',
      duration: '00:45',
      name: 'Updated Additional',
    }));
  });

  it('filteredGroupSignal should return groups when input empty and filter when value set', () => {
    const groups = [
      { id: '1', name: 'Test Group 1' },
      { id: '2', name: 'Another Group' },
      { id: '3', name: 'Test Group 2' },
    ];
    treatmentStoreStoreSpy.data.set({ kind: 'list', value: groups });
    fixture.detectChanges();

    component.getForm.group.setValue(undefined);
    fixture.detectChanges();
    expect(component.filteredGroupSignal()).toEqual(groups);

    component.getForm.group.setValue('Test' as any);
    fixture.detectChanges();
    expect(component.filteredGroupSignal()).toEqual([
      { id: '1', name: 'Test Group 1' },
      { id: '3', name: 'Test Group 2' },
    ]);
  });

  it('remove should remove group and put it back to allGroupsWritableSignal', () => {
    component.groupsSignal.set([
      { id: 'g1', name: 'G1' } as any,
      { id: 'g2', name: 'G2' } as any,
    ]);
    component.allGroupsWritableSignal.set([
      { id: 'g3', name: 'G3' } as any,
    ]);
    fixture.detectChanges();

    component.remove(component.groupsSignal()[1]);
    fixture.detectChanges();

    expect(component.groupsSignal().length).toBe(1);
    expect(component.allGroupsWritableSignal()?.some?.((g: any) => g.id === 'g2')).toBeTrue();
    expect(component.getForm.group.value).toBeUndefined();
  });

  it('selectedGroup should add selected group, remove it from allGroupsWritableSignal and clear input', () => {
    const g1 = { id: 'g1', name: 'G1' } as any;
    component.groupsSignal.set([]);
    component.allGroupsWritableSignal.set([g1, { id: 'g2', name: 'G2' } as any]);

    const event: any = { option: { value: g1 } };

    component.groupInput().nativeElement.value = 'something';

    component.selectedGroup(event);
    fixture.detectChanges();

    expect(component.groupsSignal().some((g: any) => g.id === 'g1')).toBeTrue();
    expect(component.allGroupsWritableSignal()?.some?.((g: any) => g.id === 'g1')).toBeFalse();
    expect(component.getForm.group.value).toBeUndefined();
  });

  it('sortGroups should sort alphabetically ignoring case', () => {
    const allGroups = [
      { name: 'Beta Group', id: '2' },
      { name: 'Alpha Group', id: '1' },
      { name: 'Alpha Group', id: '4' },
      { name: 'Gamma Group', id: '3' },
    ] as any[];
    const response = component.sortGroups(allGroups);
    expect(response[0].name).toBe('Alpha Group');
  });
});
