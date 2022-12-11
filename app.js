const express = require("express");
const authorizeRoute = require("./src/middleware/authorizeRoute");
const usersRoutes = require("./src/routes/users");
const postsRoutes = require("./src/routes/posts");
const commentsRoutes = require("./src/routes/comments");
const likesRoutes = require("./src/routes/likes");

const app = express();

app.use(express.json());

app.get("/api", (req, res) => {
	res.status(200).json({ alive: "True" });
});

// Register routes
app.use("/api/users", usersRoutes);
app.use("/api/posts", authorizeRoute, postsRoutes);
app.use("/api/comments", authorizeRoute, commentsRoutes);
app.use("/api/likes", authorizeRoute, likesRoutes);


module.exports = app;