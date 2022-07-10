const path = require("path");
const DB = require(path.resolve("server/db"));
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class PlayerCollection {
  async getAll() {}

  async login(nickname) {
    const collection = DB.db.collection('players');
    let token = '';

    try {
      const player = await collection.findOne({ nickname: nickname.trim() });
      if (!player) throw('User not found');

      token = await jwt.sign({id: player._id, nickname: player.nickname}, process.env.JWT_KEY,{ expiresIn: '1d' });

      return {token, player};
    } catch(e) {
      throw(e);
    }
  }

  async create(nickname) {}

  async update(nickname) {}
}

module.exports = new PlayerCollection();