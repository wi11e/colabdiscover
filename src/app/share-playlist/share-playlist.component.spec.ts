import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharePlaylistComponent } from './share-playlist.component';

describe('SharePlaylistComponent', () => {
  let component: SharePlaylistComponent;
  let fixture: ComponentFixture<SharePlaylistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharePlaylistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharePlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
