import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinPlaylistComponent } from './join-playlist.component';

describe('JoinPlaylistComponent', () => {
  let component: JoinPlaylistComponent;
  let fixture: ComponentFixture<JoinPlaylistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoinPlaylistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
