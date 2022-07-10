import Vue from "vue";
import Vuex from "vuex";
import auth from './modules/auth';
import players from './modules/players';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    auth,
    players
  }
});

export default store;