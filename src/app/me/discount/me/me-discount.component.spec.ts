import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeDiscountComponent } from './me-discount.component';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { Analytics } from '@angular/fire/analytics';

describe('MeDiscountComponent', () => {
  let component: MeDiscountComponent;
  let fixture: ComponentFixture<MeDiscountComponent>;
  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const mockAnalytics = {
    app: {
      options: {},
    },
  } as Analytics;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeDiscountComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: Analytics, useValue: mockAnalytics },
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
