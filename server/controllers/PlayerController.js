const path = require("path");
const PlayerCacheService = require(path.resolve("server/services/PlayerCacheService"));

exports.getAll = async (req, res) => {
  try {
    let players = await PlayerCacheService.getAll();
    res.status(200).json(players);
  } catch(e) {
    res.status(500).send(e);
  }
};