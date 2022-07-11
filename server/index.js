const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const DB = require(path.resolve("server/db"));
const { io } = require('./sockets');
const server = express();

require("dotenv").config({ path: path.resolve("", ".env") });

server.use(cors({ origin: [
    "http://localhost:8080",
    "http://127.0.0.1:8080"
  ]
}));

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.use(express.static(path.join(__dirname, "../dist")));
server.use("/api", require("./routes"));

(async () => {
  const port = 4444;

  const app = server.listen(port, () => {
    console.log(`App is listening on ${port}`);
  });

  await DB.connect();

  io.attach(app);
})();

process.on("uncaughtException", (err) => {
  console.log(err);
});
