const { Op } = require("sequelize");

const Like = require("../models/Like");
const Photo = require("../models/Photo");

module.exports = {
    async store(request, response) {
        const { photo: photoId } = request.params;
        const { userId } = request;

        const photo = await Photo.findByPk(photoId);

        if (!photo)
            return response
                .status(400)
                .send({
                    message: "Ha ocurrido un error probablemente la foto fue removida"
                });

        let like = await Like.findOne({
            where: { [Op.and]: [{ photo_id: photo.id }, { user_id: userId }] }
        });

        if (!like) {
            let newLike = await Like.create({
                user_id: userId,
                photo_id: photo.id
            });
            return response.json(newLike);
        } else {
            await like.destroy();
            return response.send();
        }
    }
};

