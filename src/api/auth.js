const axios = require('axios');

const origin = `http://${process.env.VUE_APP_ORIGIN}`;
const prefix = "api";
const routes = {
    post: {
        login: `${origin}/${prefix}/players/login`
    }
};

exports.getRoutes = () => {
    return routes;
};

exports.login = (nickname) => {
    const url = routes.post.login;
    const data = {nickname};
    return axios.post(url, data);
};