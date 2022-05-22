const express = require("express");
const router = express.Router();
const commentController = require("../controller/comment.controller");
const validators = require("../middlewares/validators");
const { loginRequired } = require("../middlewares/authentication");
const { body, param } = require("express-validator");

const {
  createNewComment,
  updateComment,
  deleteComment,
  replyComment,
  getAllCommentsByPostId,
} = commentController;

/**
 * @route POST api/comments
 * @description Create a new comment
 * @access Login required
 */
router.post(
  "/create/:postId",
  loginRequired,
  validators.validate([
    body("content", "Missing content").exists().notEmpty(),
    body("postId", "Missing postId")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
  ]),
  createNewComment
);

/**
 * @route PUT api/comments/:id
 * @description Update a comment
 * @access Login required
 */
router.put(
  "/update/:id",
  loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    body("content", "Missing content").exists().notEmpty(),
  ]),
  updateComment
);

/**
 * @route DELETE api/comments/:id
 * @description Delete a comment
 * @access Login required
 */
router.delete(
  "/:id",
  loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  deleteComment
);

router.get("/all/:postId", getAllCommentsByPostId);

router.put("/:id", loginRequired, replyComment);

module.exports = router;
