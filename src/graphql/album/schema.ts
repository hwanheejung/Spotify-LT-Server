import { gql } from "graphql-tag";

export const albumTypeDefs = gql`
  type Album {
    id: String!
    name: String!
    album_type: String
    total_tracks: Int
    images: [Image!]
    type: String
    release_date: String
    uri: String
    artists: [AlbumArtist!]
    tracks: [AlbumTrack!]!
    copyrights: [AlbumCopyright]
    label: String
  }

  type AlbumTrack {
    artists: [AlbumArtist]
    id: String
    name: String
    type: String
    duration_ms: Int
    track_number: Int
    disc_number: Int
    is_playable: Boolean
    is_local: Boolean
  }

  type AlbumArtist {
    id: String
    name: String
    type: String
    uri: String
  }

  type SavedAlbum {
    added_at: String
    album: Album
  }

  type AlbumCopyright {
    text: String
    type: String
  }

  type NewRelease {
    id: String!
    name: String!
    images: [Image!]
    artists: [AlbumArtist!]
  }

  type Query {
    album(albumId: String!): Album
    savedAlbums(offset: Int = 0, limit: Int = 20): [SavedAlbum]
    newReleases(offset: Int = 0, limit: Int = 4): [NewRelease]
  }
`;
