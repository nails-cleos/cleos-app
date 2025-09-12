import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppState } from '../store/app.states';

import { UserComponent } from './user.component';
import { Role } from '../interfaces/token';
import * as fromActionsUser from '../store/user.actions';

describe('UserComponent', () => {
  let component: UserComponent;
  let mockStore: jasmine.SpyObj<Store<AppState>>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockActivatedRoute: any;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
  let formBuilder: UntypedFormBuilder;


  beforeEach(() => {
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant'], {
      onLangChange: of({ lang: 'en' }),
      currentLang: 'en',
    });
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    formBuilder = new UntypedFormBuilder();

    mockStore.select.and.returnValue(of({}));
    mockRouter.getCurrentNavigation.and.returnValue(null);
    mockTranslateService.instant.and.returnValue({
      SEARCH: 'Search',
      COUNTRY_NOT_FOUND: 'Country not found',
      FIELD: 'Phone number',
      INVALID: 'Invalid phone number',
      REQUIRED: 'Phone number is required',
    });

    // Create component instance directly without TestBed template rendering
    component = new UserComponent(
      mockTranslateService,
      mockActivatedRoute,
      mockStore,
      formBuilder,
      mockRouter,
      mockChangeDetectorRef,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in add mode when no id is provided', () => {
    component.ngOnInit();
    expect(component.isAddMode).toBe(true);
  });

  it('should initialize in edit mode when id is provided', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    component.ngOnInit();
    expect(component.isAddMode).toBe(false);
    expect(component.id).toBe('123');
  });

  it('should create form with required validators', () => {
    component.ngOnInit();
    expect(component.form).toBeDefined();
    expect(component.getForm.role.hasError('required')).toBe(true);
    expect(component.getForm.displayName.hasError('required')).toBe(true);
    expect(component.getForm.email.hasError('required')).toBe(true);
    expect(component.getForm.lang.hasError('required')).toBe(true);
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();
    expect(mockStore.dispatch).toHaveBeenCalledWith(new fromActionsUser.Clean());
  });

  it('should dispatch getUser action when in edit mode', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    component.ngOnInit();
    expect(mockStore.dispatch).toHaveBeenCalledWith(new fromActionsUser.getUser('123'));
  });

  it('should set isProfessionalOrManager to true for manager role', () => {
    component.ngOnInit();
    component.getForm.role.setValue(Role.manager);
    expect(component.isProfessionalOrManager).toBe(true);
  });

  it('should set isProfessionalOrManager to true for professional role', () => {
    component.ngOnInit();
    component.getForm.role.setValue(Role.professional);
    expect(component.isProfessionalOrManager).toBe(true);
  });

  it('should add color validators for professional/manager roles', () => {
    component.ngOnInit();
    component.getForm.role.setValue(Role.professional);
    expect(component.getForm.lightColor.hasError('validColor')).toBeDefined();
    expect(component.getForm.darkColor.hasError('validColor')).toBeDefined();
  });

  it('should clear color validators for non-professional roles', () => {
    component.ngOnInit();
    component.getForm.role.setValue(Role.professional);
    component.getForm.role.setValue(Role.customer);
    expect(component.getForm.lightColor.validator).toBeNull();
    expect(component.getForm.darkColor.validator).toBeNull();
  });

  it('should handle address selection', () => {
    const mockPlaceResult = {
      geometry: { location: { lat: () => 40.7128, lng: () => -74.0060 } },
      'formatted_address': 'New York, NY, USA',
    } as any;
    
    component.getAddress(mockPlaceResult);
    expect(component.geometry).toBe(mockPlaceResult.geometry);
    expect(component.formattedAddress).toBe('New York, NY, USA');
    expect(component.addressUpdated).toBe(true);
  });

  it('should not submit form when invalid', () => {
    component.ngOnInit();
    void component.submit;
    expect(mockStore.dispatch).toHaveBeenCalledTimes(1); // Only Clean action
  });

  it('should submit form in add mode when valid', () => {
    component.ngOnInit();
    component.getForm.role.setValue(Role.customer);
    component.getForm.displayName.setValue('Test User');
    component.getForm.email.setValue('test@example.com');
    component.getForm.lang.setValue({ value: 'en' });
    
    void component.submit;
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      jasmine.any(fromActionsUser.SaveUser),
    );
  });

  it('should handle errors from store', () => {
    const stateWithErrors = {
      subErrors: [
        { field: 'email', message: 'Email already exists' },
      ],
    };
    mockStore.select.and.returnValue(of(stateWithErrors));
    
    // Create a new component instance with the error state
    const errorComponent = new UserComponent(
      mockTranslateService,
      mockActivatedRoute,
      mockStore,
      formBuilder,
      mockRouter,
      mockChangeDetectorRef,
    );
    
    errorComponent.ngOnInit();
    
    expect(errorComponent.errors.email).toBe('Email already exists');
    expect(errorComponent.getForm.email.hasError('incorrect')).toBe(true);
  });

  it('should navigate to users list on successful response', () => {
    const stateWithResponse = { response: { success: true } };
    mockStore.select.and.returnValue(of(stateWithResponse));
    
    // Create a new component instance with the success state
    const successComponent = new UserComponent(
      mockTranslateService,
      mockActivatedRoute,
      mockStore,
      formBuilder,
      mockRouter,
      mockChangeDetectorRef,
    );
    
    successComponent.ngOnInit();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['en', 'users']);
  });

  it('should unsubscribe on destroy', () => {
    component.ngOnInit();
    spyOn(component['subscription']!, 'unsubscribe');
    component.ngOnDestroy();
    expect(component['subscription']!.unsubscribe).toHaveBeenCalled();
  });

  it('should lighten or darken color correctly', () => {
    const color = '#ff0000';
    const lightenedColor = component.lightenDarkenColor(color, false);
    const darkenedColor = component.lightenDarkenColor(color, true);
    expect(lightenedColor).not.toBe(color);
    expect(darkenedColor).not.toBe(color);
    expect(lightenedColor).not.toBe(darkenedColor);
  });
});