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
}

export type Album = TODO;
export type Artist = TODO;

