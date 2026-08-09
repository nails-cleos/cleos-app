import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfficeCreatePageComponent } from './office-create-page.component';
import { OfficeStore } from '../store/office.store';
import { IOfficeAll } from './office';
import { UserStore } from '../store/user.store';
describe('OfficeCreatePageComponent', () => {
  let component: OfficeCreatePageComponent;
  let fixture: ComponentFixture<OfficeCreatePageComponent>;

  let officeStoreSpy: {
    clean: Mock;
    create: Mock;
  };

  let userStoreSpy: {
    loadManagers: Mock;
  };

  const mockOffice: Partial<IOfficeAll> = {
    name: 'Test Office',
  };

  beforeEach(async () => {
    officeStoreSpy = {
      clean: vi.fn().mockName('clean'),
      create: vi.fn().mockName('create'),
    };
    userStoreSpy = {
      loadManagers: vi.fn().mockName('loadManagers'),
    };

    await TestBed.configureTestingModule({
      imports: [OfficeCreatePageComponent],
      providers: [
        { provide: OfficeStore, useValue: officeStoreSpy },
        { provide: UserStore, useValue: userStoreSpy },
      ],
    })
      .overrideTemplate(OfficeCreatePageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(OfficeCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call create when office is received', () => {
    component.submit(mockOffice);

    expect(officeStoreSpy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Office',
      }),
    );
  });
});
