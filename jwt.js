const jwt = require('jsonwebtoken');

const ensureToken = async (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    if(typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.status(403).send('Wrong. Try to login again.')
    }
};

module.exports = { ensureToken };