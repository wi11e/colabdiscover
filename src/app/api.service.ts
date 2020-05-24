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

  private baseUrl = 'https://us-central1-colabdiscover.cloudfunctions.net';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
  ) {}


  public joinPlaylist(playlistId: string, code: string) {
    return this.http.get(`${this.baseUrl}/addTracksToColab`, {
      params: { playlist: playlistId, code }
    });
  }

  public createPlaylist(code: string) {
    return this.http.get(`${this.baseUrl}/createNewColab`, {
      params: { code }
    });
  }

  public getUserTracks(): Observable<Track[]> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/getUserTracks`, {
      params: { token }
    }) as Observable<Track[]>;
  }

  public getAccessToken(code: string, url: string): Observable<string> {
    return this.http.get(`${this.baseUrl}/getAccessToken`, {
      params: { code, url }
    }) as Observable<string>;
  }

  public goExternalWithSpotifyLogin(href: string) {
    this.goExternal(`${this.baseUrl}/login?url=${encodeURI(href)}`);
  }

  public goExternal(href: string): void {
    this.document.location.href = href;
  }
}
