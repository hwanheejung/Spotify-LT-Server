import { ERROR } from "../../lib/constants/error.js";
import { MyContext } from "../context.js";

const mapArtist = (artist: any) => ({
  id: artist.id,
  name: artist.name,
  type: artist.type,
  uri: artist.uri,
});

const mapTrack = (track: any) => ({
  id: track.id,
  name: track.name,
  type: track.type,
  duration_ms: track.duration_ms,
  track_number: track.track_number,
  disc_number: track.disc_number,
  is_playable: track.is_playable,
  is_local: track.is_local,
  artists: (track.artists || []).map(mapArtist),
});

const mapAlbum = (album: any) => ({
  id: album.id,
  name: album.name,
  album_type: album.album_type,
  total_tracks: album.total_tracks,
  images: album.images,
  type: album.type,
  release_date: album.release_date,
  uri: album.uri,
  artists: (album.artists || []).map(mapArtist),
  tracks: (album.tracks?.items || []).map(mapTrack),
  label: album.label,
  copyrights: album.copyrights || [],
});

const albumResolvers = {
  Query: {
    album: async (
      _: unknown,
      { albumId }: { albumId: string },
      context: MyContext
    ) => {
      if (!context.isAuthenticated) throw new Error(ERROR.USER_NOT_FOUND);
      const { spotifyAxios } = context;

      const data = await spotifyAxios?.get(`/albums/${albumId}`);
      return mapAlbum(data);
    },
    savedAlbums: async (
      _: unknown,
      { offset = 0, limit = 20 },
      context: MyContext
    ) => {
      if (!context.isAuthenticated) throw new Error(ERROR.USER_NOT_FOUND);
      const { spotifyAxios } = context;

      const data = await spotifyAxios?.get(`/me/albums`, {
        params: { offset, limit },
      });
      return data.items.map((item: any) => ({
        added_at: item.added_at,
        album: mapAlbum(item.album),
      }));
    },
    newReleases: async (
      _: unknown,
      { offset = 0, limit = 20 },
      context: MyContext
    ) => {
      if (!context.isAuthenticated) throw new Error(ERROR.USER_NOT_FOUND);
      const { spotifyAxios } = context;

      const data = await spotifyAxios?.get(`/browse/new-releases`, {
        params: { offset, limit },
      });
      return data.albums.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        images: item.images,
        artists: (item.artists || []).map(mapArtist),
      }));
    },
  },
};

export default albumResolvers;
