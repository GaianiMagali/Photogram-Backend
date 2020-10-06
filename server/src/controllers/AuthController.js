const User = require("../models/User");
const { validationResult } = require("express-validator");

const passwordCompare = require("./utils/passwordCompare");
const generateToken = require("./utils/generateToken");

module.exports = {
    async login(request, response) {
        const { username, password } = request.body;

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() })
        }

        let user = await User.findOne({ where: { username } })
        if (!user) return response.status(400).send({ message: "verifique sus credenciales" })

        if (!(await passwordCompare(password, user.password))) return response.status(400).send({ message: "verifique sus credenciales" });

        const payload = { id: user.id, username: user.username };
        const token = generateToken(payload);

        return response.json({ token });
    }
}