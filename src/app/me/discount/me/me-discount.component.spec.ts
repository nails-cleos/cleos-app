import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeDiscountComponent } from './me-discount.component';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { Analytics } from '@angular/fire/analytics';
import { AppState } from '../../../store/app.states';

describe('MeDiscountComponent', () => {
  let component: MeDiscountComponent;
  let fixture: ComponentFixture<MeDiscountComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let analyticsSpy: jasmine.SpyObj<Analytics>;

  beforeEach(async () => {
    state$ = new Subject<any>();

    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    analyticsSpy = jasmine.createSpyObj('Analytics', ['logEvent'], {
      app: { options: {} },
      gtagFunction: () => {
      },
    });

    storeSpy.select.and.returnValue(state$.asObservable());
    await TestBed.configureTestingModule({
      imports: [MeDiscountComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Analytics, useValue: analyticsSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
