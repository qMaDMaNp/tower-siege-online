const jwt = require("jsonwebtoken");

module.exports = {
    isPlayer: function (req, res, next) {
        const token = req.get('Authorization');

        if (!token) return res.status(401).send('Please login');

        try {
            jwt.verify(token, process.env.JWT_KEY,  (err, decoded) => {
                if (err) res.status(401).send('Incorrect token');

                res.playerId = decoded.id;
                return next();
            });
        }
        catch(e) {
            res.status(500).json(e);
        }
    }
};

