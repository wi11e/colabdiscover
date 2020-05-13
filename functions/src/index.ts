'use strict';

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import axios from 'axios';
import * as  qs from 'querystring';
import { SECRETS } from './secrets';
import { AuthResponse, TrackResponse } from "./types";

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

// https://developer.spotify.com/documentation/general/guides/authorization-guide/
// TODO put under '/' route
export const login = functions.https.onRequest((req, res) => {
 const params = {
  response_type: 'code',
  client_id: SECRETS.client_id,
  scope: 'user-read-private user-read-email user-top-read', // TODO increase scopes
  redirect_uri: firebaseUrl + '/getTopTracks',
 };

 res.redirect('https://accounts.spotify.com/authorize?' + qs.stringify(params))
});

 export const getTopTracks = functions.https.onRequest(async (req, res) => {
  const code = req.query.code as string;
  const redirectUri = firebaseUrl + '/getTopTracks';
  const params = {
   grant_type: 'authorization_code',
   code,
   redirect_uri: redirectUri
  };
  const config = {
   auth: {
    username: SECRETS.client_id,
    password: SECRETS.client_secret
   },
   headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
   }
  };

  const authResponse: {data: AuthResponse} = await ax.post(
    'https://accounts.spotify.com/api/token',
    qs.stringify(params),
    config
  );

  const accessToken = authResponse.data.access_token;
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
  const tracks = tracksResponse.data.items.map((item) => {
   return {
    title: item.name,
    artist: item.artists[0].name,
    album: item.album.name
   }
  });

  res.send(tracks);
 });

