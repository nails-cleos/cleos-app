import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AdditionalDetailsPageComponent } from './additional-details-page.component';
import { AdditionalStore } from '../store/additional.store';
import { IAdditionalAll } from './additional';
import { AdditionalComponent } from './additional.component';

describe('AdditionalDetailsPageComponent', () => {
  let component: AdditionalDetailsPageComponent;
  let fixture: ComponentFixture<AdditionalDetailsPageComponent>;

  let additionalStoreSpy: {
    selected: ReturnType<typeof signal>;
    groups: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadGroups: jasmine.Spy;
    loadById: jasmine.Spy;
    update: jasmine.Spy;
  };

  const id = '123';

  const mockAdditional: Partial<IAdditionalAll> = {
    id,
    name: 'Test Additional',
    description: 'Test Description',
    duration: '00:30',
  };

  beforeEach(async () => {
    additionalStoreSpy = {
      selected: signal<any>(undefined),
      groups: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadGroups: jasmine.createSpy('loadGroups'),
      loadById: jasmine.createSpy('loadById'),
      update: jasmine.createSpy('update'),
    };

    await TestBed.configureTestingModule({
      imports: [AdditionalDetailsPageComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AdditionalStore, useValue: additionalStoreSpy },
      ],
    }).overrideTemplate(AdditionalComponent, '<input #groupInput />')
      .overrideTemplate(AdditionalDetailsPageComponent, `
        @if (additional(); as additional) {
          <app-additional [additional]="additional" [config]="config" />
        }
      `)
      .compileComponents();

    fixture = TestBed.createComponent(AdditionalDetailsPageComponent);

    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load additional when id emits a value', () => {
    fixture.componentRef.setInput('id', '1234');
    fixture.detectChanges();

    expect(additionalStoreSpy.clean).toHaveBeenCalled();
    expect(additionalStoreSpy.loadById).toHaveBeenCalledWith('1234');
  });

  it('should pass selected additional to the shared form', () => {
    additionalStoreSpy.selected.set(mockAdditional);
    fixture.detectChanges();

    const additionalComponent = fixture.debugElement.children[0].componentInstance as AdditionalComponent;

    expect(additionalComponent.additional()).toEqual(jasmine.objectContaining({
      id,
      name: 'Test Additional',
      description: 'Test Description',
      duration: '00:30',
    }));
  });

  it('should call update when additional is received', () => {
    fixture.detectChanges();

    component.submit(mockAdditional);

    expect(additionalStoreSpy.update).toHaveBeenCalledWith(id, jasmine.objectContaining({
      name: 'Test Additional',
      description: 'Test Description',
      duration: '00:30',
    }));
  });
});
