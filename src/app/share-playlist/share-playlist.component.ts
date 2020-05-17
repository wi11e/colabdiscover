import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import  {ApiService } from '../api.service';

@Component({
  selector: 'app-share-playlist',
  templateUrl: './share-playlist.component.html',
  styleUrls: ['./share-playlist.component.scss']
})
export class SharePlaylistComponent implements OnInit {

  public playlistId;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(routeParams => {
      this.playlistId = routeParams.get('playlistId');
    });
    localStorage.setItem('currentPlaylistId', this.playlistId);
  }

  public join(): void {
    this.api.goExternal('https://us-central1-colabdiscover.cloudfunctions.net/login');
  }

}
