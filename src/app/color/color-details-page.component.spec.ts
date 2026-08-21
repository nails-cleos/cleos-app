import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorDetailsPageComponent } from './color-details-page.component';
import { ColorStore } from '../store/color.store';
import { IColorAll } from './color';
import { ColorComponent } from './color.component';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { DateAdapter } from '@angular/material/core';

describe('ColorDetailsPageComponent', () => {
  let component: ColorDetailsPageComponent;
  let fixture: ComponentFixture<ColorDetailsPageComponent>;

  let colorStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: Mock;
    loadById: Mock;
    update: Mock;
  };

  const id = '123';

  const mockColor: Partial<IColorAll> = {
    id,
    name: 'Test Color',
    description: 'Test Description',
  };

  beforeEach(async () => {
    colorStoreSpy = {
      selected: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      clean: vi.fn().mockName('clean'),
      loadById: vi.fn().mockName('loadById'),
      update: vi.fn().mockName('update'),
    };

    await TestBed.configureTestingModule({
      imports: [ColorDetailsPageComponent],
      providers: [
        provideTranslateService(),
        provideRouter([]),
        { provide: ColorStore, useValue: colorStoreSpy },
        { provide: DateAdapter, useValue: { setLocale: vi.fn() } },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(ColorDetailsPageComponent);

    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load color when id emits a value', () => {
    fixture.componentRef.setInput('id', '1234');
    fixture.detectChanges();

    expect(colorStoreSpy.clean).toHaveBeenCalled();
    expect(colorStoreSpy.loadById).toHaveBeenCalledWith('1234');
  });

  it('should pass selected color to the shared form', () => {
    colorStoreSpy.selected.set(mockColor);
    fixture.detectChanges();

    const colorComponent = fixture.debugElement.children[0]
      .componentInstance as ColorComponent;

    expect(colorComponent.color()).toEqual(
      expect.objectContaining({
        id,
        name: 'Test Color',
        description: 'Test Description',
      }),
    );
  });

  it('should call update when color is received', () => {
    fixture.detectChanges();

    component.submit(mockColor);

    expect(colorStoreSpy.update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        name: 'Test Color',
        description: 'Test Description',
      }),
    );
  });
});
