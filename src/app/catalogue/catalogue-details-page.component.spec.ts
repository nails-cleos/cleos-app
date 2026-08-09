import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogueDetailsPageComponent } from './catalogue-details-page.component';
import { CatalogueStore } from '../store/catalogue.store';
import { ICatalogueAll } from './catalogue';
import { signal } from '@angular/core';
import { CatalogueComponent } from './catalogue.component';
import { TreatmentStore } from '../store/treatment.store';

describe('CatalogueDetailsPageComponent', () => {
  let component: CatalogueDetailsPageComponent;
  let fixture: ComponentFixture<CatalogueDetailsPageComponent>;

  let catalogueStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: Mock;
    loadById: Mock;
    update: Mock;
  };

  let treatmentStoreSpy: {
    data: ReturnType<typeof signal>;
    loadAllGroups: Mock;
  };

  const id = '1';

  const mockCatalogue: ICatalogueAll = {
    id,
    blob: undefined,
    contentType: '',
    image: undefined,
    order: 0,
    name: 'Test Catalogue',
    description: 'Test Description',
    home: true,
    catalog: true,
  };

  beforeEach(async () => {
    catalogueStoreSpy = {
      selected: signal<ICatalogueAll | undefined>(undefined),
      subErrors: signal<any>(undefined),
      clean: vi.fn().mockName('clean'),
      loadById: vi.fn().mockName('loadById'),
      update: vi.fn().mockName('update'),
    };
    treatmentStoreSpy = {
      data: signal<any>([]),
      loadAllGroups: vi.fn().mockName('loadAllGroups'),
    };

    await TestBed.configureTestingModule({
      imports: [CatalogueDetailsPageComponent],
      providers: [
        { provide: CatalogueStore, useValue: catalogueStoreSpy },
        { provide: TreatmentStore, useValue: treatmentStoreSpy },
      ],
    })
      .overrideTemplate(CatalogueComponent, '')
      .overrideTemplate(
        CatalogueDetailsPageComponent,
        `
        @if (catalogue(); as catalogue) {
          <app-catalogue [undoImage]="true" [catalogue]="catalogue" [config]="config" />
        }
      `,
      )
      .compileComponents();

    fixture = TestBed.createComponent(CatalogueDetailsPageComponent);
    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load catalogue when id emits a value', () => {
    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();

    expect(catalogueStoreSpy.clean).toHaveBeenCalled();
    expect(catalogueStoreSpy.loadById).toHaveBeenCalledWith('123');
  });

  it('should pass selected catalogue to the shared form', () => {
    catalogueStoreSpy.selected.set(mockCatalogue);
    fixture.detectChanges();

    const catalogueComponent = fixture.debugElement.children[0]
      .componentInstance as CatalogueComponent;

    expect(catalogueComponent.catalogue()).toEqual(
      expect.objectContaining({
        id,
        name: 'Test Catalogue',
        description: 'Test Description',
        home: true,
        catalog: true,
      }),
    );
  });

  it('should call update when catalogue is received', () => {
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    const resizedImageDataUrl = 'data:image/jpeg;base64,AAA';

    component.submit({ catalogue: mockCatalogue, resizedImageDataUrl });

    expect(catalogueStoreSpy.update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        name: 'Test Catalogue',
        home: true,
        catalog: true,
      }),
      resizedImageDataUrl,
    );
  });
});
