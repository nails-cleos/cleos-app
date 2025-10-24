import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionComponent } from './option.component';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

describe('OptionComponent', () => {
  let component: OptionComponent;
  let fixture: ComponentFixture<OptionComponent>;

  let state$: Subject<any>;
  let params$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<any>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    state$ = new Subject<any>();
    params$ = new Subject<any>();

    storeSpy = jasmine.createSpyObj<Store<any>>('Store', ['dispatch', 'select']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      params: params$.asObservable(),
    });

    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [OptionComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    state$.complete();
    params$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
