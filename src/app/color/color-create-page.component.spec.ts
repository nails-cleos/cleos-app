import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorCreatePageComponent } from './color-create-page.component';
import { ColorStore } from '../store/color.store';
import { IColorAll } from './color';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { DateAdapter } from '@angular/material/core';

describe('ColorCreatePageComponent', () => {
  let component: ColorCreatePageComponent;
  let fixture: ComponentFixture<ColorCreatePageComponent>;

  let colorStoreSpy: {
    clean: Mock;
    create: Mock;
  };

  const mockColor: Partial<IColorAll> = {
    name: 'Test Color',
    description: 'Test Description',
  };

  beforeEach(async () => {
    colorStoreSpy = {
      clean: vi.fn().mockName('clean'),
      create: vi.fn().mockName('create'),
    };

    await TestBed.configureTestingModule({
      imports: [ColorCreatePageComponent],
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

    fixture = TestBed.createComponent(ColorCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call create when color is received', () => {
    component.submit(mockColor);

    expect(colorStoreSpy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Color',
        description: 'Test Description',
      }),
    );
  });
});
