const router = require("express").Router();
const middleware = require('./middlewares/middleware');
const PlayerAuthController = require("./controllers/PlayerAuthController");


// router.get("/", (req, res) => res.sendFile("index.html", { root: "../dist" }));
router.post("/ping", (req, res) => res.status(200).json({ response: "pong" }));

//Players
router.post('/players/login', PlayerAuthController.login);



module.exports = router;
