const Sequelize = require("sequelize");
const { validationResult } = require("express-validator");

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const User = require("../models/User");
const Photo = require("../models/Photo");
const Follow = require("../models/Follow");

const passwordHash = require('./utils/passwordHash');
const passwordCompare = require('./utils/passwordCompare');

const generateToken = require("./utils/generateToken");


module.exports = {
    async show(request, response) {
        const { username } = request.params;
        const { page, pageSize } = request.query;

        //Paginacion
        const user = await User.findOne({
            where: {
                username
            },
            attributes: { exclude: ["password", "updatedAt"] },
            include: [
                {
                    association: "photosUploads",
                    separete: true,
                    offset: page * pageSize,
                    limit: pageSize
                }
            ],
            group: ["User.id"]
        })

        if (!user) return response.status(404).send({ message: "Usuario no encontrado" })

        const count_photos = await Photo.findAll({ where: { user_id: user.id } });
        const count_follows = await Follow.findAll({ where: { user_from: user.id } });
        const count_followers = await Follow.findAll({ where: { user_to: user.id } });

        let isProfile = false;
        if (user.id === request.userId) isProfile = true;

        let isFollow = await Follow.findOne({
            where: {
                [Sequelize.Op.and]: [{ user_from: request.userId }, { user_to: user.id }]
            }
        })

        return response.json({
            user,
            count_photos: count_photos.length,
            count_follows: count_follows.length,
            count_followers: count_followers.length,
            isProfile,
            isFollow: isFollow ? true : false
        });
    },

    async showUserId(request, response) {
        const { id } = request.params;
        console.log(id);
        const { page, pageSize } = request.query;

        //Paginacion
        const user = await User.findOne({
            where: {
                id
            },
            attributes: { exclude: ["password", "updatedAt"] },
            group: ["User.id"]
        })

        if (!user) return response.status(404).send({ message: "Usuario no encontrado" })


        let isProfile = false;
        if (user.id === request.userId) isProfile = true;

        return response.json({
            user,
            isProfile,
        });
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

        promisify(fs.unlink)(path.resolve(__dirname, "../", "../", "tmp", "uploads", request.query.key))

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