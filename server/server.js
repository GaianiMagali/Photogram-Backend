require("dotenv").config();
require("./src/database");

const express = require("express");
const path = require("path");


const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const photoRoutes = require("./src/routes/photoRoutes");
const likeRoutes = require("./src/routes/likeRoutes");
const commentRoutes = require("./src/routes/commentRoutes");
const followRoutes = require("./src/routes/followRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use("/files", express.static(path.resolve(__dirname, "./", "tmp", "uploads")));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/photos", photoRoutes);
app.use("/likes", likeRoutes);
app.use("/comments", commentRoutes);
app.use("/follows", followRoutes);

app.listen(process.env.PORT || 3333);