import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Silouebersicht } from './silouebersicht';

describe('Silouebersicht', () => {
  let component: Silouebersicht;
  let fixture: ComponentFixture<Silouebersicht>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Silouebersicht]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Silouebersicht);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
