const { Router } = require("express");
const multer = require("multer");
const multerconfig = require("./config/multer");

const routes = Router();

const authMiddleware = require("./middleware/auth");

const UserController = require('./controllers/UserController');
const AuthController = require('./controllers/AuthController');
const PhotoController = require('./controllers/PhotoController');
const LikeController = require('./controllers/LikeController');



const ValidationsUser = require("./validations/validationUser");
const ValidationAuth = require("./validations/validationAuth")

// ---------------Routes Authenticates---------------
routes.post('/auth',
    ValidationAuth.login,
    AuthController.login);
// ---------------Routes Authenticates---------------


// ---------------Routes Users---------------
routes.get('/users/:username',
    authMiddleware,
    UserController.show);

routes.post('/users',
    ValidationsUser.withPassword,
    UserController.store);


routes.put('/users',
    authMiddleware,
    ValidationsUser.withoutPassword,
    UserController.update);

routes.put("/password-update",
    authMiddleware,
    ValidationsUser.password,
    UserController.updatePassword);

routes.put("/avatar",
    authMiddleware,
    multer(multerconfig).single("file"), UserController.updateAvatar);

// ---------------Routes Users---------------


// ---------------Routes Photos---------------
routes.get("/photos/:id",
    authMiddleware,
    PhotoController.show
)

routes.post('/photos',
    authMiddleware,
    multer(multerconfig).single("file"),
    PhotoController.store
)

routes.delete('/photos/:id',
    authMiddleware,
    PhotoController.destroy
)
// ---------------Routes LIKES---------------
routes.post("/likes/:photo",
    authMiddleware,
    LikeController.store
)
// ---------------Routes LIKES---------------



module.exports = routes;