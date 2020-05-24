import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Track } from '../../../functions/src/types';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';


@Component({
  selector: 'app-artwork-banner',
  templateUrl: './artwork-banner.component.html',
  styleUrls: ['./artwork-banner.component.scss']
})
export class ArtworkBannerComponent implements OnInit {

  public tracks: Observable<Track[]>;
  public trackImageUrls: string[];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) { }

  ngOnInit(): void {
    this.tracks = this.api.getUserTracks();
    this.tracks.subscribe((tracks) => {
      this.trackImageUrls = this.getUniqueTrackImageUrls(tracks);
    });
  }

  private getUniqueTrackImageUrls(tracks: Track[]) {
    const tracksImageUrls = [];
    tracks.forEach((track) => {
      if (tracksImageUrls.indexOf(track.album.images[0].url) < 0) {
        tracksImageUrls.push(track.album.images[0].url);
      }
    });
    return tracksImageUrls;
  }

}
