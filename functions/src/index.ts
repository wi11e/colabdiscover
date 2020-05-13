'use strict';

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import axios from 'axios';
import * as  qs from 'querystring';
import { SECRETS } from './secrets';
import {AuthResponse, Track, TrackResponse, User} from "./types";

const firebaseUrl = 'https://us-central1-colabdiscover.cloudfunctions.net';

const ax = axios.create();

ax.interceptors.request.use(request => {
 console.log('Request', request);
 return request
});
ax.interceptors.response.use(response => {
 console.log('Response:', response);
 return response
});

admin.initializeApp();
const db = admin.firestore();

// https://developer.spotify.com/documentation/general/guides/authorization-guide/
// TODO put under '/' route
export const login = functions.https.onRequest((req, res) => {
 const params = {
  response_type: 'code',
  client_id: SECRETS.client_id,
  scope: 'user-read-private user-read-email user-top-read playlist-modify-public user-follow-modify',
  redirect_uri: firebaseUrl + '/getTopTracks',
 };

 res.redirect('https://accounts.spotify.com/authorize?' + qs.stringify(params))
});

/**
 * Responsible for creating a playlist
 * since only the owner of a playlist can add to it. We need to get the tracks of the current user and then
 * reauth the playlist owner and then add the tracks to that playlist.
 */
export const createNewColab = functions.https.onRequest(async (req, res) => { /*...*/ });

/**
 * Gets your tracks and adds them to a current playlist
 */
export const addTracksToColab = functions.https.onRequest(async (req, res) => { /*...*/ });

 export const getTopTracks = functions.https.onRequest(async (req, res) => {
  const {accessToken, refreshToken} = await authorizeUser(req.query.code as string);
  const user = await getUser(accessToken);
  // await db.collection('users').add({
  //  spotifyId: user.id,
  //  name: user.display_name,
  //  refreshToken: refreshToken,
  // });

  const tracks = await getTracks(accessToken);
  const playlistId = '51AaHBVPUj5Grqw2EsxAjT';
  await followPlaylist(playlistId, accessToken);
  await addTracksToPlaylist(playlistId, tracks.slice(0, 2), accessToken);

  res.send({
   user,
   tracks: tracks.map((item) => {
    return {
     title: item.name,
     artist: item.artists[0].name,
     album: item.album.name
    }
   })
  });
 });

 async function followPlaylist(playlistId: string, accessToken: string): Promise<void> {
  const config = {
   headers: {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
   }
  };
  const followPlaylistResponse = await ax.put(
    `https://api.spotify.com/v1/playlists/${playlistId}/followers`,
    {},
    config
  );
 }

 async function addTracksToPlaylist(playlistId: string, tracks: Track[], accessToken: string): Promise<void> {
  const params = {
   uris: tracks.map((track: Track) => track.uri).join(',')
  };
  const config = {
   headers: {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
   }
  };
  const addTracksResponse = await ax.post(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?` + qs.stringify(params),
    {},
    config
   );
 }

async function getUser(accessToken: string): Promise<User> {
 const userResponse = await ax.get('https://api.spotify.com/v1/me', {
  headers: {
   'Authorization': 'Bearer ' + accessToken,
   'Content-Type': 'application/json'
  }
 });
 return userResponse.data;
}

 async function getTracks(accessToken: string): Promise<Track[]> {
  const tracksResponse: TrackResponse = await ax.get('https://api.spotify.com/v1/me/top/tracks', {
   headers: {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
   },
   params: {
    limit: 20,
    offset: 0,
    time_range: 'short_term'
   }
  });
  return tracksResponse.data.items;
 }

 async function refreshUserToken(refreshToken: string): Promise<string> {
  const params = {
   grant_type: 'refresh_token',
   refresh_token: refreshToken,
  };
  const config = {
   auth: {
    username: SECRETS.client_id,
    password: SECRETS.client_secret,
   },
   headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
   }
  };

  const authResponse: {data: AuthResponse} = await ax.post(
    'https://accounts.spotify.com/api/token',
    qs.stringify(params),
    config,
  );
  return authResponse.data.access_token;
 }

 async function authorizeUser(code: string): Promise<{accessToken: string, refreshToken: string}> {
  const params = {
   grant_type: 'authorization_code',
   code,
   redirect_uri: firebaseUrl + '/getTopTracks',
  };
  const config = {
   auth: {
    username: SECRETS.client_id,
    password: SECRETS.client_secret,
   },
   headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
   }
  };

  const authResponse: {data: AuthResponse} = await ax.post(
    'https://accounts.spotify.com/api/token',
    qs.stringify(params),
    config,
  );

  return {
   accessToken: authResponse.data.access_token,
   refreshToken: authResponse.data.refresh_token,
  };
 }
