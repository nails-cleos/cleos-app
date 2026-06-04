import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfficeDetailsPageComponent } from './office-details-page.component';
import { OfficeStore } from '../store/office.store';
import { IOfficeAll } from '../interfaces/office';
import { OfficeComponent } from './office.component';
import { TranslateModule } from '@ngx-translate/core';

describe('OfficeDetailsPageComponent', () => {
  let component: OfficeDetailsPageComponent;
  let fixture: ComponentFixture<OfficeDetailsPageComponent>;

  let officeStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadById: jasmine.Spy;
    update: jasmine.Spy;
  };

  const id = '123';

  const mockOffice: Partial<IOfficeAll> = {
    id,
    name: 'Test Office',
  };

  beforeEach(async () => {
    officeStoreSpy = {
      selected: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadById: jasmine.createSpy('loadById'),
      update: jasmine.createSpy('update'),
    };

    await TestBed.configureTestingModule({
      imports: [OfficeDetailsPageComponent, TranslateModule.forRoot()],
      providers: [
        { provide: OfficeStore, useValue: officeStoreSpy },
      ],
    }).overrideTemplate(OfficeComponent, '')
      .overrideTemplate(OfficeDetailsPageComponent, `
        @if (office(); as office) {
          <app-office [office]="office" [config]="config" />
        }
      `)
      .compileComponents();

    fixture = TestBed.createComponent(OfficeDetailsPageComponent);

    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load office when id emits a value', () => {
    fixture.componentRef.setInput('id', '1234');
    fixture.detectChanges();

    expect(officeStoreSpy.clean).toHaveBeenCalled();
    expect(officeStoreSpy.loadById).toHaveBeenCalledWith('1234');
  });

  it('should pass selected office to the shared form', () => {
    officeStoreSpy.selected.set(mockOffice);
    fixture.detectChanges();

    const officeComponent = fixture.debugElement.children[0].componentInstance as OfficeComponent;

    expect(officeComponent.office()).toEqual(jasmine.objectContaining({
      id,
      name: 'Test Office',
    }));
  });

  it('should call update when office is received', () => {
    fixture.detectChanges();

    component.submit(mockOffice);

    expect(officeStoreSpy.update).toHaveBeenCalledWith(id, jasmine.objectContaining({
      name: 'Test Office',
    }));
  });
});
