import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfficeCreatePageComponent } from './office-create-page.component';
import { OfficeStore } from '../store/office.store';
import { IOfficeAll } from '../interfaces/office';

describe('OfficeCreatePageComponent', () => {
  let component: OfficeCreatePageComponent;
  let fixture: ComponentFixture<OfficeCreatePageComponent>;

  let officeStoreSpy: {
    clean: jasmine.Spy;
    loadManagers: jasmine.Spy;
    create: jasmine.Spy;
  };

  const mockOffice: Partial<IOfficeAll> = {
    name: 'Test Office',
  };

  beforeEach(async () => {
    officeStoreSpy = {
      clean: jasmine.createSpy('clean'),
      loadManagers: jasmine.createSpy('loadManagers'),
      create: jasmine.createSpy('create'),
    };

    await TestBed.configureTestingModule({
      imports: [OfficeCreatePageComponent],
      providers: [
        { provide: OfficeStore, useValue: officeStoreSpy },
      ],
    }).overrideTemplate(OfficeCreatePageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(OfficeCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call create when office is received', () => {
    component.submit(mockOffice);

    expect(officeStoreSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'Test Office',
    }));
  });
});
