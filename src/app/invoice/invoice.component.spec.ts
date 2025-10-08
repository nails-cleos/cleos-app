import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceComponent } from './invoice.component';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

describe('InvoiceComponent', () => {
  let component: InvoiceComponent;
  let fixture: ComponentFixture<InvoiceComponent>;
  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceComponent, TranslateModule.forRoot()],
      providers:[
        { provide: Store, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
