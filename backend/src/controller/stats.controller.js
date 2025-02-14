import Album from "../models/album.model.js";
import User from "../models/user.model.js";
import Song from "../models/song.model.js";

export const getStats = async (req, res, next) => {
    try {
      // const totalSongs = await Song.countDocuments();
      // const totalAlbums = await Album.countDocuments();
      // const totalUsers = await User.countDocuments();
      // const totalArtists = await Artist.countDocuments();
  
      const [totalSongs, totalUsers, totalAlbums, uniqueArtists] =
        await Promise.all([
          Album.countDocuments(),
          User.countDocuments(),
          Song.countDocuments(),
  
          Song.aggregate([
            {
              $unionWith: {
                coll: "albums",
                pipeline: [],
              },
            },
            {
              $group: {
                _id: "$artist",
              },
            },
            {
              $count: "count",
            },
          ]),
        ]);
  
      res
        .status(200)
        .json({ totalSongs, totalUsers, totalAlbums, totalArtists: uniqueArtists[0]?.count || 0 });
    } catch (error) {
      next(error);
    }
  }