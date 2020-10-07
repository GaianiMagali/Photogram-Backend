const { Router } = require("express");
const routes = Router();

const authMiddleware = require("../middleware/auth");
const ValidationComment = require("../validations/validationComment");
const CommentController = require("../controllers/CommentController");

//authMiddleware lo usan todas las rutas
routes.use(authMiddleware);

routes.post("/:photo", ValidationComment.comment, CommentController.store);

routes.put("/:idComment", ValidationComment.comment, CommentController.update);

routes.delete("/:idComment", CommentController.destroy);

module.exports = routes;