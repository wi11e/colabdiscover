import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { map, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    public auth: AuthService,
    public router: Router,
    public api: ApiService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const url = state.url.includes('?') ? state.url.split('?')[0] : state.url;
    const code = route.queryParamMap.get('code');
    if (this.auth.isAuthenticated()) {
      console.log('authenticated using local token');
      return of(true);
    }
    if (code) {
      console.log('authenticating using query string code');
      return this.auth.getAuthToken(code, `https://colabdiscover.web.app${url}`).pipe(
        map((token) => !!token),
        take(1)
      );
    } else {
      console.log('redirecting to spotify login');
      this.api.goExternalWithSpotifyLogin(`https://colabdiscover.web.app${url}`);
      return of(false);
    }
  }
}
