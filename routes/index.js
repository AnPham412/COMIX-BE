const express = require("express");
const router = express.Router();

// userApi
const userRouter = require("./user.api");
router.use("/user", userRouter);

// postApi
const postRouter = require("./post.api");
router.use("/post", postRouter);

// commentApi
const commentRouter = require("./comment.api");
router.use("/comment", commentRouter);

// friendApi
const friendRouter = require("./friend.api");
router.use("/user/friend", friendRouter);

//comicApi
const comicRouter = require("./comic.api");
router.use("/view", comicRouter);

module.exports = router;
