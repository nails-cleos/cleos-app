import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdditionalCreatePageComponent } from './additional-create-page.component';
import { AdditionalStore } from '../store/additional.store';
import { IAdditionalAll } from './additional';

describe('AdditionalCreatePageComponent', () => {
  let component: AdditionalCreatePageComponent;
  let fixture: ComponentFixture<AdditionalCreatePageComponent>;

  let additionalStoreSpy: {
    create: Mock;
  };

  const mockAdditional: Partial<IAdditionalAll> = {
    name: 'Test Additional',
    description: 'Test Description',
    duration: '00:30',
  };

  beforeEach(async () => {
    additionalStoreSpy = {
      create: vi.fn().mockName('create'),
    };

    await TestBed.configureTestingModule({
      imports: [AdditionalCreatePageComponent],
      providers: [{ provide: AdditionalStore, useValue: additionalStoreSpy }],
    })
      .overrideTemplate(AdditionalCreatePageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(AdditionalCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call create when additional is received', () => {
    component.submit(mockAdditional);

    expect(additionalStoreSpy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Additional',
        description: 'Test Description',
        duration: '00:30',
      }),
    );
  });
});
