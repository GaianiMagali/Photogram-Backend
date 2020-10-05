const { Router } = require("express");

const routes = Router();

const UserController = require('./controllers/UserController');

const ValidationsUser = require("./validations/validationUser");

routes.post('/users', ValidationsUser.withPassword, UserController.store);


routes.post("/users", UserController.store);


module.exports = routes;