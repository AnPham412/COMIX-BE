const { AppError, catchAsync, sendResponse } = require("../helpers/utils");
const Comment = require("../models/Comment");
const Post = require("../models/Post");

const commentController = {};
const calculateCommentCount = async (postId) => {
  const commentCount = await Comment.countDocuments({ post: postId });
  await Post.findByIdAndUpdate(postId, { commentCount: commentCount });
};

// 1. User can create a comment
commentController.createNewComment = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const { content, postId } = req.body;

  const post = Post.findById(postId);
  if (!post)
    throw new AppError(404, "Post not found", "Create New Comment Error");

  let comment = await Comment.create({
    author: userId,
    post: postId,
    content,
  });
  await calculateCommentCount(postId);
  comment = await comment.populate("author");

  return sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "Create new comment successful"
  );
});

//2. Comment author can update their comment
commentController.updateComment = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const commentId = req.params.id;
  const { content } = req.body;

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, author: userId },
    { content },
    { new: true }
  );
  if (!comment)
    throw new AppError(
      400,
      "Comment not found or User not authorized",
      "Update Comment Error"
    );
  await comment.populate("author");
  await comment.save();
  return sendResponse(res, 200, true, comment, null, "Update successful");
});

//3. Comment author can delete their comment
commentController.deleteComment = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const commentId = req.params.id;

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    author: userId,
  });
  if (!comment)
    throw new AppError(
      400,
      "Comment not found or User not authorized",
      "Delete Comment Error"
    );
  await calculateCommentCount(comment.post);

  return sendResponse(res, 200, true, comment, null, "Delete successful");
});

//4.user can reply comment
commentController.replyComment = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const commentId = req.params.id;
  const reply = req.body;
  const post = Post.findById(postId);
  const comment = await Comment.findOne({
    _id: commentId,
  });
  if (!comment)
    throwError(404, "comment not found or post deleted", "reply comment error");

  if (!post) throwError(404, "post deleted", "reply comment error");

  if (!reply) throwError(400, "missing reply content", "reply comment error");

  await comment.populate("author");
  await comment.save();
  return sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "reply comment successful"
  );
});

//5.user can see comments while not logged in
commentController.getAllCommentsByPostId = catchAsync(
  async (req, res, next) => {
    const { postId } = req.params;
    const post = Post.findById(postId);
    const commentId = req.params.id;
    const commentList = await Comment.find({ _id: commentId });

    if (!post) throwError(404, "post deleted", "get comment error");

    let { page, limit, sort, reply } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    sort = sort === "asc" ? -1 : 1;
    const filterCriteria =
      reply === "missing" ? { $and: [{ post }, { reply: "" }] } : { post };

    const count = calculateCommentCount.length;
    const totalPage = Math.ceil(count / limit);

    let offset = count - limit * page;
    if (offset < 0) {
      limit = limit + offset;
      offset = 0;
    }

    commentList = await Comment.find(filterCriteria)
      .sort({ createdAt: sort })
      .skip(offset)
      .limit(limit)
      .populate("author");
    return sendResponse(
      res,
      200,
      true,
      { commentList, totalPage, count },
      null,
      "get all comment by job id successful"
    );
  }
);

module.exports = commentController;
