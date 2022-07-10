const path = require("path");
const PlayerCollection = require(path.resolve("server/db/collections/PlayerCollection"));

exports.login = async (req, res) => {
  try {
    //todo: move to middleware
    if (Object.keys(req.body).length === 0) throw('Please provide nickname');
    if (!req.body.nickname || req.body.nickname.length === 0) throw('No nickname, please provide nickname');

    const nickname = req.body.nickname;
    const userData = await PlayerCollection.login(nickname);

    res.status(200).json(userData);
  } catch(e) {
    res.status(500).send(e);
  }
};