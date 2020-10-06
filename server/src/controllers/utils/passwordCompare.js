const bcryptjs = require("bcryptjs");

module.exports = async function (password_old, password_user) {
    return await bcryptjs.compare(password_old, password_user);
}