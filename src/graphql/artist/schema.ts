import { gql } from "graphql-tag";

export const artistTypeDefs = gql`
  type Artist {
    id: String!
    name: String
    type: String
    followers: Followers
    images: [Image]
    genres: [String]
  }

  type Query {
    artist(artistId: String!): Artist
    savedArtists(after: String): [Artist]
  }
`;
