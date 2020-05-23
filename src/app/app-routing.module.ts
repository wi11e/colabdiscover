import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharePlaylistComponent } from './share-playlist/share-playlist.component';
import { JoinPlaylistComponent } from './join-playlist/join-playlist.component';
import { CreatePlaylistComponent } from './create-playlist/create-playlist.component';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'share/:playlistId', component: SharePlaylistComponent },
  { path: 'join', component: JoinPlaylistComponent },
  { path: 'create', component: CreatePlaylistComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
