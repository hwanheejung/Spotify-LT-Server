import { ERROR } from "../../lib/constants/error.js";
import { MyContext } from "../context.js";

const mapArtist = (artist: any) => ({
  id: artist.id,
  name: artist.name || null,
  type: artist.type || null,
  followers: artist.followers || { href: null, total: 0 },
  images: artist.images || [],
  genres: artist.genres || [],
});

const artistResolvers = {
  Query: {
    artist: async (
      _: unknown,
      { artistId }: { artistId: string },
      context: MyContext
    ) => {
      if (!context.isAuthenticated) throw new Error(ERROR.USER_NOT_FOUND);
      const { spotifyAxios } = context;

      const data = await spotifyAxios.get(`/artists/${artistId}`);
      return mapArtist(data);
    },
    savedArtists: async (
      _: unknown,
      { after }: { after: string },
      context: MyContext
    ) => {
      if (!context.isAuthenticated) throw new Error(ERROR.USER_NOT_FOUND);
      const { spotifyAxios } = context;

      const data = await spotifyAxios.get("/me/following", {
        params: {
          type: "artist",
          limit: 10,
          after,
        },
      });
      return data.artists.items.map(mapArtist);
    },
  },
};

export default artistResolvers;
