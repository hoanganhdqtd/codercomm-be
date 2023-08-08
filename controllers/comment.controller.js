const Comment = require("../models/Comment");

const Post = require("../models/Post");
const { AppError, catchAsync, sendResponse } = require("../helpers/utils");

const commentController = {};

const calculateCommentCount = async (postId) => {
  const commentCount = await Comment.countDocuments({
    post: postId,
    // isDeleted: false,
  });

  // console.log("commentCount:", commentCount);
  await Post.findByIdAndUpdate(postId, { commentCount });
  // await Post.findByIdAndUpdate(postId, { commentCount }, { new: true });
};

commentController.createComment = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const { content, postId } = req.body;

  console.log("postId:", postId);

  // Validation
  // check if post with postId exists
  let post = await Post.findById(postId);
  if (!post) {
    throw new AppError(400, "Post not found", "Create new comment error");
  }

  // Process
  // create new comment
  let comment = await Comment.create({
    author: currentUserId,
    post: postId,
    content,
  });

  // update commentCount of the post
  // ?
  await calculateCommentCount(postId);
  comment = await comment.populate("author");

  // Send response
  return sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "Create a new comment successfully"
  );
});

commentController.updateSingleComment = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const commentId = req.params.id;
  const { content } = req.body;

  // Validate

  // Process
  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, author: currentUserId },
    { content },
    { new: true }
  );

  if (!comment) {
    throw new AppError(
      400,
      "Comment not found or User not authorized",
      "Update Single Comment Error"
    );
  }

  // Send response
  return sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "Update single comment successfully"
  );
});

commentController.deleteSingleComment = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const commentId = req.params.id;

  // Validate

  // Process

  // const comment = await Comment.findOneAndUpdate(
  //   { _id: commentId, author: currentUserId },
  //   { isDeleted: true },
  //   { new: true }
  // );

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    author: currentUserId,
  });

  if (!comment) {
    throw new AppError(
      400,
      "Comment not found or User not authorized",
      "Delete Single Comment Error"
    );
  }

  await calculateCommentCount(comment.post);

  // Send response
  return sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "Delete single comment successfully"
  );
});

commentController.getSingleComment = catchAsync(async (req, res, next) => {
  // Get data
  // const currentUserId = req.userId;
  const commentId = req.params.id;

  // Validate

  // Process

  // const comment = await Comment.findOneAndUpdate(
  //   { _id: commentId, author: currentUserId },
  //   { isDeleted: true },
  //   { new: true }
  // );

  let comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError(400, "Comment not found", "Get Single Comment Error");
  }

  // Send response
  return sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "Get single comment successfully"
  );
});

module.exports = commentController;
