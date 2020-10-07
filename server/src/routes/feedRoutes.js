const { Router } = require("express");
const routes = Router();

const authMiddleware = require("../middleware/auth");
const FeedController = require("../controllers/FeedController");

//authMiddleware lo usan todas las rutas
routes.use(authMiddleware);

routes.get("/", FeedController.show)
routes.get("/follows", FeedController.showFollow)


module.exports = routes;