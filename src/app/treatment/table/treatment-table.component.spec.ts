import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreatmentTableComponent } from './treatment-table.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';
import { ITreatmentAll } from '../../interfaces/treatment';
import { ServiceType } from '../../interfaces/room';
import { convertDuration } from '../../util/dates';

describe('TreatmentTableComponent', () => {
  let component: TreatmentTableComponent;
  let fixture: ComponentFixture<TreatmentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentTableComponent, TranslateModule.forRoot()],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');

    fixture = TestBed.createComponent(TreatmentTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.resultsLengthSignal()).toBeDefined();
    expect(component.pageSizeSignal()).toBeDefined();
    expect(component.dataSource()).toBeInstanceOf(MatTableDataSource);
  });

  it('should update dataSource and resultsLength in ngOnChanges', () => {
    const treatments: ITreatmentAll[] = [
      {
        id: '1',
        key: 'key1',
        name: 'Key 1',
        duration: 'PT90M',
        order: 5,
        group: { id: '1', name: 'Group 1' },
        price: 10,
        type: ServiceType.treatment,
      },
      {
        id: '2',
        key: 'key2',
        name: 'Key 2',
        duration: 'PT30M',
        order: 5,
        group: { id: '1', name: 'Group 1' },
        price: 10,
        type: ServiceType.treatment,
      },
    ];

    fixture.componentRef.setInput('treatment', treatments);
    fixture.detectChanges();

    expect(component.dataSource().data.length).toBe(2);
    expect(component.resultsLengthSignal()).toBe(2);

    // The real convertDuration should parse PT90M as 1h30m
    const first = convertDuration('PT90M');
    const second = convertDuration('PT30M');

    expect(component.dataSource().data[0].hour).toBe(first.hour);
    expect(component.dataSource().data[0].minute).toBe(first.minute);

    expect(component.dataSource().data[1].hour).toBe(second.hour);
    expect(component.dataSource().data[1].minute).toBe(second.minute);
  });

  it('should handle treatment with undefined duration', () => {
    const treatments = [{
      id: '3',
      key: 'key3',
      name: 'Key 3',
      order: 5,
      group: { id: '1', name: 'Group 1' },
      price: 10,
      type: ServiceType.treatment,
    } as ITreatmentAll];

    fixture.componentRef.setInput('treatment', treatments);

    expect(component.dataSource().data[0]).toEqual(treatments[0]);
  });
});
