import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogueDetailsPageComponent } from './catalogue-details-page.component';
import { CatalogueStore } from '../store/catalogue.store';
import { ICatalogueAll } from '../interfaces/catalogue';
import { signal } from '@angular/core';
import { CatalogueComponent } from './catalogue.component';

describe('CatalogueDetailsPageComponent', () => {
  let component: CatalogueDetailsPageComponent;
  let fixture: ComponentFixture<CatalogueDetailsPageComponent>;

  let catalogueStoreSpy: {
    selected: ReturnType<typeof signal>;
    groups: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadGroups: jasmine.Spy;
    loadById: jasmine.Spy;
    update: jasmine.Spy;
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
      groups: signal<any>([]),
      subErrors: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadGroups: jasmine.createSpy('loadGroups'),
      loadById: jasmine.createSpy('loadById'),
      update: jasmine.createSpy('update'),
    };

    await TestBed.configureTestingModule({
      imports: [CatalogueDetailsPageComponent],
      providers: [
        { provide: CatalogueStore, useValue: catalogueStoreSpy },
      ],
    }).overrideTemplate(CatalogueComponent, '')
      .overrideTemplate(CatalogueDetailsPageComponent, `
        @if (catalogue(); as catalogue) {
          <app-catalogue [undoImage]="true" [catalogue]="catalogue" [config]="config" />
        }
      `)
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

    const catalogueComponent = fixture.debugElement.children[0].componentInstance as CatalogueComponent;

    expect(catalogueComponent.catalogue()).toEqual(jasmine.objectContaining({
      id,
      name: 'Test Catalogue',
      description: 'Test Description',
      home: true,
      catalog: true,
    }));
  });

  it('should call update when catalogue is received', () => {
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    const resizedImageDataUrl = 'data:image/jpeg;base64,AAA';

    component.submit({ catalogue: mockCatalogue, resizedImageDataUrl });

    expect(catalogueStoreSpy.update).toHaveBeenCalledWith(
      id,
      jasmine.objectContaining({
        name: 'Test Catalogue',
        home: true,
        catalog: true,
      }),
      resizedImageDataUrl);
  });
});
