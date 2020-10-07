const { Router } = require("express");

const appRoutes = Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const photoRoutes = require("./photoRoutes");
const likeRoutes = require("./likeRoutes");
const commentRoutes = require("./commentRoutes");
const followRoutes = require("./followRoutes");
const feedRoutes = require("./feedRoutes");
const searchRoutes = require("./searchRoutes");

appRoutes.use("/auth", authRoutes);
appRoutes.use("/users", userRoutes);
appRoutes.use("/photos", photoRoutes);
appRoutes.use("/likes", likeRoutes);
appRoutes.use("/comments", commentRoutes);
appRoutes.use("/follows", followRoutes);
appRoutes.use("/feeds", feedRoutes);
appRoutes.use("/search", searchRoutes);

module.exports = appRoutes;