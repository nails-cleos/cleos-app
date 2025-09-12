import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareButtonsComponent } from './share-buttons.component';
import { provideHttpClient, withJsonpSupport } from '@angular/common/http';

describe('ShareButtonsComponent', () => {
  let component: ShareButtonsComponent;
  let fixture: ComponentFixture<ShareButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareButtonsComponent],
      providers: [
        provideHttpClient(withJsonpSupport()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
