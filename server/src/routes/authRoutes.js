const { Router } = require("express");
const routes = Router();

const AuthController = require("../controllers/AuthController");

const ValidationAuth = require("../validations/validationAuth")


routes.post('/', ValidationAuth.login, AuthController.login);


module.exports = routes;