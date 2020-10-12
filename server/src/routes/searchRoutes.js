const { Router } = require("express");

const routes = Router();

const authMiddleware = require("../middleware/auth");
const SearchController = require("../controllers/SearchController");


routes.get("/", authMiddleware, SearchController.search)


module.exports = routes;