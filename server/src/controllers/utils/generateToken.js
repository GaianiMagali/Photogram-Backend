const jwt = require("jsonwebtoken");

module.exports = payload => {
    return jwt.sign(payload, process.env.SIGNATURE_TOKEN, { expiresIn: 86400 })
}