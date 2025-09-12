import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalListComponent } from './additional-list.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

describe('AdditionalListComponent', () => {
  let component: AdditionalListComponent;
  let fixture: ComponentFixture<AdditionalListComponent>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('test-customer-id'),
      },
    },
  };

  const mockStore = {
    select: jasmine.createSpy('select').and.returnValue(of({})),
    dispatch: jasmine.createSpy('dispatch'),
  };

  const mockChangeDetectorRef = {
    detectChanges: jasmine.createSpy('detectChanges'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Store, useValue: mockStore },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
