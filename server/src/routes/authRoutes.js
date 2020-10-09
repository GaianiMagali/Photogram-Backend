const { Router } = require("express");
const routes = Router();

const AuthController = require("../controllers/AuthController");
const authMiddleware = require("../middleware/auth");
const ValidationAuth = require("../validations/validationAuth")


routes.post('/', ValidationAuth.login, AuthController.login);
routes.get('/me',authMiddleware, AuthController.me);

module.exports = routes;