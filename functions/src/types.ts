type TODO = any;

export interface AuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

export type TrackList =  {
    items: Track[]
};

export type Playlist = {
  id: string,
  name: string;
  description: string;
  href: string;
  owner: User;
};

export type Track = {
  name: string;
  album: Album;
  artists: Artist[];
  uri: string
}

export type Artist = {
  name: string;
}

export type Album = {
  name: string;
};

export type User = {
  spotifyId: string;
  name: string;
  refreshToken: string;
}

export type SpotifyUser = {
  id: string;
  uri: string;
  display_name: string;
  email?: string;
  country?: string;
};
