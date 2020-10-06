const { Router } = require("express");
const routes = Router();

const authMiddleware = require("../middleware/auth");

const FollowController = require("../controllers/FollowController");

routes.post("/:user_id", authMiddleware, FollowController.store)

module.exports = routes;