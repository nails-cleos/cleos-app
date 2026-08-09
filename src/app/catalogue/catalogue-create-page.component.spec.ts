import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogueCreatePageComponent } from './catalogue-create-page.component';
import { CatalogueStore } from '../store/catalogue.store';
import { ICatalogueAll } from './catalogue';

describe('CatalogueCreatePageComponent', () => {
  let component: CatalogueCreatePageComponent;
  let fixture: ComponentFixture<CatalogueCreatePageComponent>;

  let catalogueStoreSpy: {
    clean: Mock;
    create: Mock;
  };

  const mockCatalogue: ICatalogueAll = {
    blob: undefined,
    contentType: '',
    image: undefined,
    order: 0,
    id: '1',
    name: 'Test Catalogue',
    description: 'Test Description',
    home: true,
    catalog: true,
  };

  beforeEach(async () => {
    catalogueStoreSpy = {
      clean: vi.fn().mockName('clean'),
      create: vi.fn().mockName('create'),
    };

    await TestBed.configureTestingModule({
      imports: [CatalogueCreatePageComponent],
      providers: [{ provide: CatalogueStore, useValue: catalogueStoreSpy }],
    })
      .overrideTemplate(CatalogueCreatePageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(CatalogueCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(catalogueStoreSpy.clean).toHaveBeenCalled();
  });

  it('should call create when catalogue is received', () => {
    const resizedImageDataUrl = 'data:image/jpeg;base64,AAA';

    component.submit({ catalogue: mockCatalogue, resizedImageDataUrl });

    expect(catalogueStoreSpy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Catalogue',
        home: true,
        catalog: true,
      }),
      'data:image/jpeg;base64,AAA',
    );
  });
});
