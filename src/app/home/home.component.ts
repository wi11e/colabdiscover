import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../api.service";
import { Observable } from "rxjs";
import { Track } from "../../../functions/src/types";
import {switchMap} from "rxjs/operators";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public spotifyOAuthCode: string;

  public tracks: Observable<Track[]>;
  public trackImageUrls: string[];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParams => {
      console.log(queryParams.get('code'));
      this.spotifyOAuthCode = queryParams.get('code');
      if (!this.spotifyOAuthCode) {
        this.api.goExternalWithSpotifyLogin('https://colabdiscover.web.app');
      }
      this.tracks = this.api.getUserTracks(this.spotifyOAuthCode);
      this.tracks.subscribe((tracks) => {
        const tracksImageUrls = [];
        tracks.forEach((track) => {
          if (tracksImageUrls.indexOf(track.album.images[0].url) < 0) {
            tracksImageUrls.push(track.album.images[0].url);
          }
        });
        this.trackImageUrls = tracksImageUrls;
      });
    });
  }

}
