'use strict';

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import axios, {AxiosResponse} from 'axios';
import * as  qs from 'querystring';
import { SECRETS } from './secrets';
import {AuthResponse, Playlist, SpotifyUser, Track, TrackList, User} from "./types";

const firebaseUrl = 'https://us-central1-colabdiscover.cloudfunctions.net';
const SCOPES = 'user-read-private user-read-email user-top-read playlist-modify-public user-follow-modify playlist-modify-public playlist-modify-private';

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

/*
 * TODO: pull log in out of each function (probably requires a frontend)
 * TODO: create new colab: playlist artwork?
 * TODO: add tracks to colab: throw exception if playlist id does not exist
 */

/*
 * CLOUD FUNCTIONS
 */
export const createNewColab = functions.https.onRequest(async (req, res) => {
  const url = firebaseUrl + '/createNewColab';
  if (!req.query.code) {
    return login(res, url);
  }
  const {accessToken, refreshToken} = await authorizeUser(req.query.code as string, url);

  const userSpotify = await getUser(accessToken);
  const user: User = {
     spotifyId: userSpotify.id,
     name: userSpotify.display_name,
     refreshToken: refreshToken,
  };
  const playlist = await createPlaylist(user.spotifyId, accessToken);
  await db.collection('playlist').add({
    playlistId: playlist.id,
    owner: user,
    users: [user],
    tracks: [],
  });
  res.send(playlist);
});

export const addTracksToColab = functions.https.onRequest(async (req, res) => {
  const url = firebaseUrl + '/addTracksToColab';
  const playlistId =  '5vF1MebmHUBaCBWyIecbZf'; // req.query.playlist as string; // TODO: improve login flow to enable playlist param
  if (!req.query.code) {
    await login(res, url);
    return;
  }
  const {accessToken, refreshToken} = await authorizeUser(req.query.code as string, url);
  const userSpotify = await getUser(accessToken);
  const user: User = {
    spotifyId: userSpotify.id,
    name: userSpotify.display_name,
    refreshToken: refreshToken,
  };

  if(await isUserOnPlaylistAlready(playlistId, user)) {
    res.send({
      success: false,
      msg: 'user already collaborates on this playlist',
    });
    return;
  }
  const tracks = await getTracks(accessToken);
  await followPlaylist(playlistId, accessToken);
  await addTracksToPlaylistRecord(playlistId, tracks.slice(0, 2));
  await addUserToPlaylistRecord(playlistId, user);

  res.send({
    success: true,
    msg: 'tracks are being synced now, this should only take a few seconds',
  })
});

export const syncPlaylistToDb = functions.firestore.document('playlist/{playlistId}').onUpdate(async (snap, context) => {
  const {playlistId, owner, tracks, users} = snap.after.data();
  if (tracks.every((track) => snap.before.data().tracks.includes(track))) {
    return;
  }
  const accessToken = await refreshUserToken(owner.refreshToken);
  await addTracksToPlaylist(playlistId, tracks, accessToken);
});

/*
 * SPOTIFY FUNCTIONS
 */
async function getUser(accessToken: string): Promise<SpotifyUser> {
  const userResponse = await ax.get('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    }
  });
  return userResponse.data;
}

async function getTracks(accessToken: string): Promise<Track[]> {
  const tracksResponse: AxiosResponse<TrackList> = await ax.get('https://api.spotify.com/v1/me/top/tracks', {
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

async function createPlaylist(userId: string, accessToken: string): Promise<Playlist> {
  const config = {
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
  const params = {
    name: "Colab Discover",
    description: "New playlist description",
    public: true,
  };
  const response: AxiosResponse<Playlist> = await ax.post(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    params,
    config
  );
  return response.data;
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

async function addTracksToPlaylist(playlistId: string, tracks: Track[], accessToken: string): Promise<void> {
  const config = {
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    }
  };
  const params = {
    uris: tracks.join(',')
  };
  const addTracksResponse: AxiosResponse = await ax.post(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?` + qs.stringify(params),
    {},
    config
  );
}

async function login(res, redirectUrl: string): Promise<void> {
  const params = {
    response_type: 'code',
    client_id: SECRETS.client_id,
    scope: SCOPES,
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

/*
 * FIRESTORE FUNCTIONS
 */
async function addUserToPlaylistRecord(playlistId: string, user: User): Promise<void> {
  const playlistDocument = (await db.collection('playlist').where('playlistId', '==', playlistId).get()).docs[0];
  const currentUsers = playlistDocument.data().users;
  const newUsers = currentUsers.concat(user);
  await db.collection('playlist').doc(playlistDocument.id).set({...playlistDocument.data(), users: newUsers});
}

async function isUserOnPlaylistAlready(playlistId: string, user: User): Promise<boolean> {
  const playlistDocument = (await db.collection('playlist').where('playlistId', '==', playlistId).get()).docs[0];
  const currentUsers: User[] = playlistDocument.data().users;
  return currentUsers.map(currentUser => currentUser.spotifyId).includes(user.spotifyId);
}

async function addTracksToPlaylistRecord(playlistId: string, tracks: Track[]): Promise<void> {
  const playlistDocument = (await db.collection('playlist').where('playlistId', '==', playlistId).get()).docs[0];
  const currentTracks = playlistDocument.data().tracks;
  const newTrackUris = currentTracks.concat(tracks.map((track: Track) => track.uri));
  await db.collection('playlist').doc(playlistDocument.id).set({...playlistDocument.data(), tracks: newTrackUris});
}
