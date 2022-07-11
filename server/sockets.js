const jwt = require('jsonwebtoken');
const path = require("path");
const PlayerCacheService = require(path.resolve("server/services/PlayerCacheService"));
const Player = require(path.resolve("server/entities/Player"));

const io = require('socket.io')(null, {
      cors: { origin: "http://localhost:8080" }
});

io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token, process.env.JWT_KEY, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            next();
        });
    }
    else {
        next(new Error('Authentication error'));
    }
}).on('connection', (socket) => {
    jwt.verify(socket.handshake.query.token, process.env.JWT_KEY, async (err, decoded) => {
        const player = new Player(decoded.id, decoded.nickname);
        PlayerCacheService.addPlayer(player);
        io.emit('player:connect', player);
    });

    socket.on("disconnect", () => {
        jwt.verify(socket.handshake.query.token, process.env.JWT_KEY, async (err, decoded) => {
            try {
                if (err) throw ('Authentication error on socket disconnect');
                PlayerCacheService.removePlayer(decoded.id);
                io.emit('player:disconnect', decoded.id);
            }
            catch(e) {
                console.error(e);
            }
        });
    });
});

const emitEvent = (message, res) => {
    const {domain, aud, context: { project_id }} = res.origin;
    io.to(`${domain}__${aud}__${project_id}`).emit('message', message);
};

module.exports = {io, emitEvent};
