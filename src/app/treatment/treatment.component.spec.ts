import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentComponent } from './treatment.component';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppState } from '../store/app.states';

describe('TreatmentComponent', () => {
  let component: TreatmentComponent;
  let fixture: ComponentFixture<TreatmentComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    state$ = new Subject();

    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [TreatmentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => state$.complete());

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
