const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

module.exports.verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        req.userId = decoded.id;
        res.json({ message: 'Token Verify' });
        console.log("middleware", decoded);
        next();
    });
};

// exports.verifyToken = (req, res, next) => {
//     try {
//         const token = req.headers["x-access-token"];
//         if (!token) {
//             return res.status(401).send("No Token, Authorization Denied!!!");
//         }
//         const decoded = jwt.verify(token, config.secret);
//         req.user = decoded.user;
//         console.log("middleware", decoded);
//         next();
//     } catch (error) {
//         console.log(error);
//         return res.status(401).send("Token Invalid!!!");
//     }
// };