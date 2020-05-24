import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { TODO } from '../../functions/src/types';

@Injectable()
export class AuthService {
  constructor(private api: ApiService) {}

  private static isAfterNow(dateIsoString: string) {
    return (new Date()).getTime() > (new Date(dateIsoString)).getTime();
  }

  public getAuthToken(code: string, url: string): Observable<string> {
    return this.api.getAccessToken(code, url).pipe(
      // TODO: add refresh token and expiry
      tap((res: TODO) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('expires', res.expires);
      }),
      take(1)
    );
  }
  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const expires = localStorage.getItem('expires');
    if (token && expires && !AuthService.isAfterNow(expires)) {
      return true;
    }
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken && expires && AuthService.isAfterNow(expires)) {
      console.log('token has expired');
      // TODO add api function to refresh token;
    }
    return false;
  }
}
