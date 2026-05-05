import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaqComponent } from './faq.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MainContentService } from '../../services/main-content.service';
import { ActivatedRoute } from '@angular/router';

describe('FaqComponent (with real TranslateService + setTranslation)', () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;

  let translateService: TranslateService;

  let mainContentServiceMock: jasmine.SpyObj<MainContentService>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    mainContentServiceMock = jasmine.createSpyObj('MainContentService', ['configure']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    await TestBed.configureTestingModule({
      imports: [FaqComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MainContentService, useValue: mainContentServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;

    translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');
    translateService.setTranslation('en-GB', {
      FAQS: [
        { question: 'Q1', answer: 'A1' },
        { question: 'Q2', answer: 'A2' },
        { question: 'Q3', answer: 'A3' },
        { question: 'Q4', answer: 'A4' },
      ],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all FAQs when limit = 0', () => {
    fixture.componentRef.setInput('limit', 0);
    fixture.detectChanges();

    expect(component.faqs().length).toBe(4);
    expect(component.faqs().map(f => f.question)).toEqual(['Q1', 'Q2', 'Q3', 'Q4']);
    expect(mainContentServiceMock.configure).toHaveBeenCalledWith(false, 'open');
  });

  it('should load limited FAQs when limit > 0', () => {
    fixture.componentRef.setInput('limit', 3);
    fixture.detectChanges();

    expect(component.faqs().length).toBe(3);
    expect(component.faqs().map(f => f.question)).toEqual(['Q1', 'Q2', 'Q3']);
  });
});
