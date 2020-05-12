'use strict';

import * as functions from 'firebase-functions'
// if you need to use the Firebase Admin SDK, uncomment the following:
// import * as admin from 'firebase-admin'
import axios from 'axios';
import * as  qs from 'querystring';
import { SECRETS } from './secrets';

export const helloWorld = functions.https.onRequest((req, res) => {
 res.send('Hello from Firebase!\n\n');
});

// https://developer.spotify.com/documentation/general/guides/authorization-guide/
// TODO put under '/' route
export const login = functions.https.onRequest((req, res) => {
 const scopes = 'user-read-private user-read-email user-top-read'; // TODO increase scopes
 const redirectUri = 'https://us-central1-colabdiscover.cloudfunctions.net/getTopTracks';
 res.redirect('https://accounts.spotify.com/authorize' +
   '?response_type=code' +
   '&client_id=' + SECRETS.client_id +
   (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
   '&redirect_uri=' + encodeURIComponent(redirectUri))
 // TODO add state
});


interface AuthResponse {
 access_token: string;
 token_type: string;
 scope: string;
 expires_in: number;
 refresh_token: string;
}

type TrackResponse =  any; // TODO;

 export const getTopTracks = functions.https.onRequest(async (req, res) => {

  // TODO: for debug - remove
  axios.interceptors.request.use(request => {
   console.log('Starting Request', request);
   return request
  });
  axios.interceptors.response.use(response => {
   console.log('Response:', response);
   return response
  });

  const code = req.query.code as string;
  const redirectUri = 'https://us-central1-colabdiscover.cloudfunctions.net/getTopTracks';
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

  const authResponse: {data: AuthResponse} = await axios.post(
    'https://accounts.spotify.com/api/token',
    qs.stringify(params),
    config
  );

  const accessToken = authResponse.data.access_token;
  const tracksResponse: TrackResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
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

