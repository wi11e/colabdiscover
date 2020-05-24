import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    public auth: AuthService,
    public router: Router,
    public api: ApiService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url = state.url.includes('?') ? state.url.split('?')[0] : state.url;
    const code = route.queryParamMap.get('code');
    if (this.auth.isAuthenticated()) {
      console.log('authenticated using local token');
      return true;
    }
    if (code) {
      this.auth.getAuthToken(code, `https://colabdiscover.web.app${url}`).subscribe((token) => {
        return !!token;
      });
    } else {
      this.api.goExternalWithSpotifyLogin(`https://colabdiscover.web.app${url}`);
      return false;
    }
  }
}
