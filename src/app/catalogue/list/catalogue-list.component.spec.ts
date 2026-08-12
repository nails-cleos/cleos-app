import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ICatalogueAll } from '../catalogue';
import { CatalogueListComponent } from './catalogue-list.component';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { CatalogueStore } from '@app/store/catalogue.store';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';

describe('CatalogueListComponent', () => {
  let component: CatalogueListComponent;
  let fixture: ComponentFixture<CatalogueListComponent>;
  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };

  let activatedRouteSpy: {
    snapshot: {
      paramMap: {
        get: ReturnType<typeof vi.fn>;
      };
    };
  };
  let dialogSpy: Pick<MatDialog, 'open'> & {
    open: ReturnType<typeof vi.fn>;
  };
  let catalogueStoreSpy: {
    data: ReturnType<typeof signal>;
    isLoading: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    clean: Mock;
    clearResponse: Mock;
    loadAllCatalogues: Mock;
    sort: Mock;
    delete: Mock;
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
  ];

  beforeEach(async () => {
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    dialogSpy = {
      open: vi.fn().mockName('MatDialog.open'),
    };
    catalogueStoreSpy = {
      data: signal<any>(undefined),
      isLoading: signal(false),
      response: signal<any>(undefined),
      clean: vi.fn().mockName('clean'),
      clearResponse: vi.fn().mockName('clearResponse'),
      loadAllCatalogues: vi.fn().mockName('loadAllCatalogues'),
      sort: vi.fn().mockName('sort'),
      delete: vi.fn().mockName('delete'),
    };
    activatedRouteSpy = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockName('ParamMap.get'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [CatalogueListComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: CatalogueStore, useValue: catalogueStoreSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(CatalogueListComponent);
    component = fixture.componentInstance;
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map blob to image', () => {
    catalogueStoreSpy.data.set(mockCatalogues);
    fixture.detectChanges();

    const list = component.catalogues();
    expect(list.length).toBe(2);
    expect(list[0].image).toBe('data:image/jpeg;base64,base64-blob-data');
    expect(list[1].image).toBe('data:image/jpeg;base64,base64-blob-data-2');
  });

  it('should clear response and reload catalogues on response', () => {
    catalogueStoreSpy.clearResponse.mockClear();
    catalogueStoreSpy.loadAllCatalogues.mockClear();
    catalogueStoreSpy.response.set(true);
    fixture.detectChanges();

    expect(catalogueStoreSpy.clearResponse).toHaveBeenCalled();
    expect(catalogueStoreSpy.loadAllCatalogues).toHaveBeenCalled();
  });

  it('should navigate when edit is called', () => {
    const catalogue = mockCatalogues[0];
    component.edit(catalogue);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'catalogues',
      catalogue.id,
    ]);
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

    const event: CdkDragDrop<ICatalogueAll[]> = {
      previousIndex: 0,
      currentIndex: 1,
    } as any;
    const listBefore = [...component.catalogues()];
    component.drop(event);
    const listAfter = component.catalogues();
    expect(listAfter[0].id).toBe(listBefore[1].id);
    expect(listAfter[1].id).toBe(listBefore[0].id);
  });

  it('should call delete method without errors', () => {
    const testCatalogue = mockCatalogues[0];

    dialogSpy.open.mockReturnValue({
      afterClosed: () => of(testCatalogue),
    } as any);

    component.delete(testCatalogue);

    expect(dialogSpy.open).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        data: {
          title: 'CATALOGUE.DELETED.TITLE',
          content: 'CATALOGUE.DELETED.CONTENT',
          value: testCatalogue,
          variant: 'warning',
        },
      }),
    );

    expect(catalogueStoreSpy.delete).toHaveBeenCalledWith(
      testCatalogue.id!,
      testCatalogue.name!,
    );
  });
});
