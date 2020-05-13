type TODO = any;

export interface AuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

export type TrackResponse =  {
  data: {
    items: Track[]
  }
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
  name: string
};

export type User = {
  id: string;
  uri: string;
  country: string;
  display_name: string;
  email: string;
};
