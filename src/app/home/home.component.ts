import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Track } from '../../../functions/src/types';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public tracks: Observable<Track[]>;
  public trackImageUrls: string[];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) { }

  ngOnInit(): void {
    this.tracks = this.api.getUserTracks();
    this.tracks.subscribe((tracks) => {
      const tracksImageUrls = [];
      tracks.forEach((track) => {
        if (tracksImageUrls.indexOf(track.album.images[0].url) < 0) {
          tracksImageUrls.push(track.album.images[0].url);
        }
      });
      this.trackImageUrls = tracksImageUrls;
    });
  }

}
