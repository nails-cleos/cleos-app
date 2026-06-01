import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ICatalogueAll } from '../../interfaces/catalogue';
import {
  catalogueSelected,
  cleanCatalogue,
  deleteCatalogue,
  getAllCatalogues,
  updateCatalogueOrder,
} from '../../store/catalogue.actions';
import { CatalogueListComponent } from './catalogue-list.component';
import { ActivatedRoute } from '@angular/router';
import { CatalogueState } from '../../store/reducers/catalogue.reducers';
import { MatDialog } from '@angular/material/dialog';

describe('CataloguesComponent', () => {
  let component: CatalogueListComponent;
  let fixture: ComponentFixture<CatalogueListComponent>;

  let response$: BehaviorSubject<any>;
  let catalogues$: BehaviorSubject<any>;

  let storeSpy: jasmine.SpyObj<Store<CatalogueState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

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
    response$ = new BehaviorSubject(undefined);
    catalogues$ = new BehaviorSubject(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    // Simulate the selectors using pipe
    let callIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      callIndex++;
      switch (callIndex) {
        case 1:
          return response$.asObservable();
        case 2:
          return catalogues$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [CatalogueListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogueListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    response$.complete();
    catalogues$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter out empty objects and map blob to image', () => {
    catalogues$.next(mockCatalogues);
    const list = component.catalogues();
    expect(list.length).toBe(2);
    expect(list[0].image).toBe('data:image/jpeg;base64,base64-blob-data');
    expect(list[1].image).toBe('data:image/jpeg;base64,base64-blob-data-2');
  });

  it('should dispatch clean and getAllCatalogues on response', () => {
    response$.next(true);
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(cleanCatalogue());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllCatalogues());
  });

  it('should dispatch catalogueSelected when edit is called', () => {
    const catalogue = mockCatalogues[0];
    component.edit(catalogue);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(catalogueSelected({ selected: catalogue }));
  });

  it('should dispatch updateCatalogueOrder when finish is called', () => {
    catalogues$.next(mockCatalogues);
    component.finish();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(updateCatalogueOrder({ catalogues: component.catalogues() }));
  });

  it('should handle drag and drop correctly', () => {
    catalogues$.next(mockCatalogues);
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

    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteCatalogue(
      { id: testCatalogue.id!, name: testCatalogue.name! },
    ));
  });
});
