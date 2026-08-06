import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatementDetailsPageComponent } from './statement-details-page.component';
import { DocumentStore } from '../store/document.store';
import { StatementComponent } from './statement.component';
import { IDocument } from '../document/document';
import { OfficeStore } from '../store/office.store';
import { DriveAccessService } from '../services/drive-access.service';

describe('StatementDetailsPageComponent', () => {
  let component: StatementDetailsPageComponent;
  let fixture: ComponentFixture<StatementDetailsPageComponent>;

  let documentStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadById: jasmine.Spy;
    uploadStatement: jasmine.Spy;
  };

  let officeStoreSpy: {
    isLoading: ReturnType<typeof signal>;
    data: ReturnType<typeof signal>;
    loadMyOffices: jasmine.Spy;
  };

  let driveAccessServiceSpy: jasmine.SpyObj<DriveAccessService>;

  const id = '123';
  const officeId = 'office-id';

  const mockStatement: Partial<IDocument> = {
    id,
    name: 'Test Statement',
    date: new Date(),
    office: {
      id: officeId,
      name: 'office name',
      manager: {
        id: 'manager-id',
      },
    },
  };

  beforeEach(async () => {
    documentStoreSpy = {
      selected: signal(undefined),
      subErrors: signal(undefined),
      clean: jasmine.createSpy('clean'),
      loadById: jasmine.createSpy('loadById'),
      uploadStatement: jasmine.createSpy('uploadStatement'),
    };
    officeStoreSpy = {
      isLoading: signal(false),
      data: signal(undefined),
      loadMyOffices: jasmine.createSpy('loadMyOffices'),
    };
    driveAccessServiceSpy = jasmine.createSpyObj<DriveAccessService>('DriveAccessService', ['requestAccessIfNeeded']);

    await TestBed.configureTestingModule({
      imports: [StatementDetailsPageComponent],
      providers: [
        { provide: DocumentStore, useValue: documentStoreSpy },
        { provide: OfficeStore, useValue: officeStoreSpy },
        { provide: DriveAccessService, useValue: driveAccessServiceSpy },
      ],
    }).overrideTemplate(StatementComponent, '')
      .overrideTemplate(StatementDetailsPageComponent, `
        @if (statement(); as statement) {
          <app-statement [statement]="statement" [config]="config" />
        }
      `)
      .compileComponents();

    fixture = TestBed.createComponent(StatementDetailsPageComponent);

    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load statement when id emits a value', () => {
    fixture.componentRef.setInput('id', '1234');
    fixture.detectChanges();

    expect(documentStoreSpy.clean).toHaveBeenCalled();
    expect(documentStoreSpy.loadById).toHaveBeenCalledWith('1234');
  });

  it('should pass selected statement to the shared form', () => {
    documentStoreSpy.selected.set(mockStatement);
    fixture.detectChanges();

    const statementComponent = fixture.debugElement.children[0].componentInstance as StatementComponent;

    expect(statementComponent.statement()).toEqual(jasmine.objectContaining({
      id,
      name: mockStatement.name,
      date: mockStatement.date,
      office: mockStatement.office,
    }));
  });

  it('should call upload when statement is received', () => {
    fixture.detectChanges();
    const blob = new Blob([JSON.stringify(mockStatement)], { type: 'text/plain' });
    const fileName = 'fileName';

    component.submit({ officeId, blob, fileName });

    expect(documentStoreSpy.uploadStatement).toHaveBeenCalledWith(officeId, blob, fileName, id);
  });
});
