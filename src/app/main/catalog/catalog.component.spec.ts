import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogComponent } from './catalog.component';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { MainContentService } from '../../services/main-content.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogueState } from '../../store/reducers/catalogue.reducers';

describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;
  let translateService: TranslateService;

  let catalogues$: BehaviorSubject<any>;

  let storeSpy: jasmine.SpyObj<Store<CatalogueState>>;
  let mainContentServiceSpy: jasmine.SpyObj<MainContentService>;

  beforeEach(async () => {
    catalogues$ = new BehaviorSubject<any>(undefined);

    mainContentServiceSpy = jasmine.createSpyObj('MainContentService', ['configure']);
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return catalogues$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [CatalogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: MainContentService, useValue: mainContentServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');
  });

  afterEach(() => {
    catalogues$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.catalogues()).toEqual([]);
  });

  it('should add catalogues with image and configure mainContent', () => {
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:fake-url');

    const fakeBase64 = 'ZmFrZUJhc2U2NA==';
    const fakeItem = { blob: fakeBase64, contentType: 'text/plain' };
    catalogues$.next([fakeItem]);
    fixture.detectChanges();

    expect(component.catalogues().length).toBe(1);
    expect(component.catalogues()[0].image).toBe('blob:fake-url');
    expect(mainContentServiceSpy.configure).toHaveBeenCalledWith(false, 'open');
  });
});
