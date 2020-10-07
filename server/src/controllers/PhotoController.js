const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const Sequelize = require("sequelize");

const Photo = require("../models/Photo");
const Like = require("../models/Like");

module.exports = {

    async show(request, response) {
        const { id } = request.params;

        const photo = await Photo.findByPk(id, {
            attributes: {
                exclude: ["updatedAt"],
                include: [[Sequelize.fn("COUNT", Sequelize.col("getLikes")), "LikesCount"]]
            },
            include: [
                {
                    association: "uploadedBy",
                    attributes: ["username", "avatar_url"]
                },
                {
                    association: "getLikes",
                    attributes: []
                },
                {
                    association: "getComments",
                    attributes: ["id", "user_id", "body", "createdAt"],
                    include: {
                        association: "postedBy",
                        attributes: ["username", "avatar_url"]
                    }
                }
            ],
            group: [
                "uploadedBy.id",
                "Photo.id",
                "getComments.id",
                "getComments->postedBy.id"
            ]
        });

        if (!photo) return response.status(400).send({ message: "Foto no encontrada" })

        let isAuthor = false;
        if (request.userId === photo.user_id) isAuthor = true;

        let isLiked = false;
        let like = await Like.findOne({
            where: {
                [Sequelize.Op.and]: [{ photo_id: photo.id }, { user_id: request.userId }]
            }
        })

        if (like) isLiked = true;

        return response.json({ photo, isAuthor, isLiked });
    },

    async store(request, response) {
        const { filename: key } = request.file;
        const { body } = request.body;

        const url = `${process.env.APP_URL}/files/${key}`;

        const photoCreated = await Photo.create({
            user_id: request.userId,
            body,
            key,
            photo_url: url
        });

        const photo = await Photo.findByPk(photoCreated.id, {
            attributes: {
                exclude: ["updatedAt"]
            },
            include: [
                {
                    association: "uploadedBy",
                    attributes: ["username", "avatar_url"]
                },
                {
                    association: "getComments",
                    attributes: {
                        exclude: ["photo_id", "updatedAt"]
                    },
                    include: {
                        association: "postedBy",
                        attributes: ["username"]
                    },
                    limit: 3
                },
                {
                    association: "getLikes",
                    attributes: ["user_id"]
                }
            ],
            order: [["createdAt", "desc"]]
        });

        let isAuthor = false;
        if (photo.user_id === request.userId) isAuthor = true;
        let isLiked = false;
        photo.getLikes.map(like => {
            if (like.user_id === request.userId) isLiked = true;
        });

        return response.json({ isAuthor, isLiked, photo });
    },

    async destroy(request, response) {
        const { id } = request.params;
        const { key } = request.query;

        const photo = await Photo.findByPk(id);
        if (!photo) return response.status(400).send({ message: "Esta foto no existe" })

        if (photo.user_id !== request.userId) return response.status(401).send({ message: "No estas autorizado" });

        promisify(fs.unlink)(path.resolve(__dirname, "..", "..", "tmp", "uploads", key));

        await photo.destroy();

        return response.send();
    }

}