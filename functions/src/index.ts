'use strict';

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import axios from 'axios';
import * as  qs from 'querystring';
import { SECRETS } from './secrets';
import {AuthResponse, Track, TrackResponse, User} from "./types";
import {Response} from "firebase-functions";

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

/**
 * Responsible for creating a playlist
 * TODO: create playlist on spotify
 * TODO: name and artwork
 * TODO: types for internal and spotify playlist and user SUser, User, SPlaylist, Playlist etc.
 */
export const createNewColab = functions.https.onRequest(async (req, res) => {
  const url = firebaseUrl + '/createNewColab';
  if (!req.query.code) {
    return login(res, url);
  }
  const {accessToken, refreshToken} = await authorizeUser(req.query.code as string, url);

  const userSpotify = await getUser(accessToken);
  const user = {
     spotifyId: userSpotify.id,
     name: userSpotify.display_name,
     refreshToken: refreshToken,
  };
  const playlist = await createPlaylist(accessToken);

  await db.collection('playlist').add({
    playlistId: playlist.id,
    owner: user,
    users: [],
    tracks: [],
  });
});

/**
 * Gets your tracks and adds them to a current playlist
 * TODO: add user to the playlist
 * TODO: validate user is not already part of the playlist (idempotent)
 * TODO: throw exception if playlist id does not exist
 * TODO: maintain playlistId query param through login
 */
export const addTracksToColab = functions.https.onRequest(async (req, res) => {
  const url = firebaseUrl + '/addTracksToColab';
  const playlistId = req.query.playlist as string; // Throw Exception & add to query param for login
  if (!req.query.code) {
    login(res, url);
    return;
  }
  const {accessToken, refreshToken} = await authorizeUser(req.query.code as string, url);
  const userSpotify = await getUser(accessToken);
  const user = {
    spotifyId: userSpotify.id,
    name: userSpotify.display_name,
    refreshToken: refreshToken,
  };
  const tracks = await getTracks(accessToken);
  await followPlaylist(playlistId, accessToken);
  await addTracksToPlaylistRecord(playlistId, tracks.slice(0, 2)); // needs to be adapted to add user and tracks to db playlist
  // add user to playlist record
});

export const syncPlaylistToDb = functions.firestore.document('playlist/{playlistId}').onUpdate(async (snap, context) => {
  const {playlistId, owner, tracks, users} = snap.after.data();
  const accessToken = await refreshUserToken(owner.refreshToken);
  await addTracksToPlaylist(playlistId, tracks, accessToken);
});

// TODO: replace with multiple cloud functions above.
export const getTopTracks = functions.https.onRequest(async (req, res) => {
  const {accessToken, refreshToken} = await authorizeUser(req.query.code as string, firebaseUrl + '/getTopTracks');
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

async function getUser(accessToken: string): Promise<User> {
 const userResponse = await ax.get('https://api.spotify.com/v1/me', {
  headers: {
   'Authorization': 'Bearer ' + accessToken,
   'Content-Type': 'application/json'
  }
 });
 return userResponse.data;
}

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

async function addTracksToPlaylistRecord(playlistId: string, tracks: Track[]): Promise<void> {
  const playlistDocument = (await db.collection('playlist').where('playlistId', '==', playlistId).get()).docs[0];
  const currentTracks = playlistDocument.data().tracks;
  const newTrackUris = currentTracks.concat(tracks.map((track: Track) => track.uri));
  await db.collection('playlist').doc(playlistDocument.id).set({tracks: newTrackUris});
}

async function login(res: Response, redirectUrl: string): Promise<void> {
  const params = {
    response_type: 'code',
    client_id: SECRETS.client_id,
    scope: 'user-read-private user-read-email user-top-read playlist-modify-public user-follow-modify',
    redirect_uri: redirectUrl,
  };

  res.redirect('https://accounts.spotify.com/authorize?' + qs.stringify(params))
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

async function authorizeUser(code: string, redirectUrl: string): Promise<{accessToken: string, refreshToken: string}> {
  const params = {
   grant_type: 'authorization_code',
   code,
   redirect_uri: redirectUrl,
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
