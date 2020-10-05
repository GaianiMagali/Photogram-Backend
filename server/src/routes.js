const { Router } = require("express");

const routes = Router();

const authMiddleware = require("./middleware/auth");

const UserController = require('./controllers/UserController');

const ValidationsUser = require("./validations/validationUser");

routes.get('/users/:username',authMiddleware , UserController.show);
routes.post('/users', ValidationsUser.withPassword, UserController.store);
routes.put('/users',authMiddleware, ValidationsUser.withoutPassword, UserController.update);


routes.post("/users", UserController.store);


module.exports = routes;