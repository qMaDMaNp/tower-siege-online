import playersApi from "@/api/players";
import {getObjectByKeyValue, getObjectIndexByKeyValue} from "@/lib/utils";

const state = {
  players: []
};

const getters = {
  currentPlayer(state, getters, rootState, rootGetters) {
    return state.players.filter(s => s.id === rootGetters['auth/player']._id)[0] || {};
  }
};

const mutations = {
  SET_PLAYERS(state, { players }) {
    const playerIds = state.players.map(player => player.id);

    players.forEach(player => {
      if (playerIds.indexOf(player.id) < 0) state.players.push(player);
    });
  },

  ADD_PLAYER(state, player) {
    const playerIds = state.players.map(player => player.id);
    if (playerIds.indexOf(player.id) < 0) state.players.push(player);
  },

  REMOVE_PLAYER(state, playerId) {
    let playerIndex = getObjectIndexByKeyValue(state.players, playerId, 'id');
    if (playerIndex >= 0) state.players.splice(playerIndex, 1);
  },
};

const actions = {
  //Api calls
  get_players({ commit, state }) {
    return new Promise(async (resolve, reject) => {
      try {
        let playersResponse = await playersApi.getAll();
        let players = playersResponse.data;

        commit('SET_PLAYERS', { players });
        resolve();
      }
      catch (e) {
        reject(e);
      }
    });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
