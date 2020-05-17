import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharePlaylistComponent } from './share-playlist/share-playlist.component';
import { JoinPlaylistComponent } from './join-playlist/join-playlist.component';


const routes: Routes = [
  { path: 'share/:playlistId', component: SharePlaylistComponent },
  { path: 'join', component: JoinPlaylistComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
