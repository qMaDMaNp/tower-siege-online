const axios = require("axios");

const headers = {
  headers: {
    'Authorization': window.localStorage.getItem('token')
  }
};
const origin = `http://${process.env.VUE_APP_ORIGIN}`;
const prefix = "api";
const routes = {
  get: {
    players: `${origin}/${prefix}/players`,
  },
};

exports.getRoutes = () => {
  return routes;
};

exports.getAll = (query = {}) => {
  let params = Object.keys(query).length ? `?${new URLSearchParams(query).toString()}` : '';

  const url = routes.get.players + params;
  return axios.get(url, headers);
};