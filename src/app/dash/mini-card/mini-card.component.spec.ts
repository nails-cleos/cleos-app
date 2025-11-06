import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniCardComponent } from './mini-card.component';
import { TranslateModule } from '@ngx-translate/core';

describe('MiniCardComponent', () => {
  let component: MiniCardComponent;
  let fixture: ComponentFixture<MiniCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniCardComponent, TranslateModule.forRoot()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
