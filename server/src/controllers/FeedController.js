const Sequelize = require("sequelize");
const User = require("../models/User");
const Photo = require("../models/Photo");

module.exports = {
    async show(request, response) {
        const { page, pageSize } = request.query;

        const user = await User.findByPk(request.userId,
            {
                attributes: [],
                include: [
                    {
                        association: "getFollows",
                        attributes: ["user_to"]
                    }
                ]
            }
        );

        let arrayUsers = user.getFollows.map(user => {
            return user.user_to;
        })

        arrayUsers.push(request.userId);

        const count = await Photo.count({
            where: {
                user_id: {
                    [Sequelize.Op.in]: arrayUsers
                }
            }
        })

        let photos = await Photo.findAll({
            offset: page * pageSize,
            limit: pageSize,
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
                        exclude: ["photo:_id", "updatedAt"]
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
            where: {
                user_id: {
                    [Sequelize.Op.in]: arrayUsers
                }
            },
            order: [["createdAt", "desc"]]
        });

        let newArray = photos.map(photo => {
            let isAuthor = false;

            if (photo.user_id === request.userId) isAuthor = true;

            let isLiked = false;
            photo.getLikes.map(like => {
                if (like.user_id === request.userId) isLiked = true;
            })

            return { isAuthor, isLiked, photo };
        })

        response.header("X-Total-Count", count);

        return response.json(newArray);
    },

    async showFollow(request, response) {
        const user = await User.findByPk(request.userId,
            {
                attributes: [],
                include: [
                    {
                        association: "getFollows",
                        attributes: ["user_to"]
                    }
                ]
            }
        );

        let arrayUsers = user.getFollows.map(user => {
            return user.user_to;
        })

        const follows = await User.findAll({
            attributes: {
                exclude: ["password", "createdAt", "updatedAt", "key", "bio", "phone"]
            },
            where: { id: { [Sequelize.Op.in]: arrayUsers } }
        });

        return response.json(follows);
    }
}