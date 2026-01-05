import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainTreatmentComponent } from './main-treatment.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { MainState } from '../../store/reducers/main.reducers';

describe('MainTreatmentComponent', () => {
  let component: MainTreatmentComponent;
  let fixture: ComponentFixture<MainTreatmentComponent>;
  let translateService: TranslateService;

  let storeSpy: jasmine.SpyObj<Store<MainState>>;

  let treatmentId$: BehaviorSubject<any>;

  beforeEach(async () => {
    treatmentId$ = new BehaviorSubject<any>(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return treatmentId$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [MainTreatmentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainTreatmentComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');

    translateService.setTranslation('en-GB', {
      TREATMENTS: [
        { id: 'id', translations: { title: 'Test Title', description: 'Test Description' } },
      ],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.sections()).toBeUndefined();
  });

  it('should load the section when id exist', () => {
    treatmentId$.next('id');
    fixture.detectChanges();
    expect(component.sections()).toBeDefined();
    expect(component.sections()?.length).toBeGreaterThan(0);
  });
});
