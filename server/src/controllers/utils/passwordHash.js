const bcryptjs = require("bcryptjs");
 
const passwordHash = async (password) => {
    const salt = await bcryptjs.genSalt(10);
    const passwordHash =  await bcryptjs.hash(password, salt)
    return passwordHash;
}
 
module.exports = passwordHash;
