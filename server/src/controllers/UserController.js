const Sequelize = require("sequelize");
const { validationResult } = require("express-validator");

const jwt = require("jsonwebtoken");

const { sendEmail } = require("./utils/nodemailer");

// const fs = require("fs");
// const path = require("path");
// const { promisify } = require("util");

const User = require("../models/User");
const Photo = require("../models/Photo");
const Follow = require("../models/Follow");

const passwordHash = require('./utils/passwordHash');
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

    async destroy(request, response) {
        const { id } = request.params;
        console.log(id);

        const user = await User.findByPk(id);

        console.log(user);

        if (!user) return response.status(400).send({ message: "El usuario no existe" });

        let isProfile = false;
        if (user.id === request.userId) isProfile = true;

        await user.destroy();

        return response.send();
    },

    async forgotPassword(req, res) {

        if (!req.body) return res.status(400).json({ message: "No request body" });
        if (!req.body.email)
            return res.status(400).json({ message: "No Email in request body" });

        console.log("forgot password finding user with that email");
        const { email } = req.body;
        console.log("signin req.body", email);
        // find the user based on email

        const user = await User.findOne({ where: { email } });

        // if err or no user
        if (!user) return res.status("401").json({
            message: "El usuario con este mail no existe!"
        });

        //generate a token with user id and secret
        const token = jwt.sign(
            { _id: user.id, iss: "NODEAPI" },
            process.env.SIGNATURE_TOKEN
        );

        // email data
        const emailData = {
            from: "noreply@node-react.com",
            to: email,
            subject: "Password Reset Instructions",
            text: `Please use the following link to reset your password: ${process.env.CLIENT_URL
                }/reset-password/${token}`,
            html: `<p>Please use the following link to reset your password:</p> <p>${process.env.CLIENT_URL
                }/reset-password/${token}</p>`
        };

        await User.update({ reset_password_link: token }, { where: { id: user.id } });

        sendEmail(emailData);
        return res.status(200).json({
            message: `El mail ha sido enviado a ${email}. Siga las instrucciones para resetear su password.`
        });
    },

    async updatePassword(request, response) {
        const { reset_password_link, password } = request.body;

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() })
        }

        const user = await User.findOne({ where: { reset_password_link } });
        console.log(user);

        if (!user) return response.status("401").json({
            error: "Enlace invalido!"
        });

        const passwordHashed = await passwordHash(password);

        await User.update(
            { password: passwordHashed },
            { where: { reset_password_link } })

        return response.json({ message: "Se cambio la contraseña correctamente!" })
    },

    async updateAvatar(request, response) {
        const { filename: key } = request.file;

        // promisify(fs.unlink)(path.resolve(__dirname, "../", "../", "tmp", "uploads", request.query.key))

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
    },

    async deleteAvatar(request, response) {

        await User.update(
            {
                key: null,
                avatar_url: null
            },
            {
                where: { id: request.userId }
            }
        );

        return response.send();
    }
}