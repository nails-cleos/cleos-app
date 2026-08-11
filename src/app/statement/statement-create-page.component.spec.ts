import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatementCreatePageComponent } from './statement-create-page.component';
import { IDocument } from '../document/document';
import { DocumentStore } from '../store/document.store';
import { DateAdapter } from '@angular/material/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { NgcCookieConsentService } from 'ngx-cookieconsent';
describe('StatementCreatePageComponent', () => {
  let component: StatementCreatePageComponent;
  let fixture: ComponentFixture<StatementCreatePageComponent>;

  let documentStoreSpy: {
    clean: Mock;
    uploadStatement: Mock;
  };

  const officeId = 'office-id';
  const mockStatement: Partial<IDocument> = {
    name: 'Test Statement',
    date: new Date(),
  };

  beforeEach(async () => {
    documentStoreSpy = {
      clean: vi.fn().mockName('clean'),
      uploadStatement: vi.fn().mockName('uploadStatement'),
    };

    const cookieConsentService = {
      getConfig: vi.fn().mockName('NgcCookieConsentService.getConfig'),
      destroy: vi.fn().mockName('NgcCookieConsentService.destroy'),
      init: vi.fn().mockName('NgcCookieConsentService.init'),
    };

    await TestBed.configureTestingModule({
      imports: [StatementCreatePageComponent],
      providers: [
        provideTranslateService(),
        provideRouter([]),
        { provide: DocumentStore, useValue: documentStoreSpy },
        { provide: DateAdapter, useValue: { setLocale: vi.fn() } },
        { provide: NgcCookieConsentService, useValue: cookieConsentService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatementCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call upload when statement is received', () => {
    fixture.detectChanges();
    const blob = new Blob([JSON.stringify(mockStatement)], {
      type: 'text/plain',
    });
    const fileName = 'fileName';

    component.submit({ officeId, blob, fileName });

    expect(documentStoreSpy.uploadStatement).toHaveBeenCalledWith(
      officeId,
      blob,
      fileName,
    );
  });
});
