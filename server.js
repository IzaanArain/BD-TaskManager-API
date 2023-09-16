const express = require("express");
const colors = require("colors");
require("dotenv").config();
const Connect = require("./config/DBConnection");
const UserRoutes = require("./routes/UserRoutes");
const TaskRoutes= require("./routes/TaskRoutes");
const cors = require("cors");

const app = express();
//middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.hostname}${req.path}`.italic);
  next();
});
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/task", TaskRoutes);

Connect().then(() => {
  PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    // console.log(`Running Server on http://localhost:${PORT}/`.bold);
    console.log(
      `Running Server on Port:${PORT}`.yellow
    );
  });
});
