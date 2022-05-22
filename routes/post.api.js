const express = require("express");
const router = express.Router();
const postController = require("../controller/post.controller");
const validators = require("../middlewares/validators");
const { loginRequired } = require("../middlewares/authentication");
const { header, body, param } = require("express-validator");

const { createNewPost, updatePost, deletePost, getSinglePost, getPostList } =
  postController;

/**
 * @route POST /posts
 * @description Create a new post
 * @access Login required
 */
router.post(
  "/create",
  loginRequired,
  validators.validate([
    header("title", "Missing title").exists().notEmpty(),
    body("content", "Missing content").exists().notEmpty(),
  ]),
  createNewPost
);

/**
 * @route GET /posts/user/:userId?page=1&limit=10
 * @description Get all posts an user can see with pagination
 * @access Login required
 */
router.get(
  "/postlist/:userId",
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  getPostList
);

/**
 * @route GET /posts/:id
 * @description Get a single post
 * @access Login required
 */
router.get(
  "/:id",
  loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  getSinglePost
);

/**
 * @route PUT /posts/:id
 * @description Update a post
 * @access Login required
 */
router.put(
  "/:id",
  loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    header("title", "Missing title").exists().notEmpty(),
    body("content", "Missing content").exists().notEmpty(),
  ]),
  updatePost
);

/**
 * @route DELETE /posts/:id
 * @description Delete a post
 * @access Login required
 */
router.delete(
  "/:id",
  loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  deletePost
);

module.exports = router;
