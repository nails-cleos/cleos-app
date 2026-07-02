import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorDetailsPageComponent } from './color-details-page.component';
import { ColorStore } from '../store/color.store';
import { IColorAll } from './color';
import { ColorComponent } from './color.component';

describe('ColorDetailsPageComponent', () => {
  let component: ColorDetailsPageComponent;
  let fixture: ComponentFixture<ColorDetailsPageComponent>;

  let colorStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadById: jasmine.Spy;
    update: jasmine.Spy;
  };

  const id = '123';

  const mockColor: Partial<IColorAll> = {
    id,
    name: 'Test Color',
    description: 'Test Description',
  };

  beforeEach(async () => {
    colorStoreSpy = {
      selected: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadById: jasmine.createSpy('loadById'),
      update: jasmine.createSpy('update'),
    };

    await TestBed.configureTestingModule({
      imports: [ColorDetailsPageComponent],
      providers: [
        { provide: ColorStore, useValue: colorStoreSpy },
      ],
    }).overrideTemplate(ColorComponent, '')
      .overrideTemplate(ColorDetailsPageComponent, `
        @if (color(); as color) {
          <app-color [color]="color" [config]="config" />
        }
      `)
      .compileComponents();

    fixture = TestBed.createComponent(ColorDetailsPageComponent);

    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load color when id emits a value', () => {
    fixture.componentRef.setInput('id', '1234');
    fixture.detectChanges();

    expect(colorStoreSpy.clean).toHaveBeenCalled();
    expect(colorStoreSpy.loadById).toHaveBeenCalledWith('1234');
  });

  it('should pass selected color to the shared form', () => {
    colorStoreSpy.selected.set(mockColor);
    fixture.detectChanges();

    const colorComponent = fixture.debugElement.children[0].componentInstance as ColorComponent;

    expect(colorComponent.color()).toEqual(jasmine.objectContaining({
      id,
      name: 'Test Color',
      description: 'Test Description',
    }));
  });

  it('should call update when color is received', () => {
    fixture.detectChanges();

    component.submit(mockColor);

    expect(colorStoreSpy.update).toHaveBeenCalledWith(id, jasmine.objectContaining({
      name: 'Test Color',
      description: 'Test Description',
    }));
  });
});
