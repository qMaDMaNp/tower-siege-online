import Vue from 'vue';
import authApi from "@/api/auth";

const state = {
    token: window.localStorage.getItem('token') || '',
    player: JSON.parse(window.localStorage.getItem('player')) || {}
};

const getters = {
    token(state) {
        return state.token;
    },

    player(state) {
        return state.player;
    },

    isAuthorized(state) {
        return state.token.length > 0 && Object.keys(state.player).length > 0;
    }
};

const mutations = {
    SET_CREDENTIALS(state, {token, player}) {
        window.localStorage.setItem('token', token);
        window.localStorage.setItem('player', JSON.stringify(player));

        state.token = token;
        state.player = player;
    },

    MUTATE_PLAYER(state, { propName, propValue }) {
        Vue.set(state.player, propName, propValue);
        window.localStorage.setItem('player', JSON.stringify(state.player));
    },

    GET_TOKEN(state, { task }) {
        window.localStorage.getItem('token');
    },

    REMOVE_CREDENTIALS(state) {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('player');

        state.token = '';
        state.player = {};
    },
};

const actions = {
    login({ commit }, nickname) {
        return new Promise(async (resolve, reject) => {
           try {
               const credentials = await authApi.login(nickname);

               commit('SET_CREDENTIALS', {
                   token: credentials.data.token,
                   player: credentials.data.player
               });

               resolve();
           }
           catch (e) {
               reject(e);
           }
        });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}

