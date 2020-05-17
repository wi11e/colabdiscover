import {Inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import {Observable} from "rxjs";

interface JoinPlaylistResponse {
  success: boolean;
  msg: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
  ) {}

  goExternal(href: string): void {
    this.document.location.href = href;
  }

  joinPlaylist(playlistId: string, code: string) {
    return this.http.get('https://us-central1-colabdiscover.cloudfunctions.net/addTracksToColab', {
      params: {playlist: playlistId, code}
    });
  }
}
