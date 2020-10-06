const { Router } = require("express");
const routes = Router();
const multer = require("multer");
const multerconfig = require("../config/multer");

const PhotoController = require('../controllers/PhotoController');

const authMiddleware = require("../middleware/auth");
routes.get("/:id", authMiddleware, PhotoController.show);

routes.post('/', authMiddleware, multer(multerconfig).single("file"), PhotoController.store);

routes.delete('/:id', authMiddleware, PhotoController.destroy);

module.exports = routes;