import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockAgendaComponent } from './block-agenda.component';

describe('BlockAgendaComponent', () => {
  let component: BlockAgendaComponent;
  let fixture: ComponentFixture<BlockAgendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [BlockAgendaComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(BlockAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
