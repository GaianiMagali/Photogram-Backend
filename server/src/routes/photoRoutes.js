const { Router } = require("express");
const routes = Router();
const multer = require("multer");
const multerconfig = require("../config/multer");

const authMiddleware = require("../middleware/auth");
const PhotoController = require('../controllers/PhotoController');

//authMiddleware lo usan todas las rutas
routes.use(authMiddleware);

routes.get("/:id", PhotoController.show);

routes.post('/', multer(multerconfig).single("file"), PhotoController.store);

routes.delete('/:id', PhotoController.destroy);

module.exports = routes;