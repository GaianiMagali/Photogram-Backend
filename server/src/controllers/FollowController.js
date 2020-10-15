const { Op } = require("sequelize");

const User = require("../models/User");
const Follow = require("../models/Follow");


module.exports = {
    async store(request, response) {
        const { user_id } = request.params;

        const user = await User.findByPk(user_id);

        if (!user) return response.status(404).send({ message: "Usuario no encontrado" });

        if (user.id === request.userId) return response.status(400).send({ message: "No puedes seguirte a ti mismo" });

        const follow = await Follow.findOne({
            where: { [Op.and]: [{ user_to: user.id }, { user_from: request.userId }] }
        })

        if (follow) {
            await follow.destroy();
            return response.send()
        } else {
            await Follow.create({
                user_from: request.userId,
                user_to: user.id
            })
            return response.status(201).send()
        }
    }
}