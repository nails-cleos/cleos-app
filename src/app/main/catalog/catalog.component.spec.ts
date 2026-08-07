import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogComponent } from './catalog.component';
import { signal } from '@angular/core';
import { CatalogueStore } from '@app/store/catalogue.store';
import { provideTranslateService } from "@ngx-translate/core";

describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;

  let catalogueStoreSpy: {
    data: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadCatalogs: jasmine.Spy;
  };

  beforeEach(async () => {
    catalogueStoreSpy = {
      data: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadCatalogs: jasmine.createSpy('loadCatalogs'),
    };

    await TestBed.configureTestingModule({
      imports: [CatalogComponent],
      providers: [
        provideTranslateService(),
        { provide: CatalogueStore, useValue: catalogueStoreSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.catalogues()).toEqual([]);
  });

  it('should add catalogues with image', () => {
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:fake-url');

    const fakeBase64 = 'ZmFrZUJhc2U2NA==';
    const fakeItem = { blob: fakeBase64, contentType: 'text/plain' };
    catalogueStoreSpy.data.set([fakeItem]);
    fixture.detectChanges();

    expect(component.catalogues().length).toBe(1);
    expect(component.catalogues()[0].image).toBe('blob:fake-url');
  });
});
