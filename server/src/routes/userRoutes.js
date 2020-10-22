const { Router } = require("express");
const multer = require("multer");
const multerconfig = require("../config/multer");

const routes = Router();

const authMiddleware = require("../middleware/auth");
const UserController = require("../controllers/UserController");

const ValidationsUser = require("../validations/validationUser");

routes.get('/:username', authMiddleware, UserController.show);

routes.get('/user/:id', authMiddleware, UserController.showUserId);

routes.post('/', ValidationsUser.withPassword, UserController.store);

routes.put('/', authMiddleware, ValidationsUser.withoutPassword, UserController.update);

routes.delete('/user/:id', authMiddleware, UserController.destroy);

routes.put("/password-update", authMiddleware, ValidationsUser.password, UserController.updatePassword);

routes.put("/forgot-password", UserController.forgotPassword)

routes.put("/avatar", authMiddleware, multer(multerconfig).single("file"), UserController.updateAvatar);

module.exports = routes;