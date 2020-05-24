import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JoinPlaylistComponent } from './join-playlist/join-playlist.component';
import { SharePlaylistComponent } from './share-playlist/share-playlist.component';
import { HttpClientModule } from '@angular/common/http';
import { CreatePlaylistComponent } from './create-playlist/create-playlist.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@NgModule({
  declarations: [
    AppComponent,
    JoinPlaylistComponent,
    SharePlaylistComponent,
    CreatePlaylistComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    AuthGuard,
    AuthService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
