const Sequelize = require("sequelize");
const { validationResult } = require("express-validator");

const jwt = require("jsonwebtoken");

const User = require("../models/User");

const passwordHash = require('./utils/passwordHash');
const { use } = require("../routes");
const { update } = require("../models/User");

module.exports = {
    async show(request, response) {
        const { username } = request.params;

        //Paginacion

        const user = await User.findOne({
            where: {
                username
            },
            attributes: { exclude: ["password", "updatedAt"] }
        })

        if (!user) return response.status(404).send({
            message: "Usuario no encontrado"
        })

        return response.json(user);
    },

    async store(request, response) {
        const { name, email, username, password } = request.body;

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() })
        }

        let user = await User.findOne({
            where: { [Sequelize.Op.or]: [{ email }, { username }] }
        })

        if (user) {
            if (user.email === email) return response.status(400).json({ message: "Este email ya existe" })
            if (user.username === username) return response.status(400).json({ message: "Este usuario ya existe" })
        }

        //Hasheando password
        const passwordHashed = await passwordHash(password);


        user = await User.create({
            name,
            email,
            username,
            password: passwordHashed
        })

        //JWT
        const payload = { id: user.id, username: user.username };
        jwt.sign(payload, process.env.SIGNATURE_TOKEN, { expiresIn: 86400 },
            (error, token) => {
                if (error) throw error;
                return response.json({ token });
            })
    },

    async update(request, response) {
        const { name, email, username, phone, bio } = request.body;

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() })
        }

        await User.update(
            {
                name,
                email,
                username,
                phone,
                bio
            },
            {
                where:{id:request.userId}
            }
        )

            return response.json({message: "Actualizado correctamente"})
    }
}