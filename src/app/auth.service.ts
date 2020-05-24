import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { TODO } from '../../functions/src/types';

@Injectable()
export class AuthService {
  constructor(private api: ApiService) {}

  public getAuthToken(code: string, url: string): Observable<string> {
    return this.api.getAccessToken(code, url).pipe(
      // TODO: add refresh token and expiry
      tap((res: TODO) => localStorage.setItem('token', res.token)),
      take(1)
    );
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    // TODO check if has expired and refresh
    return !!token;
  }
}
