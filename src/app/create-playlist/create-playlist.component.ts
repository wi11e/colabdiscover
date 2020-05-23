import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-create-playlist',
  templateUrl: './create-playlist.component.html',
  styleUrls: ['../app.component.scss']
})
export class CreatePlaylistComponent implements OnInit {

  public spotifyOAuthCode: string;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParams => {
      console.log(queryParams.get('code'));
      this.spotifyOAuthCode = queryParams.get('code');
      if (!this.spotifyOAuthCode) {
        this.api.goExternalWithSpotifyLogin('https://colabdiscover.web.app/create');
      }
    });
  }

  public create(): void {
    this.api.createPlaylist(this.spotifyOAuthCode).subscribe((data: {id: string}) => {
      const playlistId = data.id;
      localStorage.setItem('currentPlaylistId', playlistId);
    });
  }

}
