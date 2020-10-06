const Sequelize = require("sequelize");
const { validationResult } = require("express-validator");

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const User = require("../models/User");

const passwordHash = require('./utils/passwordHash');
const passwordCompare = require('./utils/passwordCompare');

const generateToken = require("./utils/generateToken");


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

        //Se repite en todas
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
        const token = generateToken(payload);

        return response.json({ token });
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
                where: { id: request.userId }
            }
        )

        return response.json({ message: "Actualizado correctamente" })
    },

    async updatePassword(request, response) {
        const { password_old, password, password_confirm } = request.body;

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() })
        }

        const user = await User.findByPk(request.userId);

        if (!(await passwordCompare(password_old, user.password))) return response.status(400).json({ message: "No coincide la contraseña antigua" })

        if (password !== password_confirm) return response.status(400).json({ message: "Los passwords no son iguales" })

        const passwordHashed = await passwordHash(password);

        await User.update(
            { password: passwordHashed },
            { where: { id: request.userId } })

        return response.json({ message: "Se cambio la contraseña correctamente" })
    },

    async updateAvatar(request, response) {
        const { filename: key } = request.file;

        promisify(fs.unlink)(path.resolve(__dirname, "..", "..", "tmp", "uploads", request.query.key))

        // console.log(fs.unlink);

        const url = `${process.env.APP_URL}/files/${key}`;

        await User.update(
            {
                key,
                avatar_url: url
            },
            {
                where: { id: request.userId }
            }
        );

        return response.json({ avatar_url: url });
    }
};