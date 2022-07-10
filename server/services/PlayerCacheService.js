class PlayerCacheService {
  constructor() {
    this.players = [];
  }

  getAll() {
    return this.players;
  }

  findPlayer(id) {
    return this.players.filter(x => x.id.equals(id))[0] || null
  }

  update(playerId) {}

  addPlayer(player) {
    const playerIds = this.players.map(player => player.id);

    if (playerIds.indexOf(player.id) < 0) this.players.push(player);
    console.log(this.players);
  }

  removePlayer(playerId) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].id === playerId) {
        this.players.splice(i, 1);
        break;
      }
    }
  }
}

module.exports = new PlayerCacheService();