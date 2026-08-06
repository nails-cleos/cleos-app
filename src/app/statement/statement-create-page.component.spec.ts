import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatementCreatePageComponent } from './statement-create-page.component';
import { IDocument } from '../document/document';
import { DocumentStore } from '../store/document.store';

describe('StatementCreatePageComponent', () => {
  let component: StatementCreatePageComponent;
  let fixture: ComponentFixture<StatementCreatePageComponent>;

  let documentStoreSpy: {
    clean: jasmine.Spy;
    uploadStatement: jasmine.Spy;
  };

  const officeId = 'office-id';
  const mockStatement: Partial<IDocument> = {
    name: 'Test Statement',
    date: new Date(),
  };

  beforeEach(async () => {
    documentStoreSpy = {
      clean: jasmine.createSpy('clean'),
      uploadStatement: jasmine.createSpy('uploadStatement'),
    };

    await TestBed.configureTestingModule({
      imports: [StatementCreatePageComponent],
      providers: [
        { provide: DocumentStore, useValue: documentStoreSpy },
      ],
    }).overrideTemplate(StatementCreatePageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(StatementCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call upload when statement is received', () => {
    fixture.detectChanges();
    const blob = new Blob([JSON.stringify(mockStatement)], { type: 'text/plain' });
    const fileName = 'fileName';

    component.submit({ officeId, blob, fileName });

    expect(documentStoreSpy.uploadStatement).toHaveBeenCalledWith(officeId, blob, fileName);
  });
});
