const { Router } = require("express");
const routes = Router();

const authMiddleware = require("../middleware/auth");
const ValidationComment = require("../validations/validationComment");
const CommentController = require("../controllers/CommentController");

routes.post("/:photo", ValidationComment.comment, authMiddleware, CommentController.store);

routes.put("/:idComment", ValidationComment.comment, authMiddleware, CommentController.update);

routes.delete("/:idComment", authMiddleware, CommentController.destroy);

module.exports = routes;