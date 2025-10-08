import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FabMenuComponent } from './fab-menu.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('FabMenuComponent', () => {
  let component: FabMenuComponent;
  let fixture: ComponentFixture<FabMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FabMenuComponent],
      providers: [
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FabMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
