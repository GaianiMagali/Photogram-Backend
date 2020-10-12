const { Op } = require("sequelize");
const User = require("../models/User");

module.exports = {
    async search(request, response) {
        const { term } = request.query;

        const users = await User.findAll({
            attributes: ["id", "username", "name", "avatar_url"],
            where: {
                [Op.or]: [
                    { username: { [Op.iLike]: `%${term}%` } },
                    { name: { [Op.iLike]: `%${term}%` } },
                ]
            }
        })

        return response.json(users);
    }
}