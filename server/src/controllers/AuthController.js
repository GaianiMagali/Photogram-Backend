const User = require("../models/User");
const { validationResult } = require("express-validator");

const passwordCompare = require("./utils/passwordCompare");
const generateToken = require("./utils/generateToken");

const _ = require("lodash");

module.exports = {
    async me(request, response) {

        const user = await User.findByPk(request.userId, {
            attributes: ['id', 'username', 'name', 'avatar_url']
        });

        return response.json(user);
    },

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
    },

    async authWithGoogle(request, response) {
        const { user } = request.body;
        console.log(user);

        let userRegister = await User.findOne({ where: { email: user.email } });
        //Crear un nuevo usuario y login
        if (!userRegister) {
            userRegister = await User.create({ ...user });
            console.log(userRegister);
            const payload = { id: userRegister.id, username: userRegister.username };
            const token = generateToken(payload);

            return response.json(token);
        } else {
            userRegister = _.extend(userRegister, user);
            console.log('else');

            await User.update(
                userRegister,
                {
                    where: { id: userRegister.id }
                }
            )

            const payload = { id: userRegister.id, username: userRegister.username };
            const token = generateToken(payload);

            return response.json(token);
        }
    }
}
