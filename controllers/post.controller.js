const Post = require("../models/Post");

const { sendResponse, AppError, catchAsync } = require("../helpers/utils");

const User = require("../models/User");
const Comment = require("../models/Comment");
const Friend = require("../models/Friend");

// to update postCount
const calculatePostCount = async (userId) => {
  const postCount = await Post.countDocuments({
    author: userId,
    isDeleted: false,
  });

  // console.log("postCount:", postCount);
  // await User.findByIdAndUpdate(userId, { postCount });
  await User.findByIdAndUpdate(userId, { postCount }, { new: true });
};

const postController = {};

postController.createPost = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const { content, image } = req.body;

  // Validation

  // Process
  let post = await Post.create({ content, image, author: currentUserId });
  await calculatePostCount(currentUserId);
  post = await post.populate("author");

  // Send response
  return sendResponse(
    res,
    200,
    true,
    post,
    null,
    "Create a new post successfully"
  );
});

postController.updateSinglePost = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const postId = req.params.id;

  // Validate
  let post = await Post.findById(postId);
  if (!post) {
    throw new AppError(400, "Post not found", "Update Single Post Error");
  }
  // Only author allowed to update a post
  // post.author: ObjectId
  // use equals() for ObjectId
  if (!post.author.equals(currentUserId)) {
    throw new AppError(
      400,
      "Only post's author allowed to edit",
      "Update Single Post Error"
    );
  }

  // Process
  const allows = ["content", "image"];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      post[field] = req.body[field];
    }
  });
  await post.save();

  // Response
  return sendResponse(res, 200, true, post, null, "Update post successfully");
});

// GET /posts/user/:userId?page=1&limit=10
postController.getPosts = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const userId = req.params.userId;
  // let { page, limit, ...filter } = req.query;
  let { page, limit } = req.query;

  // Validation

  let user = await User.findById(userId);
  if (!user) {
    throw new AppError(400, "User not found", "Get Posts Error");
  }

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  // const filterConditions = [{ isDeleted: false }, { author: userId }];

  // Find userId's friends
  // returns array of objects { from, to, status }
  let userFriendIds = await Friend.find({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  });

  // Get friend IDs list
  if (userFriendIds && userFriendIds.length) {
    userFriendIds = userFriendIds.map((friend) => {
      if (friend.from._id.equals(userId)) {
        return friend.to;
      }
      return friend.from;
    });
  } else {
    userFriendIds = [];
  }

  // add the user to the userFriendIds
  userFriendIds = [...userFriendIds, userId];

  // const filterConditions = [
  //   { isDeleted: false },
  //   { author: userId },
  // ];

  // The users can see their friends' posts and theirs
  const filterConditions = [
    { isDeleted: false },
    { author: { $in: userFriendIds } },
  ];

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  // Process
  const count = await Post.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let posts = await Post.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");

  // Send response
  return sendResponse(
    res,
    200,
    true,
    { posts, totalPages, count },
    null,
    "Get posts successfully"
  );
});

postController.deleteSinglePost = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const postId = req.params.id;

  // Validate
  // let post = await Post.findById(postId);
  // if (!post) {
  //   throw new AppError(400, "Post not found", "Delete Single Post Error");
  // }

  // if (!post.author.equals(currentUserId)) {
  //   throw new AppError(
  //     400,
  //     "Only post's author allowed to delete the post",
  //     "Delete Single Post Error"
  //   );
  // }

  // Process
  // soft delete
  // { new: true } to return updated value
  const post = await Post.findOneAndUpdate(
    { _id: postId, author: currentUserId },
    { isDeleted: true },
    { new: true }
  );

  if (!post) {
    throw new AppError(
      400,
      "Post not found or User not authorized",
      "Delete Single Post Error"
    );
  }

  await calculatePostCount(currentUserId);

  // Response
  return sendResponse(res, 200, true, post, null, "Delete post successfully");
});

postController.getSinglePost = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const postId = req.params.id;

  // Validation
  let post = await Post.findById(postId);
  if (!post) {
    throw new AppError(400, "Post not found", "Get Single Post Error");
  }

  // Process
  // Get comments of the post and populate comments' author
  post = post.toJSON();
  post.comments = await Comment.find({ post: post._id }).populate("author");

  // Response
  return sendResponse(
    res,
    200,
    true,
    post,
    null,
    "Get single post successfully"
  );
});

postController.getCommentsOfPost = catchAsync(async (req, res, next) => {
  // Get data
  const currentUserId = req.userId;
  const postId = req.params.id;
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  // Validation
  let post = await Post.findById(postId);
  if (!post) {
    throw new AppError(400, "Post not found", "Get Comments Of Post Error");
  }

  // Process
  const count = await Comment.countDocuments({ post: postId });
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  // Get comments of the post

  let comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");

  // Response
  return sendResponse(
    res,
    200,
    true,
    { comments, totalPages, count },
    null,
    "Get comments on a post successfully"
  );
});

module.exports = postController;
