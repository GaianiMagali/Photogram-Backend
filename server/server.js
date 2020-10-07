require("dotenv").config();
require("./src/database");
const express = require("express");
const path = require("path");
const appRoutes = require("./src/routes/index");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use("/files", express.static(path.resolve(__dirname, "./", "tmp", "uploads")));
app.use(appRoutes);



app.listen(process.env.PORT || 3333);