const router = require("express").Router();
const middleware = require('./middlewares/middleware');
const PlayerAuthController = require("./controllers/PlayerAuthController");
const PlayerController = require("./controllers/PlayerController");


// router.get("/", (req, res) => res.sendFile("index.html", { root: "../dist" }));
router.post("/ping", (req, res) => res.status(200).json({ response: "pong" }));

//Players auth
router.post('/players/login', PlayerAuthController.login);

//Players
router.get('/players', middleware.isPlayer, PlayerController.getAll);


module.exports = router;
