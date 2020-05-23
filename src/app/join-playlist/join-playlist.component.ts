import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-join-playlist',
  templateUrl: './join-playlist.component.html',
  styleUrls: ['../app.component.scss']
})
export class JoinPlaylistComponent implements OnInit {

  public playlistId: string;
  public spotifyOAuthCode: string;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {
  }

  ngOnInit(): void {
    this.playlistId = localStorage.getItem('currentPlaylistId');
    this.route.queryParamMap.subscribe(queryParams => {
      this.spotifyOAuthCode = queryParams.get('code');
    });
    this.api.joinPlaylist(this.playlistId, this.spotifyOAuthCode);
  }

}
