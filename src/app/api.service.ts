import {Inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import {Observable} from "rxjs";
import {Track} from "../../functions/src/types";

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


  joinPlaylist(playlistId: string, code: string) {
    return this.http.get('https://us-central1-colabdiscover.cloudfunctions.net/addTracksToColab', {
      params: {playlist: playlistId, code}
    });
  }

  createPlaylist(code: string) {
    return this.http.get('https://us-central1-colabdiscover.cloudfunctions.net/createNewColab', {
      params: { code }
    });
  }

  getUserTracks(code: string) {
    return this.http.get('https://us-central1-colabdiscover.cloudfunctions.net/getUserTracks', {
      params: { code }
    }) as Observable<Track[]>;
  }

  goExternalWithSpotifyLogin(href: string) {
    this.goExternal(`https://us-central1-colabdiscover.cloudfunctions.net/login?url=${encodeURI(href)}`);
  }

  goExternal(href: string): void {
    this.document.location.href = href;
  }
}
