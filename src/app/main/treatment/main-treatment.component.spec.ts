import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MainState } from '../../store/reducers/main.reducers';
import { MainContentService } from '../../services/main-content.service';
import { MainTreatmentComponent } from './main-treatment.component';

describe('MainTreatmentComponent', () => {
  let component: MainTreatmentComponent;
  let fixture: ComponentFixture<MainTreatmentComponent>;

  let treatmentId$: BehaviorSubject<string | undefined>;
  let treatments$: BehaviorSubject<unknown>;

  let storeSpy: jasmine.SpyObj<Store<MainState>>;
  let translateSpy: jasmine.SpyObj<TranslateService>;
  let mainContentSpy: jasmine.SpyObj<MainContentService>;

  const createComponent = (): void => {
    fixture = TestBed.createComponent(MainTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    treatmentId$ = new BehaviorSubject<string | undefined>(undefined);
    treatments$ = new BehaviorSubject<unknown>([]);

    storeSpy = jasmine.createSpyObj<Store<MainState>>('Store', ['pipe', 'dispatch']);
    storeSpy.pipe.and.returnValue(treatmentId$.asObservable());

    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['stream']);
    translateSpy.stream.and.returnValue(treatments$.asObservable());

    mainContentSpy = jasmine.createSpyObj<MainContentService>('MainContentService', ['configure']);

    await TestBed.configureTestingModule({
      imports: [MainTreatmentComponent],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: MainContentService, useValue: mainContentSpy },
      ],
    }).compileComponents();
  });

  it('should create and configure main content', () => {
    createComponent();

    expect(component).toBeTruthy();
    expect(component.sections()).toBeUndefined();
    expect(mainContentSpy.configure).toHaveBeenCalledWith(false, 'open');
    expect(storeSpy.pipe).toHaveBeenCalled();
    expect(translateSpy.stream).toHaveBeenCalledWith('TREATMENTS');
  });

  it('should return sections when treatment id exists in translations', () => {
    treatments$.next([
      { id: 'biab', translations: { title: 'Title', description: 'Description' } },
    ]);

    createComponent();
    treatmentId$.next('biab');
    fixture.detectChanges();

    expect(component.sections()).toBeDefined();
    expect((component.sections() ?? []).length).toBeGreaterThan(0);
  });

  it('should return undefined sections when treatment id is unknown', () => {
    treatments$.next([
      { id: 'biab', translations: { title: 'Title', description: 'Description' } },
    ]);

    createComponent();
    treatmentId$.next('unknown');
    fixture.detectChanges();

    expect(component.sections()).toBeUndefined();
  });
});
