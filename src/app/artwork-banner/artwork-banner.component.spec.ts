
import { ArtworkBannerComponent } from './artwork-banner.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

describe('HomeComponent', () => {
  let component: ArtworkBannerComponent;
  let fixture: ComponentFixture<ArtworkBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtworkBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtworkBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
