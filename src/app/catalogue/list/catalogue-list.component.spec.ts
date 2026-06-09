import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ICatalogueAll } from '../catalogue';
import { CatalogueListComponent } from './catalogue-list.component';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogueStore } from '../../store/catalogue.store';

describe('CatalogueListComponent', () => {
  let component: CatalogueListComponent;
  let fixture: ComponentFixture<CatalogueListComponent>;

  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let routerSpy: jasmine.SpyObj<Router>;
  let translate: TranslateService;
  let catalogueStoreSpy: {
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    clearResponse: jasmine.Spy;
    loadAllCatalogues: jasmine.Spy;
    sort: jasmine.Spy;
    delete: jasmine.Spy;
  };

  const mockCatalogues: ICatalogueAll[] = [
    {
      id: '1',
      name: 'Red Catalogue',
      description: 'Red catalogue description',
      order: 1,
      contentType: 'image/jpeg',
      blob: 'base64-blob-data',
      home: true,
      catalog: true,
      image: undefined,
    },
    {
      id: '2',
      name: 'Blue Catalogue',
      description: 'Blue catalogue description',
      order: 2,
      contentType: 'image/png',
      blob: 'base64-blob-data-2',
      home: false,
      catalog: true,
      image: undefined,
    },
    {} as ICatalogueAll, // empty object to test filter
  ];

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    catalogueStoreSpy = {
      data: signal<any>(undefined),
      response: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      clearResponse: jasmine.createSpy('clearResponse'),
      loadAllCatalogues: jasmine.createSpy('loadAllCatalogues'),
      sort: jasmine.createSpy('sort'),
      delete: jasmine.createSpy('delete'),
    };
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    await TestBed.configureTestingModule({
      imports: [CatalogueListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: CatalogueStore, useValue: catalogueStoreSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture = TestBed.createComponent(CatalogueListComponent);
    component = fixture.componentInstance;
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter out empty objects and map blob to image', () => {
    catalogueStoreSpy.data.set(mockCatalogues);
    fixture.detectChanges();

    const list = component.catalogues();
    expect(list.length).toBe(2);
    expect(list[0].image).toBe('data:image/jpeg;base64,base64-blob-data');
    expect(list[1].image).toBe('data:image/jpeg;base64,base64-blob-data-2');
  });

  it('should clear response and reload catalogues on response', () => {
    catalogueStoreSpy.clearResponse.calls.reset();
    catalogueStoreSpy.loadAllCatalogues.calls.reset();
    catalogueStoreSpy.response.set(true);
    fixture.detectChanges();

    expect(catalogueStoreSpy.clearResponse).toHaveBeenCalled();
    expect(catalogueStoreSpy.loadAllCatalogues).toHaveBeenCalled();
  });

  it('should navigate when edit is called', () => {
    const catalogue = mockCatalogues[0];
    component.edit(catalogue);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'catalogues', catalogue.id]);
  });

  it('should update catalogue order when finish is called', () => {
    catalogueStoreSpy.data.set(mockCatalogues);
    fixture.detectChanges();

    component.finish();
    expect(catalogueStoreSpy.sort).toHaveBeenCalledWith(component.catalogues());
  });

  it('should handle drag and drop correctly', () => {
    catalogueStoreSpy.data.set(mockCatalogues);
    fixture.detectChanges();

    const event: CdkDragDrop<ICatalogueAll[]> = { previousIndex: 0, currentIndex: 1 } as any;
    const listBefore = [...component.catalogues()];
    component.drop(event);
    const listAfter = component.catalogues();
    expect(listAfter[0].id).toBe(listBefore[1].id);
    expect(listAfter[1].id).toBe(listBefore[0].id);
  });

  it('should call delete method without errors', () => {
    const testCatalogue = mockCatalogues[0];

    dialogSpy.open.and.returnValue({ afterClosed: () => of(testCatalogue) } as any);

    component.delete(testCatalogue);

    expect(dialogSpy.open).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'CATALOGUE.DELETED.TITLE',
          content: 'CATALOGUE.DELETED.CONTENT',
          value: testCatalogue,
          variant: 'warning',
        },
      }));

    expect(catalogueStoreSpy.delete).toHaveBeenCalledWith(testCatalogue.id!, testCatalogue.name!);
  });
});
